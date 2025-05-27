import React from 'react';
import Navbar from '../components/LandingPage/Navbar_LD';
import '../index.css';

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What's New</h2>
        <p className="text-xl text-gray-600 text-center">Stay tuned for the latest updates and news from FreeLand!</p>
        {/* Add news content here when implemented */}
      </div>
    </div>
  );
};

export default NewsPage;