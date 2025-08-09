// src/components/Common/Footer.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faYoutube,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-900 to-slate-900 text-gray-300 mt-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Cột 1: Logo và mô tả */}
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-4">
              <img
                src="/logo.svg"
                alt="Freeland Logo"
                className="h-10 w-auto mr-3"
              />
              
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Leading freelancer and client connection platform in Vietnam. 
              Find high-quality services at reasonable prices.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=100028627989961&locale=vi_VN" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a 
                href="https://www.youtube.com/@HungTran-sr6lo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a 
                href="https://www.instagram.com/henry2005_vmo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>

          {/* Cột 2: Contact & Support */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Contact & Support</h4>
            <p className="text-3xl font-bold text-white mb-2">1900 9989</p>
            <p className="text-gray-400 mb-2">
              Address: 227 Nguyen Van Cu, Ward 4, District 5, Ho Chi Minh City, Vietnam
            </p>
            <p className="text-gray-400 mb-6">
              Email: <a href="mailto:tmhung23clc@fitus.edu.vn" className="hover:text-blue-400 transition-colors">tmhung23clc@fitus.edu.vn</a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-700 bg-slate-900">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center max-w-6xl mx-auto">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Freeland. Developed by <span className="text-blue-400">Team 06</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;