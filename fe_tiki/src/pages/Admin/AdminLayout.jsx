import { Link, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faBoxOpen, faTags, faCopyright, faUsers } from "@fortawesome/free-solid-svg-icons";

// Component Layout chính cho trang Admin
const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-tiki-light-gray">
      {/* Sidebar điều hướng */}
      <aside className="w-64 bg-tiki-dark-blue text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-tiki-blue">
          <Link to="/admin" className="text-white hover:text-white">Admin Dashboard</Link>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2 p-4">
            <li>
              <Link to="/admin/dashboard" className="flex items-center p-2 rounded text-white hover:bg-white/10 hover:text-white">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                <span>Tổng quan</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="flex items-center p-2 rounded text-white hover:bg-white/10 hover:text-white">
                <FontAwesomeIcon icon={faBoxOpen} className="mr-3" />
                <span>Sản phẩm</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className="flex items-center p-2 rounded text-white hover:bg-white/10 hover:text-white">
                <FontAwesomeIcon icon={faTags} className="mr-3" />
                <span>Danh mục</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/brands" className="flex items-center p-2 rounded text-white hover:bg-white/10 hover:text-white">
                <FontAwesomeIcon icon={faCopyright} className="mr-3" />
                <span>Thương hiệu</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Khu vực nội dung chính */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
