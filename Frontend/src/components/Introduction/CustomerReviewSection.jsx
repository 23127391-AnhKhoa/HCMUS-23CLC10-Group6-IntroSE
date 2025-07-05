import React from 'react';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Custom arrow components for react-slick
const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-smooth hover-scale`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronRight} className="text-gray-700" />
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer z-10 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-smooth hover-scale`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronLeft} className="text-gray-700" />
    </div>
  );
};


const CustomerReviewSection = () => {
  const reviews = [
    {
      id: 1,
      name: 'Kate M.',
      from: 'Learning from the U.S.',
      avatar: 'https://via.placeholder.com/150', // Placeholder for avatar
      image: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/3/7/1021216/17_Phu_Nu_Tho_Nhi_Ky.jpg', // Placeholder for image
      quote: " for over a decade, I lacked a framework and vocabulary for communicating my proficiency to potential empl, I felt confident to discuss my skills, and I have accepted a new position and increased my salary by $20,000.",
    },
    {
      id: 2,
      name: 'John D.',
      from: 'Student from Vietnam',
      avatar: 'https://via.placeholder.com/150',
      image: 'http://startup.gov.vn/noidung/tintuc/PublishingImages/duong-tong-2894-1539587754.jpg',
      quote: "Khóa học này đã thay đổi hoàn toàn cách tôi tiếp cận lập trình. Kiến thức rất thực tế và giảng viên cực kỳ tận tâm. Tôi đã có thể áp dụng ngay những gì học được vào dự án cá nhân của mình.",
    },
    {
      id: 3,
      name: 'Maria S.',
      from: 'Professional in IT',
      avatar: 'https://via.placeholder.com/150',
      image: 'https://thanhnien.mediacdn.vn/uploaded/minhnguyet/2020_04_21/quoc-ky1_VWZL.jpg?width=500',
      quote: "I highly recommend this platform for anyone looking to upskill. The content is top-notch, and the interactive exercises really help solidify understanding. It's truly a game-changer for my career.",
    },
  ];

  const settings = {
    dots: false, // Ẩn các chấm điều hướng
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000, // Tự động chuyển slide sau 5 giây
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 animate-fade-in">Tại sao mọi người chọn chúng tôi cho sự nghiệp của họ</h2>
      </div>

      <div className="max-w-4xl mx-auto relative px-8">
        <Slider {...settings}>
          {reviews.map((review) => (
            <div key={review.id} className="p-4 outline-none">
              {/* Thêm chiều cao cố định vào đây */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex flex-row-reverse hover-scale transition-smooth h-[450px]"> {/* Ví dụ: đặt chiều cao là 450px */}
                {/* Image Section */}
                <div className="md:w-1/2 h-full"> {/* Đảm bảo div này chiếm toàn bộ chiều cao của div cha */}
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover" // <-- Ảnh cũng chiếm toàn bộ chiều cao của div cha
                  />
                </div>

                {/* Review Content */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center h-full overflow-y-auto"> {/* Thêm h-full và overflow-y-auto */}
                  <blockquote className="text-gray-700 text-lg italic mb-6 relative">
                    <span className="absolute left-0 -top-4 text-5xl text-gray-300 font-serif leading-none">“</span>
                    <p className="ml-4">{review.quote}</p>
                    <span className="absolute bottom-0 right-0 text-5xl text-gray-300 font-serif leading-none rotate-180 transform">“</span>
                  </blockquote>
                  <p className="font-semibold text-gray-800 mt-4">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.from}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default CustomerReviewSection;