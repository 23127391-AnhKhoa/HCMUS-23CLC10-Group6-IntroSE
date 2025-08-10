// src/Common/Layout.jsx
import React from 'react';
import Footer from './Footer';

/**
 * Layout component that ensures footer is always at the bottom
 * Uses flexbox to create a sticky footer layout
 */
const Layout = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Main content area that grows to fill available space */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer will always be at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
