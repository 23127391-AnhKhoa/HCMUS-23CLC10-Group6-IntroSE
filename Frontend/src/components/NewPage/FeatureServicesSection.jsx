// src/components/LandingPage/FeaturedServicesSection.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer'; // <-- Import useInView

// Dữ liệu mẫu cho các dịch vụ - bạn có thể thay thế bằng API call
// Tôi đã chọn 14 dịch vụ để minh họa cho chức năng "Xem thêm" (6 ban đầu + 8 sau)
const allServices = [
  {
    id: 'dev-01',
    name: 'Phát triển Website Doanh nghiệp',
    image: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'design-01',
    name: 'Thiết kế Bộ nhận diện Thương hiệu',
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'mkt-01',
    name: 'Quảng cáo trên Mạng xã hội',
    image: 'https://img.freepik.com/premium-photo/marketing-digital-technology-business-concept-uds_31965-305041.jpg?semt=ais_hybrid&w=740',
  },
  {
    id: 'seo-01',
    name: 'Tối ưu hóa Công cụ tìm kiếm (SEO)',
    image: 'https://neilpatel.com/wp-content/uploads/2021/09/seo-for-developers.png',
  },
  {
    id: 'video-01',
    name: 'Sản xuất Video & Animation',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZAfKK2bpA9h-4J0JV_cCcbqZyMpe30L6S8t8_vWt6cFzoV8BDGY-ZrNzJN0Qy6fXK3QY&usqp=CAU',
  },
  {
    id: 'content-01',
    name: 'Sáng tạo Nội dung & Viết bài',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'dev-02',
    name: 'Xây dựng Trang thương mại điện tử',
    image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'design-02',
    name: 'Thiết kế Giao diện App (UI/UX)',
    image: 'https://flatironschool.com/wp-content/uploads/2022/06/what-is-ux-ui-product-design.jpg',
  },
];

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 8;

const FeaturedServicesSection = () => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // useInView để theo dõi toàn bộ section
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation chỉ chạy 1 lần khi vào view
    threshold: 0.2, // Khi 20% của section hiển thị, inView = true
  });

  // useInView cho tiêu đề
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // useInView cho nút "Xem thêm"
  const { ref: buttonRef, inView: buttonInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + LOAD_MORE_COUNT);
  };

  const visibleServices = allServices.slice(0, visibleCount);

  // Hàm để xác định lớp animation dựa trên cột và trạng thái inView
  const getServiceAnimationClass = (index) => {
    if (!inView) {
      return 'reveal-hidden'; // Ẩn nếu section chính chưa vào view
    }

    const colIndex = index % 3; // Xác định cột (0, 1, 2)
    let animationClass = '';

    // Áp dụng hiệu ứng slide khác nhau cho mỗi cột
    if (colIndex === 0) { // Cột 1: Slide từ trái
      animationClass = 'animate-slide-left-on-scroll';
    } else if (colIndex === 1) { // Cột 2: Slide từ trên xuống
      animationClass = 'animate-slide-top-on-scroll';
    } else { // Cột 3: Slide từ phải
      animationClass = 'animate-slide-right-on-scroll';
    }

    return animationClass;
  };

  return (
    <section ref={ref} className="bg-gray-100 py-20 sm:py-24"> {/* Gắn ref vào section chính */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Banner Tiêu đề === */}
        <div ref={headerRef} className={`text-center mb-16 ${headerInView ? 'animate-fade-in-on-scroll' : 'reveal-hidden'}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight uppercase">
            CÁC DỊCH VỤ NỔI BẬT
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
            Khám phá các dịch vụ chuyên nghiệp được cung cấp bởi đội ngũ chuyên gia của chúng tôi.
          </p>
        </div>

        {/* === Lưới các dịch vụ === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleServices.map((service, index) => (
            <div
              key={service.id}
              className={`group relative rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-300 ease-in-out ${getServiceAnimationClass(index)}`}
              style={{ animationDelay: `${index * 0.1}s` }} // Áp dụng độ trễ xếp lớp
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Lớp phủ (overlay) trên ảnh */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {/* Tên dịch vụ */}
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-xl font-bold">
                  {service.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* === Nút Xem thêm === */}
        {visibleCount < allServices.length && (
          <div ref={buttonRef} className={`text-center mt-16 ${buttonInView ? 'animate-fade-in-on-scroll' : 'reveal-hidden'}`}>
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-3 -ml-1 h-5 w-5" />
              Xem thêm dịch vụ
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedServicesSection;