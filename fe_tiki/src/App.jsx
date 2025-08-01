import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage"; // Import trang danh mục
import BrandPage from "./pages/BrandPage"; // Import trang thương hiệu
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Order from "./pages/Order";
import UserProfile from "./pages/UserProfile";
import LayoutWithHeader from "./components/LayoutWithHeader";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import AdminLayout from "./pages/Admin/AdminLayout"; // Import AdminLayout
import AdminDashboard from "./pages/Admin/AdminDashboard"; // Import AdminDashboard
import AdminProductList from "./pages/Admin/AdminProductList"; // Import AdminProductList
import AdminProductForm from "./pages/Admin/AdminProductForm"; // Import AdminProductForm
import AdminCategoryList from "./pages/Admin/AdminCategoryList";
import AdminCategoryForm from "./pages/Admin/AdminCategoryForm";
import AdminBrandList from "./pages/Admin/AdminBrandList";
import AdminBrandForm from "./pages/Admin/AdminBrandForm";
import AdminOrderList from "./pages/Admin/AdminOrderList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Các trang có header dùng chung */}
        <Route element={<LayoutWithHeader />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} /> {/* Route cho trang danh mục */}
          <Route path="/brand/:brandId" element={<BrandPage />} /> {/* Route cho trang thương hiệu */}
          <Route path="/carts/:id" element={<Cart />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Route>

        {/* Trang không có header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các trang trong khu vực Admin, được bảo vệ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="categories/new" element={<AdminCategoryForm />} />
            <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
            <Route path="brands" element={<AdminBrandList />} />
            <Route path="brands/new" element={<AdminBrandForm />} />
            <Route path="brands/edit/:id" element={<AdminBrandForm />} />
            <Route path="orders" element={<AdminOrderList />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer autoClose={2000} />
    </Router>
  );
}

export default App;
