import React from 'react';

const LoadingOverlay = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex flex-col justify-center items-center z-[9999]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
      <p className="text-white text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingOverlay;