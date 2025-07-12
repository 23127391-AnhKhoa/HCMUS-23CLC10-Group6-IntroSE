// Frontend API Configuration

// Use the dynamically selected API URL from Introduction.jsx
// This will return either the dynamically selected URL or fallback to localhost
const getBaseUrl = () => {
  if (window.BASE_API) {
    return `${window.BASE_API}/api`;
  }
  
  // Fallback for modules that load before API detection
  // This will be overridden once the API detection completes
  return 'https://hcmus-23clc10-group6-introse.onrender.com/api';
};

const API_BASE_URL = getBaseUrl();

console.log('[🔌 API CONFIG] Using API URL:', API_BASE_URL);

export default API_BASE_URL;