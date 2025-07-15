// API Configuration
const API_CONFIG = {
  // Base URL for backend API
  BASE_URL: 'http://localhost:8000/api',
  
  // Timeout for requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // User endpoints
    USERS: '/users',
    
    // Gig endpoints
    GIGS: '/gigs',
    
    // Order endpoints
    ORDERS: '/orders',
    UPLOAD_DELIVERY: (orderId) => `/orders/${orderId}/upload-delivery`,
    DELIVERY_FILES: (orderId) => `/orders/${orderId}/delivery-files`,
    MARK_DELIVERED: (orderId) => `/orders/${orderId}/mark-delivered`,
    PAYMENT: (orderId) => `/orders/${orderId}/payment`,
    REQUEST_REVISION: (orderId) => `/orders/${orderId}/request-revision`,
    ORDER_WORKFLOW: (orderId) => `/orders/${orderId}/workflow`,
    
    // Upload endpoints
    UPLOAD: '/upload',
    UPLOAD_MULTIPLE: '/upload/multiple',
    UPLOAD_FIELDS: '/upload/fields',
    
    // Conversation endpoints
    CONVERSATIONS: '/conversations',
    
    // Transaction endpoints
    TRANSACTIONS: '/transactions'
  }
};

export default API_CONFIG;