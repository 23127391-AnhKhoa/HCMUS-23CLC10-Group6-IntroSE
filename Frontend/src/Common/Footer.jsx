// src/components/Common/Footer.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faTwitter,
  faYoutube,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons'; // Import các icon mạng xã hội
// Nếu bạn có các icon cho Stripe, Mastercard, Visa, v.v., bạn cũng cần import chúng.
// Hiện tại tôi sẽ dùng div màu trắng đơn giản để minh họa các icon thanh toán.

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Logo và giới thiệu */}
        <div className="flex flex-col items-start">
          <img
            src="/logo.svg" // Đường dẫn đến logo của bạn (trong thư mục public)
            alt="EvoTools Logo"
            className="h-10 mb-4" // Điều chỉnh chiều cao và margin dưới
          />
          <p className="text-xl font-bold text-white mb-2">
            Nền tảng thương mại dịch vụ
          </p>
        </div>

        {/* Cột 2: Thông tin liên hệ và mạng xã hội */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Bạn cần hỗ trợ</h4>
          <p className="text-3xl font-bold text-white mb-2">1900 9989</p>
          <p className="text-gray-400 mb-2">Địa chỉ: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh,  Việt Nam</p>
          <p className="text-gray-400 mb-4">Email: tmhung23clc@fitus.edu.vn</p>

          {/* Social Icons */}
          <div className="flex space-x-4 mb-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FontAwesomeIcon icon={faFacebookF} size="lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FontAwesomeIcon icon={faYoutube} size="lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
          </div>

          {/* Payment Method Icons (placeholders) */}
          <div className="flex flex-wrap gap-3">
            {/* Đây là các placeholder. Bạn có thể thay bằng img tags hoặc FontAwesome icons */}
            
            {/* Nếu bạn có ảnh thật, hãy dùng: <img src="/path/to/visa.png" alt="Visa" className="h-8 w-auto" /> */}
          </div>
        </div>

        {/* Cột 3: Hướng dẫn mua hàng */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Hướng dẫn mua hàng</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Trang chủ</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Giới thiệu</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Danh mục</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Tin tức</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Liên hệ</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Hướng dẫn sử dụng</a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Hỗ trợ khách hàng */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Trang chủ</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Giới thiệu</a>
            </li>
            {/* Các mục khác có thể giống hoặc khác */}
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Chính sách bảo mật</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Điều khoản dịch vụ</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Phần bản quyền */}
      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Bản quyền thuộc về Freeland | Cung cấp bởi Team 06</p>
      </div>
    </footer>
  );
};

export default Footer;