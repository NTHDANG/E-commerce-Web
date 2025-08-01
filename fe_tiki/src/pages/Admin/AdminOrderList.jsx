import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../services/api";
import { Link } from "react-router-dom";

const AdminOrderList = () => {
  const { data: ordersData, isLoading } = useQuery({ 
    queryKey: ["orders"], 
    queryFn: () => getOrders({ limit: 100 })
  });

  if (isLoading) return <div>Đang tải đơn hàng...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quản lý Đơn hàng</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Người dùng</th>
            <th className="py-2">Tổng tiền</th>
            <th className="py-2">Trạng thái</th>
            <th className="py-2">Ngày tạo</th>
            <th className="py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {ordersData?.data?.map((order) => (
            <tr key={order.id}>
              <td className="border px-4 py-2">{order.id}</td>
              <td className="border px-4 py-2">{order.user_id || 'Khách'}</td>
              <td className="border px-4 py-2">{order.total?.toLocaleString('vi-VN')} ₫</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="border px-4 py-2">
                <Link to={`/admin/orders/${order.id}`} className="bg-green-500 text-white px-2 py-1 rounded">Xem</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList;
