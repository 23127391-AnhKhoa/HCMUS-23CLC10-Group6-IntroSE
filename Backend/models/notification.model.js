// models/notification.model.js
const supabase = require('../config/supabaseClient');

const NotificationModel = {
  /**
   * Create a new notification
   * @param {Object} notificationData - The notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
      }

      console.log('✅ Notification created:', data);
      return data;
    } catch (error) {
      console.error('❌ NotificationModel.create error:', error);
      throw error;
    }
  },

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async getByUserId(userId, options = {}) {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        unreadOnly = false,
        type = null
      } = options;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (type) {
        query = query.eq('type', type);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ NotificationModel.getByUserId error:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ NotificationModel.markAsRead error:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Updated notifications
   */
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ NotificationModel.markAllAsRead error:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Deleted notification
   */
  async delete(notificationId, userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ NotificationModel.delete error:', error);
      throw error;
    }
  },

  /**
   * Get unread count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error getting unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ NotificationModel.getUnreadCount error:', error);
      throw error;
    }
  },

  /**
   * Bulk create notifications
   * @param {Array} notifications - Array of notification data
   * @returns {Promise<Array>} Created notifications
   */
  async bulkCreate(notifications) {
    try {
      const notificationsWithDefaults = notifications.map(notification => ({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        is_read: false,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationsWithDefaults)
        .select();

      if (error) {
        console.error('❌ Error bulk creating notifications:', error);
        throw error;
      }

      console.log(`✅ Bulk created ${data.length} notifications`);
      return data;
    } catch (error) {
      console.error('❌ NotificationModel.bulkCreate error:', error);
      throw error;
    }
  }
};

module.exports = NotificationModel;
