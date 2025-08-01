// Trang Dashboard chính của khu vực Admin
const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Đây là các thẻ thống kê mẫu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Sản phẩm</h2>
          <p className="text-3xl font-bold mt-2">1,250</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Đơn hàng mới</h2>
          <p className="text-3xl font-bold mt-2">52</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Doanh thu (Tháng)</h2>
          <p className="text-3xl font-bold mt-2">150,000,000 ₫</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Người dùng mới</h2>
          <p className="text-3xl font-bold mt-2">15</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
