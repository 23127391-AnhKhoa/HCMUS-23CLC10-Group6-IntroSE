import React from 'react';
import HeroSection from '../components/Introduction/HeroSection';
import CustomerReviewSection from '../components/Introduction/CustomerReviewSection';
import Navbar from '../Common/Navbar_LD';
import FeaturesSection from '../components/Introduction/FeatureSection';
import FeaturedServicesSection from '../components/Introduction/FeatureServicesSection';
import Footer from '../Common/Footer';
/**
 * WhatNew component serves as the main page for "What's New" content,
 * integrating the HeroSection and CustomerReviewSection to present
 * a professional introduction and customer testimonials.
 */
const Introduction = () => {
  return (
    <div className="min-h-screen bg-purple-50 font-sans">
      {/*
        This div acts as the main container for the WhatNew page.
        It sets a minimum height to ensure it takes up at least the full viewport height,
        provides a light gray background, and applies a sans-serif font.
      */}

      <main>
        {/*
          The HeroSection component displays a prominent banner or hero area
          at the top of the page, often used for key messages or calls to action.
          It includes animations and a gradient background for visual appeal.
        */}
        <Navbar />
        <HeroSection />
        <FeaturedServicesSection />
        <FeaturesSection/>
        {/*
          The CustomerReviewSection component showcases customer testimonials
          in a carousel format, allowing users to scroll through different reviews.
          This section enhances credibility and builds trust with visitors.
        */}
        <CustomerReviewSection />
        <Footer/>

        {/*
          You can add more sections here as needed for your "What's New" page.
          For example:
          - A section for recent updates or features.
          - A section for upcoming events or news.
          - A call to action section.
        */}
        {/*
        <section className="py-16 px-4 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Các Tính Năng Mới Nổi Bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover-scale transition-smooth">
              <h3 className="text-xl font-semibold mb-2">Tính Năng A</h3>
              <p className="text-gray-600">Mô tả ngắn gọn về tính năng A. Tính năng này giúp người dùng...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover-scale transition-smooth">
              <h3 className="text-xl font-semibold mb-2">Tính Năng B</h3>
              <p className="text-gray-600">Mô tả ngắn gọn về tính năng B. Cải thiện trải nghiệm người dùng với...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover-scale transition-smooth">
              <h3 className="text-xl font-semibold mb-2">Tính Năng C</h3>
              <p className="text-gray-600">Mô tả ngắn gọn về tính năng C. Đem lại hiệu quả vượt trội cho...</p>
            </div>
          </div>
        </section>
        */}
      </main>
    </div>
  );
};

export default Introduction;