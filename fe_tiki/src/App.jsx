import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Order from "./pages/Order";
import UserProfile from "./pages/UserProfile";
import LayoutWithHeader from "./components/LayoutWithHeader";
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
          <Route path="/carts/:id" element={<Cart />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Route>

        {/* Trang không có header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <ToastContainer autoClose={2000} />
    </Router>
  );
}

export default App;
