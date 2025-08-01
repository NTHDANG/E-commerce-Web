import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getBrandById } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons"; // Không cần faCopyright nữa
import { useState } from "react";

// Component để hiển thị trang danh sách sản phẩm theo thương hiệu
const BrandPage = () => {
  const { brandId } = useParams();
  const [page, setPage] = useState(1);

  const { data: brandData, isLoading: isBrandLoading } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => getBrandById(brandId),
    enabled: !!brandId,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", { brand: brandId, page: page }],
    queryFn: () => getProducts({ brand: brandId, page: page }),
    enabled: !!brandId,
  });

  const brandName = brandData?.data?.name || "Thương hiệu";
  const products = productsData?.products || [];

  if (isBrandLoading || isProductsLoading) {
    return <div className="container mx-auto my-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto my-10">
      {/* Tiêu đề trang - Mẫu 3: Dạng thẻ (Card-like Header) - Đã đổi màu */}
      <div className="bg-white p-8 rounded-lg shadow-xl flex items-center justify-between mb-10 border-l-8 border-tiki-blue"> {/* Đổi border-tiki-red thành border-tiki-blue */}
        <div>
          <p className="text-xl text-gray-600 font-medium">Khám phá các sản phẩm từ:</p>
          <h1 className="text-4xl font-extrabold text-tiki-text-gray mt-2">
            Thương hiệu: <span className="text-tiki-blue">{brandName}</span> {/* Đổi text-tiki-red thành text-tiki-blue */}
          </h1>
        </div>
      </div>

      {/* Lưới hiển thị sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img 
                src={product.product_images?.[0]?.image_url ? `${import.meta.env.VITE_API_IMAGE_BASE_URL}/${product.product_images[0].image_url}` : '/no-image.png'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
                <div className="flex items-center mt-2">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                  <span className="text-gray-600 ml-1">{product.total_ratings}</span>
                </div>
                <p className="text-xl font-bold text-red-600 mt-2">
                  {product.product_variant_values?.[0]?.price.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>Không có sản phẩm nào thuộc thương hiệu này.</p>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
