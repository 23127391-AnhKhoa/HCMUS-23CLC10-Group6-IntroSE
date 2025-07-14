// src/components/GigPublishSuccess.jsx
import React, { useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const GigPublishSuccess = ({ gigData, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleViewGig = () => {
    navigate(`/gig/${gigData.id}`);
  };

  const handleViewProfile = () => {
    navigate('/profile_seller');
  };

  const handleExplore = () => {
    navigate('/explore');
  };

  const handleCreateAnother = () => {
    window.location.reload(); // Refresh to start creating another gig
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl transform animate-fade-in">
        <div className="text-center">
          <div className="relative">
            <CheckCircleIcon className="h-16 sm:h-20 w-16 sm:w-20 text-green-500 mx-auto mb-4" />
            <SparklesIcon className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎉 Gig Published Successfully!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Your gig "<span className="font-semibold text-indigo-600 dark:text-indigo-400">{gigData.title}</span>" has been published and is now live on the platform.
          </p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium text-xs">
                ✓ Live
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 dark:text-gray-400">Gig ID:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200 text-xs">#{gigData.id}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleViewGig}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              🔍 View My Gig
            </button>
            
            <button
              onClick={handleViewProfile}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              👤 Go to My Profile
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleExplore}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-xs sm:text-sm"
              >
                🌍 Explore
              </button>
              
              <button
                onClick={handleCreateAnother}
                className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-xs sm:text-sm"
              >
                ➕ Create Another
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigPublishSuccess;
