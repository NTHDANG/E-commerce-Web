import { useState } from "react";
import { getOrders, getOrderById } from "../services/api";
import { useQuery, useQueries } from "@tanstack/react-query";

// Bản đồ trạng thái đơn hàng
const ORDER_STATUS_MAP = {
  1: "Chờ xử lý",
  2: "Đang xử lý",
  3: "Đã giao",
  4: "Hoàn thành",
  5: "Đã hủy",
  6: "Hoàn tiền",
  7: "Thất bại",
};

const Order = () => {
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy thông tin user hoặc session cho API
  const getAuthParams = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("userData") || "{}");
      return { user_id: user.id };
    }
    const session_id = localStorage.getItem("session_id");
    return { session_id: session_id || null };
  };

  const authParams = getAuthParams();

  // Query danh sách đơn hàng
  const { data: ordersData, isLoading: isOrdersLoading, isError: isOrdersError, error: ordersError } = useQuery({
    queryKey: ["orders", currentPage, authParams.user_id, authParams.session_id],
    queryFn: () => getOrders({ page: currentPage, ...authParams }),
    enabled: !!(authParams.user_id || authParams.session_id), // Chỉ fetch khi có user_id hoặc session_id
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const ordersList = ordersData?.data || [];
  const totalPages = ordersData?.totalPages || 1;

  // Query chi tiết cho mỗi đơn hàng
  const orderDetailsQueries = useQueries({
    queries: ordersList.map((order) => ({
      queryKey: ["orderDetail", order.id],
      queryFn: () => getOrderById(order.id),
      staleTime: 5 * 60 * 1000, // 5 phút
    })),
  });

  const ordersWithDetails = ordersList.map((order, index) => {
    const detail = orderDetailsQueries[index]?.data?.data;
    return { ...order, order_details: detail?.order_details || [] };
  });

  const isLoading = isOrdersLoading || orderDetailsQueries.some(query => query.isLoading);
  const isError = isOrdersError || orderDetailsQueries.some(query => query.isError);
  const error = ordersError || orderDetailsQueries.find(query => query.isError)?.error;

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
  };

  if (isLoading) return <div className="text-center p-4">Đang tải...</div>;
  if (isError) return <div className="text-center p-4 text-red-500">{error?.message || "Đã xảy ra lỗi khi tải đơn hàng."}</div>;
  if (!ordersWithDetails.length)
    return <div className="text-center p-4">Không tìm thấy đơn hàng nào.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        ĐƠN HÀNG CỦA BẠN
      </h1>

      {/* Danh sách đơn hàng */}
      <div className="grid gap-6">
        {ordersWithDetails.map((order) => (
          <div
            key={order.id}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-6 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản bên trái */}
              <div className="p-4 flex flex-col">
                <h2 className="text-lg font-semibold">Đơn hàng #{order.id}</h2>
                <p className="text-sm text-gray-600">
                  Ngày đặt:{" "}
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-sm text-gray-600">
                  Trạng thái:{" "}
                  {ORDER_STATUS_MAP[order.status] || "Không xác định"}
                </p>
                <p className="text-sm text-gray-600">
                  Địa chỉ: {order.address}
                </p>
                <p className="text-sm text-gray-600">SĐT: {order.phone}</p>
                <p className="text-sm text-gray-600">
                  Ghi chú: {order.note || "Không có"}
                </p>

                {/* Tổng tiền */}
                <div className="mt-auto pt-4 text-center">
                  <p className="text-lg text-red-600 font-medium bg-red-50 px-3 py-1 rounded-xl inline-block">
                    Tổng tiền: {parseInt(order.total).toLocaleString()}₫
                  </p>
                </div>
              </div>

              {/* Chi tiết đơn hàng bên phải */}
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Chi tiết đơn hàng:
                </h3>

                {/* Tiêu đề bảng */}
                <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 mb-2 pb-2 border-b">
                  <div>Sản phẩm</div>
                  <div className="text-center">Số lượng</div>
                  <div className="text-right">Đơn giá</div>
                  <div className="text-right">Tổng</div>
                </div>

                <div className="space-y-3">
                  {order.order_details?.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-4 items-center p-3 rounded-md shadow-sm hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium">
                        {item.product_variant_value?.name || "Không xác định"}
                      </div>
                      <div className="text-sm text-center">{item.quantity}</div>
                      <div className="text-sm text-right">
                        {parseInt(item.price).toLocaleString()}₫
                      </div>
                      <div className="text-sm text-right text-red-600 font-medium">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Order;
