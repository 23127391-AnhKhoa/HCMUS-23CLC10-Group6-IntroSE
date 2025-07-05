import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden animated-gradient">
      {/* Overlay để làm tối background gradient và làm nổi bật text */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl animate-fade-in">
        {/* Placeholder cho logo HOCMAI.VN hoặc tương tự */}
        <div className="mb-6">
          {/* Bạn có thể thay thế bằng ảnh logo thực tế */}
          <svg className="w-32 h-32 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h1 className="text-5xl font-bold mt-4">FREELAND</h1>
        </div>

        <p className="text-xl mt-4 mb-8">NỀN TẢNG DỊCH VỤ TRỰC TUYẾN</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-left text-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Đa dạng dịch vụ
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Uy tín, chất lượng
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Nơi gặp gỡ các Freeland và khách hàng
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Rất nhiều phản hồi tích cực
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Đa dạng ngôn ngữ
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd"></path>
            </svg>
            Trả góp, không lãi suất
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;