import { Navigate, Outlet } from "react-router-dom";
import { useMemo } from "react";

// Component để bảo vệ các route chỉ dành cho Admin
const ProtectedRoute = () => {
  // Lấy thông tin người dùng từ localStorage
  const user = useMemo(() => {
    const userDataRaw = localStorage.getItem("userData");
    return userDataRaw ? JSON.parse(userDataRaw) : null;
  }, []);

  // Kiểm tra xem người dùng có tồn tại và có vai trò là 'ADMIN' hay không
  const isAdmin = user && user.role === 2;

  // Nếu là admin, cho phép truy cập vào các component con (thông qua Outlet)
  // Nếu không, điều hướng người dùng về trang chủ
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
