
import React, { useState } from 'react';
    import { Dropdown } from 'antd';
    import { useNavigate } from 'react-router-dom';
  
    const Navbar = () => {
      // Custom ChevronDown icon component
      const ChevronDown = ({ size = 16, className = "" }) => (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg> 
      );
  
      const navigate = useNavigate();
      const [hoveredItem, setHoveredItem] = useState(null);
      // Dropdown items for Explore
      const exploreItems = [
        {
          key: 'it',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              IT
            </div>
          ),
        },
        {
          key: 'designer',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              Designer
            </div>
          ),
        },
      ];
  
      // Dropdown items for Why FreeLand?
      const whyFreelandItems = [
        {
          key: 'review',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              Review
            </div>
          ),
        },
        {
          key: 'how-to-hire',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              How to Hire
            </div>
          ),
        },
        {
          key: 'success-stories',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              Success Stories
            </div>
          ),
        },
        {
          key: 'how-to-find-work',
          label: (
            <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200">
              How to find work
            </div>
          ),
        },
      ];
  
      const handleNewsClick = () => {
        navigate('/news');
      };
  
      const handleLoginClick = () => {
        navigate('/login');
      };
  
      const handleSignupClick = () => {
        navigate('/signup');
      };
  
      const handleCreateGigsClick = () => {
      navigate('/create-gig'); //  url of create_gig
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
                onClick={() => navigate('/')}
              />
            </div>
  
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center space-x-8">
                {/* Explore Dropdown */}
                <Dropdown
                  menu={{ items: exploreItems }}
                  trigger={['hover']}
                  placement="bottomLeft"
                  overlayClassName="navbar-dropdown"
                >
                  <div 
                    className="flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-blue-600 transition-smooth py-2"
                    onMouseEnter={() => setHoveredItem('explore')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="font-medium">Explore</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${
                        hoveredItem === 'explore' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </Dropdown>
  
                {/* Why FreeLand Dropdown */}
                <Dropdown
                  menu={{ items: whyFreelandItems }}
                  trigger={['hover']}
                  placement="bottomLeft"
                  overlayClassName="navbar-dropdown"
                >
                  <div 
                    className="flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-blue-600 transition-smooth py-2"
                    onMouseEnter={() => setHoveredItem('why-freeland')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="font-medium">Why FreeLand?</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${
                        hoveredItem === 'why-freeland' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </Dropdown>
  
              {/* What's new */}
              <div 
                className="cursor-pointer text-gray-700 hover:text-blue-600 transition-smooth py-2 font-medium"
                onClick={handleNewsClick}
              >
                What's new
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