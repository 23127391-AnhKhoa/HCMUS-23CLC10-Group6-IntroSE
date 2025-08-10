import React, { useState, useEffect } from 'react';
import HeroSection from '../components/Introduction/HeroSection';
import Navbar from '../Common/Navbar_LD';
import FeaturesSection from '../components/Introduction/FeatureSection';
import StatsSection from '../components/Introduction/StatsSection';
import HowItWorksSection from '../components/Introduction/HowItWorksSection';
import CategoriesSection from '../components/Introduction/CategoriesSection';
import TopSellersSection from '../components/Introduction/TopSellersSection';
import CTASection from '../components/Introduction/CTASection';
import Footer from '../Common/Footer';
import LoadingScreen from '../components/LoadingScreen';
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
window.BASE_API = URLS.at(-1) || 'https://hcmus-23clc10-group6-introse.onrender.com'
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
  const [showLoading, setShowLoading] = useState(true);
  const [introductionReady, setIntroductionReady] = useState(false);
  
  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setShowLoading(false);
    // Delay showing the introduction content for smooth transition
    setTimeout(() => {
      setIntroductionReady(true);
    }, 100);
  };
  
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
    <>
      {/* Show loading screen first */}
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      
      {/* Show introduction content after loading is complete */}
      {introductionReady && (
        <div className={`min-h-screen bg-purple-50 font-sans transition-opacity duration-1000 ease-out ${
          introductionReady ? 'opacity-100' : 'opacity-0'
        }`} style={{
          animation: introductionReady ? 'fadeIn 0.8s ease-out' : 'none'
        }}>
          
          <main>
            <Navbar />
            <HeroSection />

            <StatsSection />
           
            <FeaturesSection/>
            <HowItWorksSection />
            <CategoriesSection />
            <TopSellersSection />
            
            <CTASection />
            <Footer/>
          </main>
        </div>
      )}
    </>
  );
};

export default Introduction;