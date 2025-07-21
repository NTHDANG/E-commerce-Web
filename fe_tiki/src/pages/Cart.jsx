import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkout,
  getCartById,
  deleteCartItem,
  addToCart,
  getUserById,
} from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const phoneRegex = /^[0-9]{10,11}$/;

const Cart = () => {
  const token = localStorage.getItem("token");
  const localUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  const session_id = localStorage.getItem("session_id") || null;
  const userId = token ? localUserData?.id : null;

  const [shippingInfo, setShippingInfo] = useState({
    name: localUserData?.name || "",
    phone: localUserData?.phone || "",
    address: localUserData?.address || "",
    note: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartId = window.location.pathname.split("/carts/")[1];

  const { data: fetchedUserData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchedUserData?.data) {
      setShippingInfo((prev) => ({
        ...prev,
        name: fetchedUserData.data.name || prev.name,
        phone: fetchedUserData.data.phone || prev.phone,
        address: fetchedUserData.data.address || prev.address,
      }));
    }
  }, [fetchedUserData]);

  const missingUserPhone = useMemo(() => {
    return (
      token && (!shippingInfo.phone || !phoneRegex.test(shippingInfo.phone))
    );
  }, [token, shippingInfo.phone]);

  useEffect(() => {
    if (token && shippingInfo.phone && !phoneRegex.test(shippingInfo.phone)) {
      setPhoneError("Số điện thoại đã lưu không hợp lệ. Vui lòng cập nhật.");
    } else {
      setPhoneError("");
    }
  }, [token, shippingInfo.phone]);

  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
  } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => getCartById(cartId),
    enabled: !!cartId,
    staleTime: 5 * 60 * 1000,
  });

  const cartItems = (cartData?.data?.cart_items || []).map((item) => {
    return {
      ...item,
      product_variant: item.product_variant_value,
      imageUrl:
        item.product_variant_value.product_images?.[0]?.image_url ||
        "/no-image.png",
    };
  });

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + parseInt(item.product_variant?.price || 0) * (item.quantity || 0),
    0
  );

  const updateCartItemMutation = useMutation({
    mutationFn: ({ productVariantId, cartId, newQuantity }) =>
      addToCart(productVariantId, cartId, newQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", cartId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      toast.error("Cập nhật giỏ hàng thất bại!");
    },
  });

  const handleQuantityChange = (productVariantId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemMutation.mutate({ productVariantId, cartId, newQuantity });
  };

  const deleteCartItemMutation = useMutation({
    mutationFn: (itemId) => deleteCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", cartId]);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    },
    onError: (error) => {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Xóa sản phẩm thất bại!");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (data) =>
      checkout(data.cartId, data.total, data.note, data.phone, data.address),
    onSuccess: (response) => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries(["cart", cartId]);
      if (response?.data?.order?.id) navigate("/orders");
    },
    onError: (error) => {
      console.error(
        "Lỗi khi đặt hàng:",
        error.response?.data?.message || error.message
      );
      toast.error("Đặt hàng thất bại!");
    },
  });

  const validatePhone = (phone) => {
    if (!phoneRegex.test(phone)) {
      setPhoneError("Số điện thoại không hợp lệ (10 hoặc 11 chữ số).");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleCheckout = () => {
    const { phone, address, note } = shippingInfo;
    if (!validatePhone(phone)) {
      toast.error("Vui lòng nhập số điện thoại hợp l���.");
      return;
    }
    checkoutMutation.mutate({
      cartId,
      total: totalAmount,
      note,
      phone,
      address,
    });
  };

  const isCheckoutDisabled =
    phoneError !== "" ||
    (token &&
      (shippingInfo.address.trim() === "" ||
        (missingUserPhone && shippingInfo.phone.trim() === ""))) ||
    (!token &&
      (shippingInfo.name.trim() === "" ||
        shippingInfo.phone.trim() === "" ||
        shippingInfo.address.trim() === ""));

  const renderShippingInput = (label, field, required = true) => (
    <div className="mb-2">
      <input
        type="text"
        value={shippingInfo[field]}
        onChange={(e) => {
          setShippingInfo({ ...shippingInfo, [field]: e.target.value });
          if (field === "phone") {
            validatePhone(e.target.value);
          }
        }}
        placeholder={`Nhập ${label}${required ? " (bắt buộc)" : ""}`}
        className="w-full p-1 border rounded"
      />
      {required && shippingInfo[field].trim() === "" && (
        <p className="text-red-500 text-xs mt-1">{label} là bắt buộc!</p>
      )}
      {field === "phone" && phoneError && (
        <p className="text-red-500 text-xs mt-1">{phoneError}</p>
      )}
    </div>
  );

  if (isCartLoading) return <div className="text-center p-4">Đang tải...</div>;
  if (isCartError)
    return (
      <div className="text-center p-4">Đã xảy ra lỗi khi tải giỏ hàng.</div>
    );
  if (!cartItems.length)
    return <div className="text-center p-4">Giỏ hàng trống</div>;

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">GIỎ HÀNG</h1>
        <div className="hidden md:grid grid-cols-6 gap-4 mb-3 text-gray-600 text-sm font-semibold">
          <div className="col-span-2">Sản phẩm</div>
          <div>Đơn giá</div>
          <div>Số lượng</div>
          <div>Thành tiền</div>
          <div></div>
        </div>

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-6 gap-4 items-center bg-white p-4 rounded-lg shadow mb-4"
          >
            <div className="col-span-1">
              <img
                src={item.imageUrl}
                alt={item.product?.name || "Hình sản phẩm"}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
            <div className="col-span-1">
              <h2 className="text-base font-semibold">
                {item.product_variant?.product_name}
              </h2>
              <p className="text-sm text-gray-500">
                Biến thể: {item.product_variant?.name} (SKU:{" "}
                {item.product_variant?.sku || "N/A"})
              </p>
            </div>
            <div>
              {parseInt(item.product_variant?.price || 0).toLocaleString()}₫
            </div>
            <div>
              <input
                type="number"
                min="1"
                value={item.quantity || 0}
                onChange={(e) =>
                  handleQuantityChange(
                    item.product_variant_id,
                    parseInt(e.target.value)
                  )
                }
                className="w-16 p-1 border rounded"
              />
            </div>
            <div className="font-semibold text-tiki-red">
              {(
                parseInt(item.product_variant?.price || 0) *
                (item.quantity || 0)
              ).toLocaleString()}
              ₫
            </div>
            <div>
              <button
                onClick={() => deleteCartItemMutation.mutate(item.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow h-fit">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Giao tới</h2>
        <div className="text-sm mb-4">
          {token ? (
            <>
              <p className="font-semibold">{shippingInfo.name || "Khách"}</p>
              {missingUserPhone ? (
                renderShippingInput("số điện thoại", "phone")
              ) : (
                <p>{shippingInfo.phone}</p>
              )}
              {renderShippingInput("địa chỉ", "address")}
              {renderShippingInput("ghi chú", "note", false)}
            </>
          ) : session_id ? (
            <>
              {renderShippingInput("tên", "name")}
              {renderShippingInput("số điện thoại", "phone")}
              {renderShippingInput("địa chỉ", "address")}
              {renderShippingInput("ghi chú", "note", false)}
            </>
          ) : (
            <p>Không có thông tin giao hàng</p>
          )}
        </div>

        <hr className="my-3" />
        <div className="flex justify-between text-base font-bold text-gray-800">
          <span>Tổng đơn hàng</span>
          <span className="text-tiki-red">{totalAmount.toLocaleString()}₫</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckoutDisabled}
          className="w-full bg-tiki-red text-white font-semibold py-2 mt-4 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
};

export default Cart;
