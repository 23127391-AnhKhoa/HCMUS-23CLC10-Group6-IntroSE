import React from 'react';
import { FiArrowRight, FiUsers, FiDollarSign } from 'react-icons/fi';

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center text-white mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Join thousands of satisfied clients and talented freelancers on Freeland today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For Buyers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <FiUsers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">For Buyers</h3>
            </div>
            
            <p className="text-purple-100 mb-6">
              Find the perfect freelancer for your project. Browse thousands of services and get high-quality work delivered on time.
            </p>
            
            <ul className="space-y-3 mb-8 text-purple-100">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                Access to verified freelancers
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                Secure payment protection
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                24/7 customer support
              </li>
            </ul>
            
            <button className="w-full bg-white text-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-300 flex items-center justify-center">
              Find Services
              <FiArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* For Sellers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">For Sellers</h3>
            </div>
            
            <p className="text-purple-100 mb-6">
              Turn your skills into income. Create your profile, showcase your work, and connect with clients worldwide.
            </p>
            
            <ul className="space-y-3 mb-8 text-purple-100">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                Set your own prices
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                Work from anywhere
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                Grow your business
              </li>
            </ul>
            
            <button className="w-full bg-transparent border-2 border-white text-white py-3 px-6 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 flex items-center justify-center">
              Start Selling
              <FiArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-purple-200 text-sm">
            Already have an account? 
            <a href="/login" className="text-white hover:underline ml-1 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
