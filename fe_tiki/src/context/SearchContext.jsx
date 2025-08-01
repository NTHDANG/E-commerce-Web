import React, { createContext, useContext } from 'react';

// Tạo Context cho dữ liệu tìm kiếm
const SearchContext = createContext(null);

// Custom hook để dễ dàng sử dụng SearchContext
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Component Provider để cung cấp dữ liệu tìm kiếm cho các component con
export const SearchProvider = ({ children, value }) => {
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
