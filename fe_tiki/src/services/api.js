import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Thêm token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// PRODUCT
export const getProducts = async (params = {}) => {
  // Tạo một URLSearchParams object để dễ dàng xây dựng query string
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.limit) queryParams.append('limit', params.limit);
  // Thêm các tham số khác nếu cần

  const queryString = queryParams.toString();
  const url = `/products${queryString ? `?${queryString}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Hàm mới để gọi API tìm kiếm sản phẩm
export const searchProducts = async (name) => {
  // Nếu không có tên (chuỗi rỗng), không cần gọi API, trả về mảng rỗng
  if (!name) return { data: [] };
  // Gọi đến endpoint GET /products/search với query `name`
  const response = await api.get(`/products/search?name=${name}`);
  // Trả về dữ liệu từ response
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/users/login", credentials);
  return response.data;
};

// CART
export const getCart = async ({ page = 1, user_id, session_id }) => {
  const params = { page };

  if (user_id) params.user_id = user_id;
  else if (session_id) params.session_id = session_id;

  const response = await api.get(`/carts`, { params });
  return response.data;
};

export const getCartById = async (id) => {
  const response = await api.get(`/carts/${id}`);
  return response.data;
};

export const createCart = async () => {
  const userDataRaw = localStorage.getItem("userData");
  const storedUser = JSON.parse(userDataRaw || "{}");

  let payload = {};

  if (storedUser?.id) {
    payload.user_id = storedUser.id;
  } else {
    let currentSessionId = localStorage.getItem("session_id");
    if (!currentSessionId) {
      currentSessionId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("session_id", currentSessionId);
    }
    payload.session_id = currentSessionId;
  }

  const response = await api.post("/carts", payload);
  return response.data;
};

export const addToCart = async (product_variant_id, cart_id, quantity) => {
  const response = await api.post("/cartitems", {
    product_variant_id,
    cart_id,
    quantity,
  });
  return response.data;
};

export const checkout = async (cartId, total, note, phone, address) => {
  const response = await api.post("/carts/checkout", {
    cart_id: cartId,
    total,
    note: note || null, // Note không bắt buộc, mặc định null nếu không có
    phone,
    address,
  });
  return response.data;
};

export const deleteCartItem = async (id) => {
  const response = await api.delete(`/cartitems/${id}`);
  return response.data;
};

// BRAND
export const getBrands = async (page = 1) => {
  const response = await api.get(`/brands?page=${page}`);
  return response.data;
};

export const getBrandById = async (id) => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

export const createBrand = async (data) => {
  const response = await api.post("/brands", data);
  return response.data;
};

export const updateBrand = async (id, data) => {
  const response = await api.put(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id) => {
  const response = await api.delete(`/brands/${id}`);
  return response.data;
};

// CATEGORY
export const getCategories = async () => {
  const allCategories = [];
  let page = 1;
  let more = true;
  while (more) {
    const response = await api.get(`/categories?page=${page}`);
    allCategories.push(...response.data.data);
    more = page < response.data.totalPages;
    page++;
  }
  return allCategories;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// BANNER
export const getBanners = async (page = 1) => {
  const response = await api.get(`/banners?page=${page}`);
  return response.data;
};

//ORDER
export const getOrders = async ({ page = 1, user_id, session_id }) => {
  const params = { page };

  if (user_id) params.user_id = user_id;
  else if (session_id) params.session_id = session_id;

  const response = await api.get(`/orders`, { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export default api;
