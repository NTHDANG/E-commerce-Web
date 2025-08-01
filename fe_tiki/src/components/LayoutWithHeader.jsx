import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SearchProvider } from "../context/SearchContext"; // Import SearchProvider

// Component Layout chính, bao gồm Header, Footer và nội dung trang
function LayoutWithHeader() {
  // State để lưu trữ và quản lý chuỗi tìm kiếm từ người dùng
  const [searchQuery, setSearchQuery] = useState("");

  // Sử dụng useQuery để fetch dữ liệu tìm kiếm sản phẩm
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["productSearch", searchQuery],
    queryFn: () => searchProducts(searchQuery),
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Giá trị sẽ được cung cấp qua Context
  const searchContextValue = {
    searchResults: searchResults?.data,
    isSearchLoading,
  };

  return (
    <SearchProvider value={searchContextValue}> {/* Bọc toàn bộ nội dung bằng SearchProvider */}
      {/* Truyền state và hàm cập nhật state xuống cho Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Outlet sẽ render component con tương ứng với route */}
      <Outlet />

      <Footer />
    </SearchProvider>
  );
}

export default LayoutWithHeader;
