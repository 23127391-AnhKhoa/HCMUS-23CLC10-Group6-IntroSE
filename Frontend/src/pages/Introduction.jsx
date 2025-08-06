import React from 'react';
import HeroSection from '../components/Introduction/HeroSection';

import Navbar from '../Common/Navbar_LD';
import FeaturesSection from '../components/Introduction/FeatureSection';

import StatsSection from '../components/Introduction/StatsSection';
import HowItWorksSection from '../components/Introduction/HowItWorksSection';
import CategoriesSection from '../components/Introduction/CategoriesSection';
import TopSellersSection from '../components/Introduction/TopSellersSection';
import CTASection from '../components/Introduction/CTASection';
import Footer from '../Common/Footer';
/**
 * WhatNew component serves as the main page for "What's New" content,
 * integrating the HeroSection and CustomerReviewSection to present
 * a professional introduction and customer testimonials.
 */

const URLS = [
  import.meta.env.VITE_PUBLIC_API_URL,
  import.meta.env.VITE_API_URL,
  window.location.origin,
  'http://localhost:8000'
].filter(Boolean)

console.log('[🔍 API URLs AVAILABLE]', URLS);

// Set default API URL
window.BASE_API = URLS.at(-1) || 'https://hcmus-23clc10-group6-introse.onrender.com' // fallback chắc cú
console.log('[🚀 INITIAL API URL]', window.BASE_API);

// ⚡ Patch fetch luôn sẵn
const oldFetch = window.fetch
window.fetch = (url, ...args) => {
  const originalUrl = url;
  if (typeof url === 'string' && url.startsWith('/api')) {
    url = `${window.BASE_API}${url}`
    console.debug('[🔄 FETCH REWRITE]', originalUrl, '→', url);
  }
  return oldFetch(url, ...args)
}

// 🔎 Check server nào sống nhất → dùng luôn
;(async () => {
  console.log('[🔎 CHECKING API ENDPOINTS]', 'Starting health checks...');
  let foundLiveAPI = false;
  
  for (const url of URLS) {
    try {
      console.log('[🔍 TESTING API]', url);
      const startTime = performance.now();
      const res = await fetch(`${url}/api/gigs?limit=5&sort_by=created_at&sort_order=desc&filter_by_status=active`)
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (res.ok) {
        foundLiveAPI = true;
        window.BASE_API = url
        console.log('[✅ API ALIVE]', url, `(Response time: ${responseTime}ms)`);
        console.log('[🔥 BASE_API SELECTED]', url);
        break
      } else {
        console.warn('[⚠️ API RESPONDED BUT NOT OK]', url, `Status: ${res.status}`, `(Response time: ${responseTime}ms)`);
      }
    } catch (err) {
      console.warn('[❌ API DEAD]', url, 'Error:', err.message);
    }
  }
  
  if (!foundLiveAPI) {
    console.error('[⛔ NO LIVE API FOUND]', 'Using fallback URL:', window.BASE_API);
  }
  
  console.log('[🌐 FINAL API URL]', window.BASE_API);
})()


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
        <Navbar/>
        <HeroSection />
        <StatsSection />
       
        <FeaturesSection/>
        <HowItWorksSection />
        <CategoriesSection />
        <TopSellersSection />
        
        <CTASection />
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