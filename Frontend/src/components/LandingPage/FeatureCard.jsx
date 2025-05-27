import React from 'react';

const FeatureCard = ({ title, description, icon, bgColor, gradient }) => {
  return (
    <div className={`text-center p-8 rounded-2xl bg-gradient-to-br ${gradient} hover-scale transition-smooth`}>
      <div className={`icon-bg ${bgColor}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;