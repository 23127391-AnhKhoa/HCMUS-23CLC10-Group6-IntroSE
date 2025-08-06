// API Configuration Constants
export const API_BASE_URL = 'http://localhost:8000/api';
export const API_SERVER_URL = 'http://localhost:8000';

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
