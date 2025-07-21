import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faYoutube,
  faApple,
  faGooglePlay,
  faCcVisa,
  faCcMastercard,
  faCcJcb,
  faCcPaypal,
  faCcAmex,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCreditCard,
  faQrcode,
  faShieldHalved,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <div className="bg-white border-t border-gray-200 mt-6 py-8 text-sm text-gray-700">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 px-4">
        {/* Cột 1: Hỗ trợ khách hàng */}
        <div>
          <h3 className="font-semibold text-black text-lg mb-3">
            Hỗ trợ khách hàng
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              Hotline:{" "}
              <div className="font-semibold text-black inline-block">
                1900-6035
              </div>
            </li>
            <li>Các câu hỏi thường gặp</li>
            <li>Gửi yêu cầu hỗ trợ</li>
            <li>Hướng dẫn đặt hàng</li>
            <li>Phương thức vận chuyển</li>
            <li>Chính sách đổi trả</li>
            <li>Hướng dẫn trả góp</li>
            <li>Chính sách hàng nhập khẩu</li>
            <li>Email hỗ trợ: hotro@tiki.vn</li>
            <li>Báo lỗi bảo mật: security@tiki.vn</li>
          </ul>
        </div>

        {/* Cột 2: Về Tiki */}
        <div>
          <h3 className="font-semibold text-black text-lg mb-3">Về Tiki</h3>
          <ul className="space-y-1 text-sm">
            <li>Giới thiệu Tiki</li>
            <li>Tiki Blog</li>
            <li>Tuyển dụng</li>
            <li>Chính sách bảo mật thanh toán</li>
            <li>Chính sách bảo mật thông tin cá nhân</li>
            <li>Chính sách giải quyết khiếu nại</li>
            <li>Điều khoản sử dụng</li>
            <li>Giới thiệu Tiki Xu</li>
            <li>Tiếp thị liên kết cùng Tiki</li>
            <li>Bán hàng doanh nghiệp</li>
            <li>Điều kiện vận chuyển</li>
          </ul>
        </div>

        {/* Cột 3: Hợp tác và liên kết */}
        <div>
          <h3 className="font-semibold text-black text-lg mb-3">
            Hợp tác và liên kết
          </h3>
          <ul className="space-y-1 text-sm">
            <li>Quy chế hoạt động Sàn GDTMĐT</li>
            <li>Bán hàng cùng Tiki</li>
          </ul>

          <h3 className="font-semibold text-black text-lg mt-7">
            Chứng nhận bởi
          </h3>
          <div className="flex space-x-2 mt-3">
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-red-500 text-2xl"
            />
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-blue-500 text-2xl"
            />
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-gray-500 text-2xl"
            />
          </div>
        </div>

        {/* Cột 4: Phương thức thanh toán */}
        <div>
          <h3 className="font-semibold text-black text-lg mb-3">
            Phương thức thanh toán
          </h3>
          <div className="grid grid-cols-4 gap-2 text-2xl text-gray-700 mb-4">
            <FontAwesomeIcon icon={faCcVisa} />
            <FontAwesomeIcon icon={faCcMastercard} />
            <FontAwesomeIcon icon={faCcJcb} />
            <FontAwesomeIcon icon={faCreditCard} />
            <FontAwesomeIcon icon={faCcPaypal} />
            <FontAwesomeIcon icon={faCcAmex} />
          </div>

          <h3 className="font-semibold text-black text-lg mt-7">
            Dịch vụ giao hàng
          </h3>
          <div className="flex items-center text-blue-600 space-x-1 font-semibold text-base mt-3">
            <FontAwesomeIcon icon={faTruckFast} />
            <span>TikiNOW</span>
          </div>
        </div>

        {/* Cột 5: Kết nối & tải ứng dụng */}
        <div>
          <h3 className="font-semibold text-black text-lg mb-3">
            Kết nối với chúng tôi
          </h3>
          <div className="flex items-center space-x-5 mb-4">
            <Link to="#" className="hover:opacity-80">
              <FontAwesomeIcon
                icon={faFacebookF}
                className="w-7 h-7 text-blue-600"
              />
            </Link>
            <Link to="#" className="hover:opacity-80">
              <FontAwesomeIcon
                icon={faYoutube}
                className="w-10 h-10 text-red-600"
              />
            </Link>
            <Link to="#" className="hover:opacity-80">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                Z
              </div>
            </Link>
          </div>

          <h3 className="font-semibold text-black text-lg mt-7">
            Ứng dụng trên điện thoại
          </h3>
          <div className="flex items-start space-x-3 mt-3">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
              <FontAwesomeIcon
                icon={faQrcode}
                className="text-2xl text-gray-600"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center bg-black text-white rounded px-2 py-1 text-xs font-semibold w-32 justify-center mt-1">
                <FontAwesomeIcon icon={faApple} className="mr-2" />
                App Store
              </div>
              <div className="flex items-center bg-green-500 text-white rounded px-2 py-1 text-xs font-semibold w-32 justify-center">
                <FontAwesomeIcon icon={faGooglePlay} className="mr-2" />
                Google Play
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin công ty */}
      <div className="container mx-auto border-t border-gray-200 mt-8 pt-6 text-xs text-gray-600 px-4">
        <p>
          <strong>Công ty TNHH TIKI</strong>
        </p>
        <p>
          Tòa nhà số 52 đường Ưu Tiên, Phường 4, Quận Tân Bình, Thành phố Hồ Chí
          Minh
        </p>
        <p>
          Giấy chứng nhận đăng ký doanh nghiệp số 0309532909 do Sở Kế Hoạch và
          Đầu Tư Thành phố Hồ Chí Minh cấp lần đầu vào ngày 06/01/2010.
        </p>
        <p>
          Hotline: <strong className="text-blue-600">1900 6035</strong>
        </p>
      </div>
    </div>
  );
}

export default Footer;
