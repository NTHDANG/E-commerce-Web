import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProductById,
  getProducts,
  addToCart,
  getCart,
  createCart,
} from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Tách mảng thành nhiều mảng nhỏ (dùng cho gợi ý sản phẩm)
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const baseUrl = import.meta.env.VITE_API_IMAGE_BASE_URL;

  // Lấy ảnh đầu tiên của sản phẩm (nếu không có thì dùng ảnh mặc định)
  const getFirstImageUrl = useCallback(
    (product) => {
      const url = product?.product_images?.[0]?.image_url;
      const imageUrl = url ? `${baseUrl}/${url}` : "/no-image.png";
      console.log("ProductDetail - Image URL:", imageUrl); // Thêm log
      return imageUrl;
    },
    [baseUrl]
  );

  // Query chi tiết sản phẩm
  const {
    data: productData,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const product = productData?.data;
  console.log("Main Product Data:", product);

  useEffect(() => {
    if (product && !selectedVariant) {
      setSelectedVariant(product.product_variant_values?.[0] || null);
    }
  }, [product, selectedVariant]);

  // Query sản phẩm gợi ý
  const {
    data: suggestedProductsData,
    isLoading: isSuggestedProductsLoading,
    isError: isSuggestedProductsError,
  } = useQuery({
    queryKey: ["suggestedProducts"],
    queryFn: async () => {
      const results = await Promise.all([getProducts(1), getProducts(2)]);
      const allProducts = results.flatMap((res) => res?.products || []);
      const uniqueProductIds = new Set();
      const uniqueProducts = allProducts.filter((product) => {
        if (product && product.id && !uniqueProductIds.has(product.id)) {
          uniqueProductIds.add(product.id);
          return true;
        }
        return false;
      });
      return uniqueProducts.slice(0, 12);
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const suggestedProducts = useMemo(() => {
    const products = suggestedProductsData || [];
    console.log("Suggested Products Data:", products);
    return products;
  }, [suggestedProductsData]);

  // Lấy thông tin user từ localStorage (có thể chuyển sang context/global state nếu cần)
  const user = useMemo(() => {
    const token = localStorage.getItem("token");
    const userDataRaw = localStorage.getItem("userData");
    return token ? JSON.parse(userDataRaw || "{}") : null;
  }, []);

  // Query giỏ hàng hiện tại (để lấy cartId)
  const { data: cartQueryData } = useQuery({
    queryKey: ["cart", user?.id || localStorage.getItem("session_id")],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const sessionId = localStorage.getItem("session_id");
      if (token && user?.id) {
        return getCart({ user_id: user.id });
      } else if (sessionId) {
        return getCart({ session_id: sessionId });
      }
      return null;
    },
    enabled: !!(user?.id || localStorage.getItem("session_id")), // Chỉ fetch khi có user hoặc session
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const currentCart = cartQueryData?.data?.[0];

  // Mutation để tạo giỏ hàng mới
  const createCartMutation = useMutation({
    mutationFn: createCart,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]); // Invalidate cache giỏ hàng để fetch lại
      toast.success("Giỏ hàng mới đã được tạo!");
    },
    onError: () => {
      toast.error("Không thể tạo giỏ hàng mới.");
    },
  });

  // Mutation để thêm sản phẩm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: ({ productVariantId, cartId, quantity }) =>
      addToCart(productVariantId, cartId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]); // Invalidate cache giỏ hàng để fetch lại
      toast.success("Đã thêm vào giỏ hàng!");
    },
    onError: () => {
      toast.error("Thêm vào giỏ hàng thất bại!");
    },
  });

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant)
      return toast.error("Vui lòng chọn biến thể sản phẩm!");

    const productVariantId = selectedVariant.id;
    let cartIdToUse = currentCart?.id;

    if (!cartIdToUse) {
      // Nếu chưa có giỏ hàng, tạo mới
      try {
        const newCartResponse = await createCartMutation.mutateAsync();
        cartIdToUse = newCartResponse.data.id;
      } catch {
        return;
      }
    }

    addToCartMutation.mutate({
      productVariantId,
      cartId: cartIdToUse,
      quantity,
    });
  }, [
    selectedVariant,
    quantity,
    currentCart,
    createCartMutation,
    addToCartMutation,
  ]);

  // Chia sản phẩm gợi ý thành từng hàng
  const chunkedSuggestedProducts = useMemo(() => {
    return suggestedProducts && suggestedProducts.length > 0
      ? chunkArray(suggestedProducts, 6)
      : [];
  }, [suggestedProducts]);

  const isLoading = isProductLoading || isSuggestedProductsLoading;
  const isError = isProductError || isSuggestedProductsError;

  if (isLoading) return <div className="text-center p-4">Đang tải...</div>;
  if (isError)
    return (
      <div className="text-center p-4">
        Đã xảy ra lỗi khi tải dữ liệu sản phẩm.
      </div>
    );
  if (!product)
    return <div className="text-center p-4">Sản phẩm không tồn tại</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Thông tin chi tiết sản phẩm */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={getFirstImageUrl(product)}
          alt={product.name}
          className="w-full md:w-1/3 h-64 object-cover rounded"
          onError={(e) => (e.target.src = "/no-image.png")}
        />

        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold text-tiki-red">{product.name}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {parseInt(selectedVariant?.price || 0).toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-gray-500 line-through">
            {parseInt(selectedVariant?.old_price || 0).toLocaleString("vi-VN")}{" "}
            VNĐ
          </p>

          {/* Biến thể sản phẩm */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Biến thể:</h3>
            {product.product_variant_values.map((variant) => (
              <button
                key={variant.sku}
                onClick={() => setSelectedVariant(variant)}
                className={`mr-2 mb-2 px-4 py-2 rounded ${
                  selectedVariant?.sku === variant.sku
                    ? "bg-tiki-blue text-white"
                    : "bg-gray-200"
                }`}
              >
                {variant.name} ({variant.stock || 0} còn)
              </button>
            ))}
          </div>

          {/* Số lượng và nút thêm giỏ */}
          <div className="flex items-center mt-4 gap-3 justify-center">
            <label htmlFor="quantity" className="font-medium">
              Số lượng:
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
            />
            <button
              onClick={handleAddToCart}
              className="bg-tiki-red text-white px-9 py-3 rounded hover:bg-red-700 text-lg"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Gợi ý sản phẩm */}
      <h2 className="text-lg font-bold mb-3 text-tiki-text-gray mt-10">
        Sản phẩm gợi ý cho bạn
      </h2>
      {chunkedSuggestedProducts &&
        chunkedSuggestedProducts.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 mb-6">
            {row &&
              row.map((item) => (
                <Link
                  to={`/product/${item.id}`}
                  key={`${rowIndex}-${item.id}`}
                  className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                >
                  <img
                    src={getFirstImageUrl(item)}
                    alt={item.name}
                    className="w-full h-36 object-cover rounded"
                    onError={(e) => (e.target.src = "/no-image.png")}
                  />
                  <div>
                    <h2 className="text-sm font-normal text-tiki-text-gray line-clamp-2">
                      {item.name || "Tên không xác định"}
                    </h2>
                    <div className="flex items-center text-yellow-500 text-xs mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={`${item.id}-${i}`}
                          icon={faStar}
                          className={
                            i < Math.floor(Math.random() * 5)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}{" "}
                      ({Math.floor(Math.random() * 1000) + 1})
                    </div>
                    <p className="text-tiki-red font-bold text-base mt-1">
                      {item.product_variant_values?.[0]?.price?.toLocaleString(
                        "vi-VN"
                      ) || "0"}{" "}
                      ₫
                    </p>
                    {item.product_variant_values?.[0]?.old_price && (
                      <p className="text-gray-500 line-through text-xs">
                        {item.product_variant_values[0].old_price.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        ))}
    </div>
  );
};

export default ProductDetail;
