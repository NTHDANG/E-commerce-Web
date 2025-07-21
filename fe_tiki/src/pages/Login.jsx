import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const Login = () => {
  // Trạng thái cho input và lỗi
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      localStorage.removeItem("session_id"); // Xóa session_id khi đăng nhập
      localStorage.setItem("token", response.token);
      localStorage.setItem("userData", JSON.stringify(response.data));
      navigate("/");
    },
    onError: (error) => {
      if (error.response) {
        const msg = error.response.data.message;
        switch (error.response.status) {
          case 400:
            toast.error(msg || "Vui lòng nhập đúng thông tin đăng nhập.");
            break;
          case 404:
            toast.error(msg || "Không tìm thấy tài khoản.");
            break;
          case 401:
            toast.error(msg || "Sai mật khẩu.");
            break;
          default:
            toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
        }
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng kiểm tra kết nối.");
      }
    },
  });

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailOrPhone.trim()) {
      toast.error("Vui lòng nhập email hoặc số điện thoại để đăng nhập.");
      return;
    }

    const credentials = { password };
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (emailRegex.test(emailOrPhone)) {
      credentials.email = emailOrPhone;
    } else {
      credentials.phone = emailOrPhone;
    }

    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen w-screen bg-cyan-50 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full">
        {/* Cột trái: form đăng nhập */}
        <div className="w-full md:w-1/2 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Xin chào
          </h1>
          <p className="text-sm text-gray-600 mb-6">Đăng nhập để tiếp tục</p>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input email/sđt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhập Email hoặc Số điện thoại
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Nhập số điện thoại hoặc email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiki-red"
              />
            </div>
            {/* Input mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiki-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-600 bg-transparent focus:outline-none"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            {/* Hiển thị lỗi nếu có */}
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full bg-tiki-red text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 text-lg font-medium"
            >
              {loginMutation.isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            {/* Liên kết đăng ký */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-tiki-blue font-medium">
                Đăng ký
              </Link>
            </p>
            {/* Điều khoản sử dụng */}
            <p className="text-center text-xs text-gray-500 mt-2">
              Bằng việc tiếp tục, bạn đã đọc và đồng ý với{" "}
              <a href="#" className="text-tiki-blue underline">
                điều khoản sử dụng
              </a>{" "}
              của Tiki
            </p>
          </form>
        </div>

        {/* Cột phải: hình ảnh và mô tả */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-6 flex flex-col items-center bg-blue-100 rounded-3xl p-4">
          <img
            src="/assets/login-tiki.png"
            alt="Tiki Assistant"
            className="w-3/4 md:w-full max-w-xs"
          />
          <p className="text-lg text-tiki-blue font-semibold mt-4">
            Mua sắm tại Tiki
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            Sử dụng tài khoản Tiki của bạn để mua sắm dễ dàng hơn
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
