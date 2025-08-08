import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const navigate = useNavigate();

  const handleIntroductionClick = () => {
    navigate('/explore');
  };

  const handleAboutUsClick = () => {
    navigate('/about-us');
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleSignupClick = () => {
    navigate('/auth');
  };

    const handleCreateGigsClick = () => {
    navigate('/auth'); //  
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="../logo.svg" 
              alt="Logo" 
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-smooth"
              onClick={() => navigate('/explore')}
            />
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* About Us */}
            <div 
              className="cursor-pointer text-gray-700 hover:text-blue-600 transition-smooth py-2 font-medium"
              onClick={handleAboutUsClick}
            >
              About Us
            </div>

            {/* All services */}
            <div 
              className="cursor-pointer text-gray-700 hover:text-blue-600 transition-smooth py-2 font-medium"
              onClick={handleIntroductionClick}
            >
              All services
            </div>
            {/*CREATE GIGS*/}
            <button
                onClick={handleCreateGigsClick}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-smooth shadow-sm hover:shadow-md hover-scale"
              >
                Create Gigs
              </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-smooth"
            >
              Log in
            </button>
            <button
              onClick={handleSignupClick}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth shadow-sm hover:shadow-md"
            >
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600 transition-smooth">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;