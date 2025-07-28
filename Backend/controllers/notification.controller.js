// controllers/notification.controller.js
const NotificationModel = require('../models/notification.model');
const supabase = require('../config/supabaseClient');

const NotificationController = {
  /**
   * Get notifications for authenticated user
   */
  async getNotifications(req, res) {
    try {
        console.log("🧩 req.user = ", req.user);

      const userId = req.user.uuid;
      const { 
        page = 1, 
        limit = 20, 
        unread_only = false,
        type = null
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const notifications = await NotificationModel.getByUserId(userId, {
        limit: parseInt(limit),
        offset,
        unreadOnly: unread_only === 'true',
        type
      });

      // Get total count for pagination
      let countQuery = supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (unread_only === 'true') {
        countQuery = countQuery.eq('is_read', false);
      }

      if (type) {
        countQuery = countQuery.eq('type', type);
      }

      const { count: totalCount } = await countQuery;

      res.status(200).json({
        status: 'success',
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount || 0,
            pages: Math.ceil((totalCount || 0) / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.uuid;
      const count = await NotificationModel.getUnreadCount(userId);

      res.status(200).json({
        status: 'success',
        data: { count }
      });
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.uuid;
      const { notificationId } = req.params;

      const notification = await NotificationModel.markAsRead(notificationId, userId);

      res.status(200).json({
        status: 'success',
        data: { notification },
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.uuid;
      const notifications = await NotificationModel.markAllAsRead(userId);

      res.status(200).json({
        status: 'success',
        data: { notifications },
        message: `Marked ${notifications.length} notifications as read`
      });
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.uuid;
      const { notificationId } = req.params;

      const notification = await NotificationModel.delete(notificationId, userId);

      res.status(200).json({
        status: 'success',
        data: { notification },
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  },

  /**
   * Create notification (internal use - for system/admin)
   */
  async createNotification(req, res) {
    try {
      const {
        user_id,
        type,
        title,
        message,
        data = {}
      } = req.body;

      if (!user_id || !type || !title || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: user_id, type, title, message'
        });
      }

      const notification = await NotificationModel.create({
        user_id,
        type,
        title,
        message,
        data
      });

      // Send realtime notification using Supabase realtime
      try {
        await supabase
          .channel('notifications')
          .send({
            type: 'broadcast',
            event: 'new_notification',
            payload: {
              user_id,
              notification
            }
          });
      } catch (realtimeError) {
        console.warn('⚠️ Failed to send realtime notification:', realtimeError);
        // Don't fail the request if realtime fails
      }

      res.status(201).json({
        status: 'success',
        data: { notification },
        message: 'Notification created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create notification',
        error: error.message
      });
    }
  }
};

module.exports = NotificationController;
