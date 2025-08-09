// src/Common/PageWrapper.jsx
import React from 'react';

/**
 * PageWrapper component that ensures proper footer positioning
 * Use this to wrap page content to ensure footer stays at bottom
 */
const PageWrapper = ({ children, className = "" }) => {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
