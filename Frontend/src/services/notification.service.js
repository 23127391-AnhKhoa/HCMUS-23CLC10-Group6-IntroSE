// services/notification.service.js

class NotificationService {
  static BASE_URL = 'http://localhost:8000/api/notifications';

  // Helper method to get auth headers
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Create a new notification (usually called from backend)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification(notificationData) {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create notification');
      }

      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Get notifications for current user
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications data
   */
  static async getNotifications(options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false, type = null } = options;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (unreadOnly) {
        params.append('unread_only', 'true');
      }

      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`${this.BASE_URL}?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      return data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  static async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark notification as read');
      }

      return data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Updated notifications
   */
  static async markAllAsRead() {
    try {
      const response = await fetch(`${this.BASE_URL}/read-all`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }

      return data;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Deleted notification
   */
  static async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${this.BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete notification');
      }

      return data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   * @returns {Promise<Object>} Unread count
   */
  static async getUnreadCount() {
    try {
      const response = await fetch(`${this.BASE_URL}/unread-count`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get unread count');
      }

      return data;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Create order notification (to be called when order is created)
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created notification
   */
  static async createOrderNotification(orderData) {
    try {
      const notificationData = {
        user_id: orderData.gig_owner_id, // Notify the gig owner
        type: 'order_created',
        title: 'New Order Received!',
        message: `You have received a new order for "${orderData.gig_title}"`,
        data: {
          orderId: orderData.id,
          gigId: orderData.gig_id,
          gigTitle: orderData.gig_title,
          clientName: orderData.client_name,
          price: orderData.price_at_purchase
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Create order notification error:', error);
      throw error;
    }
  }

  /**
   * Create message notification
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Created notification
   */
  static async createMessageNotification(messageData) {
    try {
      const notificationData = {
        user_id: messageData.receiver_id,
        type: 'message_received',
        title: 'New Message',
        message: `You have a new message from ${messageData.sender_name}`,
        data: {
          conversationId: messageData.conversation_id,
          senderId: messageData.sender_id,
          senderName: messageData.sender_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Create message notification error:', error);
      throw error;
    }
  }

  /**
   * Create payment notification
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created notification
   */
  static async createPaymentNotification(paymentData) {
    try {
      const notificationData = {
        user_id: paymentData.seller_id,
        type: 'payment_received',
        title: 'Payment Received!',
        message: `You have received a payment of $${paymentData.amount} for order #${paymentData.order_id}`,
        data: {
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          transactionId: paymentData.transaction_id
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Create payment notification error:', error);
      throw error;
    }
  }
}

export default NotificationService;
