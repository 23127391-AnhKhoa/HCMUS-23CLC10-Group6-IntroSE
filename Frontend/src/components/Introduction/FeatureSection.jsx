import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: (
        <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      ),
      title: 'Freelancer chất lượng hàng đầu',
      description: 'Freelancer đã được chọn lọc và xác minh danh tính với Freeland'
    },
    {
      id: 2,
      icon: (
        <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v6h-2V7zm0 8h2v2h-2v-2z"/>
        </svg>
      ),
      title: 'Bảo đảm việc thuê',
      description: 'Tiền của bạn sẽ được bảo vệ từ khi freelancer bắt đầu công việc cho đến khi bạn nhận được sản phẩm ưng ý'
    },
    {
      id: 3,
      icon: (
        <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
        </svg>
      ),
      title: 'Đáp ứng mọi nhu cầu, yên tâm lựa chọn Freeland',
      description: 'Mang lưới freelancer đa dạng, chuyên nghiệp, đáp ứng mọi nhu cầu công việc'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto px-4">
        <div className="text-left mb-12">
          <p className="text-lg text-gray-600 mb-2">Tại sao bạn nên sử dụng Freeland?</p>
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            Vì chúng tôi biến ý tưởng của bạn thành hiện thực với freelancer <br className="hidden md:block" /> chuyên nghiệp
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(feature => (
            <div key={feature.id} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              {feature.icon}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;