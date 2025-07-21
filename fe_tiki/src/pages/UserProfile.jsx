import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getUserById, updateUser } from "../services/api";

const UserProfile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    // Thêm các trường khác nếu cần
  });

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Fetch thông tin người dùng
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: !!id, // Chỉ fetch khi có ID
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  // Cập nhật formData khi dữ liệu người dùng được fetch
  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        phone: userData.data.phone || "",
        address: userData.data.address || "",
        // Cập nhật các trường khác
      });
    }
  }, [userData]);

  // Mutation để cập nhật thông tin người dùng
  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateUser(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries(["user", id]); // Invalidate cache để fetch lại dữ liệu mới
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật thông tin thất bại!"
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate ngay khi người dùng nhập
    if (name === "email") {
      validateEmail(value);
    } else if (name === "phone") {
      validatePhone(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Email không hợp lệ.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (phone && !phoneRegex.test(phone)) {
      setPhoneError("Số điện thoại không hợp lệ (10 hoặc 11 chữ số).");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Chạy tất cả các validation trước khi submit
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);

    if (!isEmailValid || !isPhoneValid) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  if (isLoading)
    return (
      <div className="text-center p-4">Đang tải thông tin người dùng...</div>
    );
  if (isError)
    return (
      <div className="text-center p-4">
        Đã xảy ra lỗi khi tải thông tin người dùng.
      </div>
    );
  if (!userData?.data)
    return (
      <div className="text-center p-4">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Thông tin tài khoản
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tên:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tiki-blue focus:border-tiki-blue"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tiki-blue focus:border-tiki-blue"
              placeholder="Nhập email của bạn"
              disabled // Không cho phép chỉnh sửa email
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại:
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tiki-blue focus:border-tiki-blue"
              placeholder="Nhập số điện thoại của bạn"
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Địa chỉ:
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tiki-blue focus:border-tiki-blue"
              placeholder="Nhập địa chỉ của bạn"
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-fit bg-tiki-red text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              disabled={
                updateProfileMutation.isLoading || emailError || phoneError
              }
            >
              {updateProfileMutation.isLoading
                ? "Đang cập nhật..."
                : "Cập nhật thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
