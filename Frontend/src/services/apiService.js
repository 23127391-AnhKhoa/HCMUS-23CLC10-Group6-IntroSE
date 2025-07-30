// src/services/apiService.js

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  // Helper method to get auth headers
  static getAuthHeaders(includeContentType = true) {
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found');
    }
    
    return headers;
  }

  // Helper method to handle API responses
  static async handleApiResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }

  // Order API methods
  static async fetchOrders(type = 'all', status = null) {
    try {
      let url = `${API_BASE_URL}/orders`;
      const params = new URLSearchParams();
      
      if (type !== 'all') {
        params.append('type', type);
      }
      
      if (status) {
        params.append('status', status);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async fetchOrderById(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status, reason = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async uploadDeliveryFiles(orderId, files, message = '') {
    try {
      const formData = new FormData();
      
      Array.from(files).forEach((file, index) => {
        formData.append(`deliveryFiles`, file);
      });
      
      // Add message if provided
      if (message) {
        formData.append('message', message);
      }
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/upload-delivery`, {
        method: 'POST',
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
        body: formData
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error uploading delivery files:', error);
      throw error;
    }
  }


  static async downloadDeliveryFile(orderId, fileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/delivery/file/${fileId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(false)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      return response; // Return the response for blob handling
    } catch (error) {
      console.error('Error downloading delivery file:', error);
      throw error;
    }
  }

  static async processOrderPayment(orderId, paymentData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  static async requestOrderRevision(orderId, revisionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/request-revision`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(revisionData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }
  }

  static async handleRevision(orderId, action, note = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/handle-revision`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action, note })
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error handling revision:', error);
      throw error;
    }
  }

  static async markOrderAsDelivered(orderId) {
    try {
      console.log('🚚 [API] Marking order as delivered:', orderId);
      
      const headers = this.getAuthHeaders();
      console.log('🔑 [API] Auth headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark-delivered`, {
        method: 'POST',
        headers: headers
      });
      
      console.log('📊 [API] Response status:', response.status);
      console.log('📋 [API] Response ok:', response.ok);
      
      const result = await this.handleApiResponse(response);
      console.log('✅ [API] Final result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [API] Error marking order as delivered:', error);
      throw error;
    }
  }

  static async getDeliveryFiles(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/delivery-files`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error getting delivery files:', error);
      throw error;
    }
  }

  static async deleteDeliveryFile(orderId, fileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/delivery-files/${fileId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error deleting delivery file:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  // Gig API methods
  static async fetchGigs(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/gigs?${searchParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      throw error;
    }
  }

  static async fetchGigById(gigId) {
    try {
      const response = await fetch(`${API_BASE_URL}/gigs/${gigId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching gig:', error);
      throw error;
    }
  }

  // User API methods
  static async fetchUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Notification API methods
  static async fetchNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // File upload API methods
  static async uploadFile(file, category) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(false),
        body: formData
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
    // Upload multiple files
  static async uploadMultipleFiles(files) {
    try {
      const formData = new FormData();
      
      // Append each file to FormData
      files.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading multiple files to:', `${API_BASE_URL}/upload/multiple`);
      const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log('Multiple upload API response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Multiple upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  // Upload files with fields (cover + gallery + videos)
  static async uploadFilesWithFields(filesObject) {
    try {
      const formData = new FormData();
      
      // Append cover image
      if (filesObject.cover_image) {
        formData.append('cover_image', filesObject.cover_image);
      }

      // Append gallery images
      if (filesObject.gallery_images && filesObject.gallery_images.length > 0) {
        filesObject.gallery_images.forEach(file => {
          formData.append('gallery_images', file);
        });
      }

      // Append videos
      if (filesObject.videos && filesObject.videos.length > 0) {
        filesObject.videos.forEach(file => {
          formData.append('videos', file);
        });
      }

      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading files with fields to:', `${API_BASE_URL}/upload/fields`);
      const response = await fetch(`${API_BASE_URL}/upload/fields`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log('Fields upload API response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Fields upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Fields upload error:', error);
      throw error;
    }
  }


  // Gig API methods
  static async createGig(gigData) {
    try {
      const response = await fetch(`${API_BASE_URL}/gigs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(gigData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error creating gig:', error);
      throw error;
    }
  }

  static async createGigMedia(gigId, mediaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/gigs/${gigId}/media`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(mediaData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error creating gig media:', error);
      throw error;
    }
  }

  // Conversation API methods
  static async getOrCreateOrderConversation(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/order/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error getting order conversation:', error);
      throw error;
    }
  }

  static async getUserConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  static async getConversationMessages(conversationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  static async sendMessage(conversationId, messageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(messageData)
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async createOrGetConversation(participantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ participant_id: participantId })
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Track file download for auto payment timing
  static async trackFileDownload(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/track-download`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleApiResponse(response);
    } catch (error) {
      console.error('Error tracking file download:', error);
      throw error;
    }
  }
}

export default ApiService;