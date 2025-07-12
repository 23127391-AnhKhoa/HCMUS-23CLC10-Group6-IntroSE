import React, { useState, useEffect } from 'react';
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

// Global API status tracking
window.API_STATUS = {
  isChecking: true,
  isReady: false,
  checkedUrls: [],
  selectedUrl: null,
  pendingRequests: []
};

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

// ⚡ Create a queue for requests made before API is ready
const enqueueRequest = (request) => {
  console.log('[⏳ REQUEST QUEUED]', request.url);
  window.API_STATUS.pendingRequests.push(request);
  return new Promise((resolve) => {
    request.resolve = resolve;
  });
};

// Process queued requests after API is ready
const processQueue = () => {
  if (window.API_STATUS.pendingRequests.length > 0) {
    console.log(`[🔄 PROCESSING QUEUE] ${window.API_STATUS.pendingRequests.length} pending requests`);
    
    window.API_STATUS.pendingRequests.forEach(req => {
      const { url, options, resolve, path } = req;
      console.log('[🔄 EXECUTING QUEUED REQUEST]', url);
      
      // Execute the actual fetch with the confirmed API URL
      let finalUrl = url;
      
      // Use the path if available (from our aggressive URL rewriting)
      if (path) {
        finalUrl = `${window.BASE_API}${path}`;
      } 
      // Fallback to original logic
      else if (typeof url === 'string' && url.startsWith('/api')) {
        finalUrl = `${window.BASE_API}${url}`;
      }
      
      console.log('[🔄 QUEUED REQUEST REWRITTEN]', url, '→', finalUrl);
      
      oldFetch(finalUrl, options)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('[❌ QUEUED REQUEST FAILED]', url, error);
          resolve(new Response(null, { status: 500, statusText: 'Failed to process queued request' }));
        });
    });
    
    // Clear the queue
    window.API_STATUS.pendingRequests = [];
  }
};

// ⚡ Patch fetch with queueing support and aggressive URL rewriting
const oldFetch = window.fetch;
window.fetch = (url, ...args) => {
  const originalUrl = url;
  const options = args[0] || {};
  
  // Handle different URL formats
  let shouldRewrite = false;
  let path = '';
  
  // Case 1: URL starts with /api
  if (typeof url === 'string' && url.startsWith('/api')) {
    shouldRewrite = true;
    path = url;
  } 
  // Case 2: URL contains localhost:8000/api
  else if (typeof url === 'string' && url.includes('localhost:8000/api')) {
    shouldRewrite = true;
    path = url.substring(url.indexOf('/api'));
  }
  // Case 3: URL contains localhost or explicit API URLs
  else if (typeof url === 'string' && (
    url.includes('localhost:8000') || 
    url.includes('127.0.0.1:8000') || 
    url.includes('hcmus-23clc10-group6-introse')
  )) {
    // Extract the API path from any URL format
    const apiPathMatch = url.match(/\/api\/.*/);
    if (apiPathMatch) {
      shouldRewrite = true;
      path = apiPathMatch[0];
      console.log('[🔄 HARDCODED URL DETECTED]', url, '→ Path:', path);
    }
  }
  // Case 4: General URL with /api/ path
  else if (typeof url === 'string' && url.includes('/api/')) {
    const apiPathMatch = url.match(/\/api\/.*/);
    if (apiPathMatch) {
      shouldRewrite = true;
      path = apiPathMatch[0];
    }
  }
  
  // If we should rewrite and API check is running, queue the request
  if (shouldRewrite && window.API_STATUS.isChecking) {
    console.log('[⏳ API CHECK IN PROGRESS] Queueing request:', originalUrl);
    // Store the original URL format to ensure proper rewriting later
    return enqueueRequest({ 
      url: originalUrl, 
      options, 
      resolve: null, 
      path: path 
    });
  }
  
  // Normal fetch behavior after API is ready
  if (shouldRewrite) {
    url = `${window.BASE_API}${path}`;
    console.log('[🔄 FETCH REWRITE]', originalUrl, '→', url);
  }
  
  return oldFetch(url, ...args);
};

// 🔎 Check server nào sống nhất → dùng luôn
;(async () => {
  console.log('[🔎 CHECKING API ENDPOINTS]', 'Starting health checks...');
  let foundLiveAPI = false;
  
  for (const url of URLS) {
    try {
      console.log('[🔍 TESTING API]', url);
      window.API_STATUS.checkedUrls.push(url);
      
      const startTime = performance.now();
      // Use direct oldFetch to avoid recursion
      const res = await oldFetch(`${url}/api/gigs?limit=5&sort_by=created_at&sort_order=desc&filter_by_status=active`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (res.ok) {
        foundLiveAPI = true;
        window.BASE_API = url;
        window.API_STATUS.selectedUrl = url;
        console.log('[✅ API ALIVE]', url, `(Response time: ${responseTime}ms)`);
        console.log('[🔥 BASE_API SELECTED]', url);
        break;
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
  
  // Mark API check as complete
  window.API_STATUS.isChecking = false;
  window.API_STATUS.isReady = true;
  
  // Process any queued requests
  processQueue();
  
  // Dispatch a custom event to notify components that the API is ready
  window.dispatchEvent(new CustomEvent('apiready', { detail: { baseApi: window.BASE_API } }));
})()


const Introduction = () => {
  const [apiReady, setApiReady] = useState(!window.API_STATUS.isChecking);
  const [apiUrl, setApiUrl] = useState(window.BASE_API);
  
  // Listen for API ready event
  useEffect(() => {
    const handleApiReady = (event) => {
      console.log('[🎉 API READY EVENT]', event.detail.baseApi);
      setApiReady(true);
      setApiUrl(event.detail.baseApi);
    };
    
    // If API is already ready, update state
    if (window.API_STATUS.isReady) {
      setApiReady(true);
      setApiUrl(window.BASE_API);
    } else {
      // Otherwise listen for the event
      window.addEventListener('apiready', handleApiReady);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('apiready', handleApiReady);
    };
  }, []);

  return (
    <div className="min-h-screen bg-purple-50 font-sans">
      {/* API loading indicator */}
      {!apiReady && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2 px-4 flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Finding fastest API server...
        </div>
      )}
      
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
        
        {/* API status indicator (only shown during development) */}
        {import.meta.env.DEV && apiReady && (
          <div className="fixed bottom-0 right-0 bg-gray-800 text-white text-xs p-2 rounded-tl-md opacity-75">
            API: {apiUrl}
          </div>
        )}

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