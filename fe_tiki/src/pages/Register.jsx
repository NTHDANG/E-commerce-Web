import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from 'react-toastify';

const Register = () => {
  // State quản lý form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      toast.success(response.message || "Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    },
    onError: (error) => {
      console.error("Lỗi đăng ký:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        toast.error(
          message ||
            "Cần cung cấp ít nhất một trong hai: email hoặc số điện thoại."
        );
      } else if (status === 409) {
        toast.error(
          message ||
            "Email hoặc số điện thoại đã được đăng ký, vui lòng chọn thông tin khác."
        );
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    },
  });

  // Xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Bắt buộc phải nhập email hoặc số điện thoại
    if (!email.trim() && !phone.trim()) {
      toast.error(
        "Cần cung cấp ít nhất một trong hai: email hoặc số điện thoại."
      );
      return;
    }

    // Chuẩn bị dữ liệu gửi
    const credentials = {
      name: name.trim(),
      password: password.trim(),
    };
    if (email.trim()) credentials.email = email.trim();
    if (phone.trim()) credentials.phone = phone.trim();

    registerMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen w-screen bg-cyan-50 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full">
        {/* Form đăng ký */}
        <div className="w-full md:w-1/2 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Chào mừng!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Tạo tài khoản để tiếp tục
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiki-red"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiki-red"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiki-red"
              />
            </div>

            {/* Mật khẩu */}
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
                  required
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

            {/* Thông báo lỗi */}
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={registerMutation.isLoading}
              className="w-full bg-tiki-red text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 text-lg font-medium"
            >
              {registerMutation.isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {/* Chuyển đến đăng nhập */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-tiki-blue font-medium">
                Đăng nhập
              </Link>
            </p>

            {/* Điều khoản sử dụng */}
            <p className="text-center text-xs text-gray-500 mt-2">
              Bằng việc tiếp tục, bạn đã đồng ý với{" "}
              <a href="#" className="text-tiki-blue underline">
                điều khoản sử dụng
              </a>{" "}
              của Tiki
            </p>
          </form>
        </div>

        {/* Hình ảnh bên phải */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-6 flex flex-col items-center bg-blue-100 rounded-3xl p-4">
          <img
            src="/assets/login-tiki.png"
            alt="Tiki Assistant"
            className="w-3/4 md:w-full max-w-xs"
          />
          <p className="text-lg text-tiki-blue font-semibold mt-4">
            Trở thành thành viên của Tiki
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            Tạo tài khoản để mua sắm và nhận nhiều ưu đãi hấp dẫn
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
