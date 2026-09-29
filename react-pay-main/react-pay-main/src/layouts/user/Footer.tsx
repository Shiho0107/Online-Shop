import { FaMailBulk, FaMapMarkedAlt, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-700 text-slate-300 font-normal w-full!">
      {/* 2. KHU VỰC LIÊN KẾT CHÍNH (MAIN LINKS LAYER) */}
      <div className="container mx-auto w-300 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="/gemini-svg.svg"
              alt="Logo"
              className="w-60 object-cover cursor-pointer"
            />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Hệ thống bán lẻ iPhone chính hãng uy tín hàng đầu. Cam kết chất
              lượng, bảo hành chuẩn Apple tối đa 12 tháng.
            </p>
          </div>

          {/* Cột 2: Danh mục sản phẩm */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Sản phẩm
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#iphone"
                  className="hover:text-white transition-colors"
                >
                  iPhone 17 Series
                </a>
              </li>
              <li>
                <a
                  href="#iphone"
                  className="hover:text-white transition-colors"
                >
                  iPhone 16 Series
                </a>
              </li>
              <li>
                <a
                  href="#iphone"
                  className="hover:text-white transition-colors"
                >
                  iPhone Pro Max
                </a>
              </li>
              <li>
                <a
                  href="#accessories"
                  className="hover:text-white transition-colors"
                >
                  Phụ kiện Apple
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Chính sách mua hàng
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#policy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a
                  href="#policy"
                  className="hover:text-white transition-colors"
                >
                  Đổi trả trong 30 ngày
                </a>
              </li>
              <li>
                <a
                  href="#policy"
                  className="hover:text-white transition-colors"
                >
                  Trả góp 0% lãi suất
                </a>
              </li>
              <li>
                <a
                  href="#policy"
                  className="hover:text-white transition-colors"
                >
                  Giao hàng toàn quốc
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <FaMapMarkedAlt size={20} />
                <span>123 Đường Cầu Giấy, Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt size={13} />
                <a
                  href="tel:19001234"
                  className="hover:text-white transition-colors"
                >
                  1900 1234
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaMailBulk size={15} />
                <a
                  href="mailto:support@myweb.com"
                  className="hover:text-white transition-colors"
                >
                  support@myweb.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC BẢN QUYỀN (COPYRIGHT LAYER) */}
      <div className="bg-slate-800 text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} My Web Phone Store. Tất cả quyền được
            bảo lưu.
          </p>

          {/* Mạng xã hội */}
          <div className="flex space-x-5">
            <a
              href="#facebook"
              className="hover:text-slate-400 transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="#youtube"
              className="hover:text-slate-400 transition-colors"
            >
              <span className="sr-only">YouTube</span>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
