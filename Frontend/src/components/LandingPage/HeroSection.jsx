import React from 'react';

const HeroSection = () => {
  return (
    <div className="pt-16 min-h-screen flex items-center animated-gradient">
      <div className="w-full max-w-7xl mx-auto px-2 sm:pl-4 lg:pl-6 flex flex-col lg:flex-row items-center">
        {/* Text and Buttons (Left) */}
        <div className="lg:w-1/2 text-left z-10 py-12 lg:py-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 animate-fade-in">
            Connecting clients<br />
            to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              freelancers
            </span><br />
            who deliver
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-md">
            Join thousands of successful projects. Find the perfect freelancer or your next opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold text-xl rounded-lg hover:bg-gray-100 transition-smooth hover-scale shadow-lg">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold text-xl rounded-lg hover:bg-white hover:text-blue-600 transition-smooth hover-scale shadow-lg">
              Learn More
            </button>
          </div>
        </div>
        {/* Image (Right) */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
          <img
            src="../human.svg"
            alt="Freelancer Illustration"
            className="w-full max-w-md lg:max-w-lg h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;