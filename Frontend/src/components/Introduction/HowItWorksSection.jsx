import React from 'react';
import { FiSearch, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FiSearch className="w-12 h-12 text-purple-600" />,
      title: "Browse & Search",
      description: "Explore thousands of services from talented freelancers across various categories"
    },
    {
      icon: <FiShoppingCart className="w-12 h-12 text-purple-600" />,
      title: "Choose & Buy",
      description: "Select the perfect service that matches your needs and place your order securely"
    },
    {
      icon: <FiCheckCircle className="w-12 h-12 text-purple-600" />,
      title: "Get Work Done",
      description: "Receive high-quality work delivered on time with our satisfaction guarantee"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How Freeland Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Getting your project done has never been easier. Follow these simple steps to get started.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  {step.icon}
                </div>
              </div>
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
