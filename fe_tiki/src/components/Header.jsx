import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, createCart } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShoppingBasket,
  faUser,
  faMapMarkerAlt,
  faBoxOpen,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Hàm debounce để tối ưu hóa tìm kiếm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Component Header
function Header() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy thông tin user từ localStorage
  const userData = useMemo(() => {
    const token = localStorage.getItem("token");
    const userDataRaw = localStorage.getItem("userData");
    return token ? JSON.parse(userDataRaw || "{}") : null;
  }, []);

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  // Lấy thông tin giỏ hàng bằng React Query
  const { data: cartData } = useQuery({
    queryKey: ["cart", user?.id, localStorage.getItem("session_id")],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const userDataRaw = localStorage.getItem("userData");
      const user = token ? JSON.parse(userDataRaw || "{}") : null;
      const sessionId = localStorage.getItem("session_id");

      if (token && user?.id) {
        return getCart({ user_id: user.id });
      } else if (sessionId) {
        return getCart({ session_id: sessionId });
      }
      return null;
    },
    enabled: !!(user?.id || localStorage.getItem("session_id")), // Chỉ fetch khi có user hoặc session
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const cartCount = cartData?.data?.[0]?.cart_items?.length || 0;

  // Mutation để tạo giỏ hàng mới
  const createCartMutation = useMutation({
    mutationFn: createCart,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["cart"]); // Invalidate cache giỏ hàng để fetch lại
      navigate(`/carts/${response.data.id}`);
    },
    onError: (error) => {
      console.error("Lỗi khi tạo giỏ hàng:", error);
      toast.error("Không thể tạo giỏ hàng mới.");
    },
  });

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("session_id"); // Xóa session_id khi logout
    setUser(null);
    queryClient.invalidateQueries(["cart"]); // Invalidate cart cache khi logout
    navigate("/login");
  }, [navigate, queryClient]);

  // Xử lý click vào giỏ hàng
  const handleCartClick = useCallback(async () => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("session_id");

    if (!token && !sessionId) {
      toast.info("Hãy thêm sản phẩm vào giỏ hàng trước!");
      return;
    }

    const currentCart = cartData?.data?.[0];

    if (currentCart?.id) {
      navigate(`/carts/${currentCart.id}`);
    } else {
      // Nếu chưa có giỏ hàng, tạo mới
      createCartMutation.mutate();
    }
  }, [navigate, cartData, createCartMutation]);

  // Xử lý click vào đơn hàng
  const handleOrderClick = useCallback(() => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("session_id");

    if (!token && !sessionId) {
      toast.info("Bạn cần đăng nhập để xem đơn hàng!");
      return;
    }

    navigate("/orders");
  }, [navigate]);

  // Debounced search handler (chưa sử dụng trực tiếp, chỉ để chuẩn bị)
  const debouncedSearch = debounce((value) => setSearch(value), 300);

  return (
    <div className="bg-white shadow-sm pt-7 pr-5 pb-5 pl-5 sticky top-0 z-50 border-b border-tiki-border-gray">
      <div className="container mx-auto flex items-center">
        <Link to="/" className="flex-1 basis-1/5">
          <img
            src="/assets/logo-tiki.png"
            alt="Tiki Logo"
            className="h-20 object-contain"
          />
        </Link>
        <div className="flex-[3] basis-2/5 mx-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm trên Tiki"
            className="w-full p-2 pl-10 border border-tiki-border-gray rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tiki-blue"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <div className="flex items-center space-x-6 flex-1 basis-1/5 justify-end">
          <Link
            to="/orders"
            onClick={(e) => {
              e.preventDefault();
              handleOrderClick();
            }}
            className="relative"
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="h-6 w-6 cursor-pointer text-tiki-text-gray hover:text-tiki-blue"
              title="Đơn hàng"
            />
          </Link>
          <Link
            to="/carts"
            onClick={(e) => {
              e.preventDefault();
              handleCartClick();
            }}
            className="relative"
          >
            <FontAwesomeIcon
              icon={faShoppingBasket}
              className="h-6 w-6 cursor-pointer text-tiki-text-gray hover:text-tiki-blue"
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-tiki-red text-white text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link
                to={`/users/${user.id}`}
                className="flex items-center space-x-1 text-sm text-tiki-blue font-medium hover:underline"
              >
                <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                <span>{user.name || "User"}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="h-9 w-6 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center"
                title="Đăng xuất"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 text-sm bg-tiki-blue text-white px-4 py-2 rounded-lg hover:bg-tiki-dark-blue transition"
            >
              <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
              <span>Tài khoản</span>
            </Link>
          )}
        </div>
      </div>

      {/* Sub-header for location and links */}
      <div className="container mx-auto flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1 ml-auto">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-tiki-blue h-4"
          />
          <span>Giao đến:</span>
          <span className="font-semibold text-tiki-text-gray">Cần Thơ</span>
          <span className="text-tiki-blue ml-1 cursor-pointer">
            Đổi địa chỉ
          </span>
        </div>
      </div>
    </div>
  );
}

export default Header;
