import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getBrands,
  getCategories,
  getBanners,
} from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faTag,
  faStar,
  faFire,
  faExchangeAlt,
  faBolt,
  faEye,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useSearch } from "../context/SearchContext"; // Import useSearch hook

// Các hàm trợ giúp để lấy URL hình ảnh
const getBrandImageUrl = (brand) =>
  brand?.image ? brand.image : "/no-image.png";
const getBannerImageUrl = (banner) =>
  banner?.image ? banner.image : "/no-image.png";

// Component Home
const Home = () => {
  const [page, setPage] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_IMAGE_BASE_URL;

  // Lấy searchResults và isSearchLoading từ SearchContext
  const { searchResults, isSearchLoading } = useSearch();

  // Hàm lấy URL ảnh đầu tiên của sản phẩm
  const getFirstImageUrl = useCallback(
    (product) => {
      if (!product?.product_images?.length) return "/no-image.png";
      const imageUrl = product.product_images[0].image_url;
      return `${baseUrl}/${imageUrl}`;
    },
    [baseUrl]
  );

  // Query để lấy danh sách sản phẩm mặc định (phân trang)
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts({ page: page, search: "" }),
    // Query này sẽ không được kích hoạt nếu có kết quả tìm kiếm
    // Query này sẽ luôn được kích hoạt, việc hiển thị sẽ dựa vào searchResults
  });

  // Các query khác cho categories, brands, banners
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(1),
  });
  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: () => getBanners(1),
  });

  // Lấy dữ liệu từ các query, có xử lý giá trị mặc định
  const defaultProducts = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData || [];
  const brands = brandsData?.data?.slice(0, 6) || [];
  const banners = bannersData?.data?.slice(0, 3) || [];

  // Xác định danh sách sản phẩm sẽ được hiển thị
  // Ưu tiên hiển thị kết quả tìm kiếm nếu có
  const displayProducts =
    searchResults && searchResults.length > 0 ? searchResults : defaultProducts;

  // Xác định tiêu đề cho danh sách sản phẩm
  const productListTitle =
    searchResults && searchResults.length > 0
      ? "Kết quả tìm kiếm"
      : "Sản phẩm gợi ý cho bạn";

  // Effect cho banner tự động chuyển
  useEffect(() => {
    let interval;
    if (banners.length > 0) {
      // Điều kiện nằm bên trong callback của useEffect
      interval = setInterval(() => {
        setCurrentBannerIndex((i) => (i + 1) % banners.length);
      }, 3000);
    }
    return () => {
      // Cleanup function luôn được trả về
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [banners.length]); // Dependency array vẫn là banners.length

  // Xử lý trạng thái loading chung của trang
  const isPageLoading =
    productsLoading || categoriesLoading || brandsLoading || bannersLoading;
  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  // Xử lý lỗi chung
  if (productsError) {
    return (
      <div className="flex justify-center items-center h-screen">
        Lỗi tải sản phẩm.
      </div>
    );
  }

  return (
    <div className="bg-tiki-light-gray min-h-screen font-sans">
      <div className="container mx-auto flex py-4 space-x-4">
        {/* Sidebar danh mục */}
        <aside className="w-56 bg-white p-4 rounded-lg shadow-sm flex-shrink-0">
          <h2 className="text-lg font-semibold mb-3">Danh Mục</h2>
          <ul className="space-y-2 text-lg">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.id}`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-tiki-blue cursor-pointer"
                >
                  <FontAwesomeIcon icon={faStore} />
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 space-y-4">
          {/* Banner slider */}
          <div className="relative w-full h-64 overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
            >
              {banners.map((b) => (
                <div key={b.id} className="w-full h-full flex-shrink-0">
                  <img
                    src={getBannerImageUrl(b)}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-3 text-tiki-text-gray">
              Thương hiệu nổi bật
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {brands.map((b) => (
                <Link
                  to={`/brand/${b.id}`}
                  key={b.id}
                  className="bg-white p-3 rounded-lg shadow-sm flex flex-col items-center"
                >
                  <img
                    src={getBrandImageUrl(b)}
                    alt={b.name || "Thương hiệu"}
                    className="w-24 h-24 object-cover rounded-full mb-2"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                      e.target.onError = null;
                    }}
                  />
                  <h3 className="text-sm font-semibold text-tiki-text-gray line-clamp-1">
                    {b.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Giảm đến {Math.floor(Math.random() * 50) + 10}%
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Phần sản phẩm gợi ý / kết quả tìm kiếm */}
          <h2 className="text-lg font-bold mb-3 text-tiki-text-gray">
            {productListTitle}
          </h2>

          {/* Xử lý hiển thị khi đang tìm kiếm */}
          {isSearchLoading && (
            <div className="text-center p-10">Đang tìm kiếm...</div>
          )}

          {/* Xử lý hiển thị khi không có kết quả */}
          {!isSearchLoading && searchResults && searchResults.length === 0 && (
            <div className="text-center p-10">Không tìm thấy sản phẩm nào.</div>
          )}

          {/* Lưới hiển thị sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayProducts.map((p) => (
              <Link
                to={`/product/${p.id}`}
                key={p.id}
                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={getFirstImageUrl(p)}
                  alt={p.name || "Sản phẩm"}
                  className="w-full h-36 object-cover rounded mb-2"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
                <div>
                  <h2 className="text-sm font-normal text-gray-800 line-clamp-2 h-10">
                    {p.name}
                  </h2>
                  <div className="flex items-center text-xs mt-1">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-gray-500 ml-1">({p.total_ratings || 0}+)</span>
                  </div>
                  <p className="text-red-600 font-bold text-base mt-1">
                    {p.product_variant_values?.[0]?.price.toLocaleString(
                      "vi-VN"
                    ) || "N/A"}{" "}
                    ₫
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Chỉ hiển thị phân trang khi không có tìm kiếm */}
          {!searchResults && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-tiki-blue text-white rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-tiki-blue text-white rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
