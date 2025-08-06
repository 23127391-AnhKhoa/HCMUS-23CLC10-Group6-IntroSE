import React from 'react';
import { FiUsers, FiShield, FiBriefcase } from 'react-icons/fi';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: <FiUsers className="w-12 h-12" />,
      title: 'Top Quality Freelancers',
      description: 'Carefully vetted and verified freelancers ready to bring your vision to life with professional expertise.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 2,
      icon: <FiShield className="w-12 h-12" />,
      title: 'Secure Payments',
      description: 'Your money is protected from project start to completion. Pay only when you\'re completely satisfied with the results.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      icon: <FiBriefcase className="w-12 h-12" />,
      title: 'Diverse Services',
      description: 'From design to development, writing to marketing - find the perfect freelancer for any project, big or small.',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-lg text-purple-600 mb-2 font-medium">Why Choose Freeland?</p>
          <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
            We Turn Your Ideas Into Reality
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with professional freelancers who deliver exceptional results every time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="group text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;