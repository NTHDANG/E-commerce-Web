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

const getBrandImageUrl = (brand) => {
  const url = brand?.image ? brand.image : "/no-image.png";
  // console.log("Brand image URL:", url);
  return url;
};

const getBannerImageUrl = (banner) => {
  const url = banner?.image ? banner.image : "/no-image.png";
  // console.log("Banner image URL:", url);
  return url;
};

const Home = () => {
  const [page, setPage] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_IMAGE_BASE_URL;

  const getFirstImageUrl = useCallback(
    (product) => {
      if (!product?.product_images?.length) return "/no-image.png";
      const imageUrl = product.product_images[0].image_url;
      const fullUrl = `${baseUrl}/${imageUrl}`;
      // console.log("Home - Image URL:", fullUrl);
      return fullUrl;
    },
    [baseUrl]
  );

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts(page, ""),
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    data: brandsData,
    isLoading: brandsLoading,
    isError: brandsError,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(1),
  });

  const {
    data: bannersData,
    isLoading: bannersLoading,
    isError: bannersError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => getBanners(1),
  });

  const products = productsData?.products || [];
  // console.log("products", products);
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData || [];
  const brands = brandsData?.data?.slice(0, 6) || [];
  const banners = bannersData?.data?.slice(0, 3) || [];

  const isLoading =
    productsLoading || categoriesLoading || brandsLoading || bannersLoading;
  const isError =
    productsError || categoriesError || brandsError || bannersError;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((i) => (i + 1) % banners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-tiki-red">Đang tải...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-500">
          Đã xảy ra lỗi khi tải dữ liệu.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tiki-light-gray min-h-screen font-sans">
      <div className="container mx-auto flex py-4 space-x-4">
        <aside className="w-56 bg-white p-4 rounded-lg shadow-sm flex-shrink-0">
          <h2 className="text-lg font-semibold mb-3 text-tiki-text-gray">
            Danh Mục Nổi Bật
          </h2>
          <ul className="space-y-2 text-lg">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center space-x-2 text-gray-700 hover:text-tiki-blue cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faStore}
                  className="text-3xl text-gray-600"
                />
                <span>{cat.name}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 space-y-4">
          <div className="relative w-full">
            <div
              ref={bannerRef}
              className="w-full h-64 overflow-hidden rounded-lg shadow-sm"
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentBannerIndex * 100}%)`,
                }}
              >
                {banners.map((b, i) => (
                  <div
                    key={b.id}
                    className="w-full h-64 flex-shrink-0"
                    style={{ minWidth: "100%" }}
                  >
                    <img
                      src={getBannerImageUrl(b)}
                      alt={`Banner ${i + 1}`}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                        e.target.onError = null;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                setCurrentBannerIndex(
                  (i) => (i - 1 + banners.length) % banners.length
                )
              }
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={() =>
                setCurrentBannerIndex((i) => (i + 1) % banners.length)
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between text-xs text-tiki-text-gray">
            {[
              { name: "Mã giảm giá", icon: faTag },
              { name: "Sản phẩm đã xem", icon: faEye },
              { name: "TikiNow 2H", icon: faBolt },
              { name: "Đổi trả dễ dàng", icon: faExchangeAlt },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-1 cursor-pointer hover:text-tiki-blue"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="w-8 h-8 text-tiki-blue"
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          <section className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-tiki-red flex items-center">
                <FontAwesomeIcon icon={faFire} className="h-6 w-6 mr-2" /> FLASH
                SALE
              </h2>
              <div className="flex items-center text-sm text-gray-600">
                Kết thúc sau:
                <span className="bg-tiki-red text-white px-2 py-0.5 rounded ml-2">
                  00:00:00
                </span>
                <Link to="#" className="ml-4 text-tiki-blue hover:underline">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products.slice(0, 6).map((p) => (
                <Link
                  to={`/product/${p.id}`}
                  key={p.id}
                  className="bg-white rounded-lg shadow p-2 border relative"
                >
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg">
                    -{Math.floor(Math.random() * 50) + 10}%
                  </div>
                  <img
                    src={getFirstImageUrl(p)}
                    alt={p.name || "Sản phẩm"}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                      e.target.onError = null;
                    }}
                  />
                  <h3 className="text-sm font-medium text-tiki-text-gray line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-tiki-red font-bold text-lg mt-1">
                    {p.product_variant_values &&
                    p.product_variant_values.length > 0
                      ? p.product_variant_values[0].price.toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}{" "}
                    ₫
                  </p>
                  <p className="text-gray-500 line-through text-xs">
                    {p.product_variant_values &&
                    p.product_variant_values.length > 0 &&
                    p.product_variant_values[0].old_price
                      ? p.product_variant_values[0].old_price.toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}{" "}
                    ₫
                  </p>
                  <div className="w-full bg-tiki-light-gray rounded-full h-2 mt-2">
                    <div
                      className="bg-tiki-red h-2 rounded-full"
                      style={{
                        width: `${Math.floor(Math.random() * 90) + 10}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 block text-center">
                    Đã bán {Math.floor(Math.random() * 90) + 10}%
                  </span>
                </Link>
              ))}
            </div>
          </section>

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

          <h2 className="text-lg font-bold mb-3 text-tiki-text-gray">
            Sản phẩm gợi ý cho bạn
          </h2>
          <div className="grid grid-cols-6 gap-3">
            {products.slice(0, 12).map((p) => (
              <Link
                to={`/product/${p.id}`}
                key={p.id}
                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md"
              >
                <img
                  src={getFirstImageUrl(p)}
                  alt={p.name || "Sản phẩm"}
                  className="w-full h-36 object-cover rounded mb-2"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                    e.target.onError = null;
                  }}
                />
                <div>
                  <h2 className="text-sm font-normal text-tiki-text-gray line-clamp-2">
                    {p.name}
                  </h2>
                  <div className="flex items-center text-yellow-500 text-xs mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={
                          i < Math.round(Math.random() * 5)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    ({Math.floor(Math.random() * 1000) + 1})
                  </div>
                  <p className="text-tiki-red font-bold text-base mt-1">
                    {p.product_variant_values &&
                    p.product_variant_values.length > 0
                      ? p.product_variant_values[0].price.toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}{" "}
                    ₫
                  </p>
                  {p.product_variant_values &&
                    p.product_variant_values.length > 0 &&
                    p.product_variant_values[0].old_price && (
                      <p className="text-gray-500 line-through text-xs">
                        {p.product_variant_values[0].old_price.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </p>
                    )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-tiki-blue text-white rounded-md disabled:opacity-50 hover:bg-tiki-dark-blue text-sm"
            >
              Trước
            </button>
            <span className="px-3 py-2 bg-tiki-blue/10 text-tiki-dark-blue rounded-md text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-tiki-blue text-white rounded-md disabled:opacity-50 hover:bg-tiki-dark-blue text-sm"
            >
              Sau
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
