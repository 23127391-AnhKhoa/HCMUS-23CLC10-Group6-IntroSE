// services/notification.service.js
const NotificationModel = require('../models/notification.model');
const { supabase } = require('../config/supabaseClient');

const NotificationService = {
  /**
   * Notification types
   */
  TYPES: {
    ORDER_RECEIVED: 'order_received',
    ORDER_ACCEPTED: 'order_accepted',
    ORDER_REJECTED: 'order_rejected',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_COMPLETED: 'order_completed',
    ORDER_CANCELLED: 'order_cancelled',
    PAYMENT_RECEIVED: 'payment_received',
    REVIEW_RECEIVED: 'review_received',
    GIG_APPROVED: 'gig_approved',
    GIG_REJECTED: 'gig_rejected',
    MESSAGE_RECEIVED: 'message_received',
    SYSTEM_ANNOUNCEMENT: 'system_announcement'
  },

  /**
   * Create and send notification with realtime
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createAndSend(notificationData) {
    try {
      // Create notification in database
      const notification = await NotificationModel.create(notificationData);

      // Send realtime notification
      await this.sendRealtimeNotification(notificationData.user_id, notification);

      return notification;
    } catch (error) {
      console.error('❌ Error creating and sending notification:', error);
      throw error;
    }
  },

  /**
   * Send realtime notification using Supabase broadcast
   * @param {string} userId - Target user ID
   * @param {Object} notification - Notification data
   */
  async sendRealtimeNotification(userId, notification) {
    try {
      await supabase
        .channel('notifications')
        .send({
          type: 'broadcast',
          event: 'new_notification',
          payload: {
            user_id: userId,
            notification
          }
        });

      console.log(`📡 Realtime notification sent to user ${userId}`);
    } catch (error) {
      console.warn('⚠️ Failed to send realtime notification:', error);
      // Don't throw error as this is not critical
    }
  },

  /**
   * Create notification when new order is received
   * @param {Object} order - Order data
   * @param {Object} gig - Gig data
   * @param {Object} buyer - Buyer data
   */
  async notifyNewOrder(order, gig, buyer) {
    try {
      const notification = {
        user_id: gig.user_id, // Seller/gig owner
        type: this.TYPES.ORDER_RECEIVED,
        title: 'New Order Received! 🎉',
        message: `${buyer.full_name || buyer.email} has ordered your "${gig.title}" service for $${order.price_at_purchase}`,
        data: {
          order_id: order.id,
          gig_id: gig.id,
          buyer_id: buyer.id,
          buyer_name: buyer.full_name || buyer.email,
          gig_title: gig.title,
          price: order.price_at_purchase
        }
      };

      return await this.createAndSend(notification);
    } catch (error) {
      console.error('❌ Error notifying new order:', error);
      throw error;
    }
  },

  /**
   * Create notification when order status changes
   * @param {Object} order - Order data
   * @param {string} newStatus - New order status
   * @param {Object} gig - Gig data
   * @param {Object} seller - Seller data
   * @param {Object} buyer - Buyer data
   */
  async notifyOrderStatusChange(order, newStatus, gig, seller, buyer) {
    try {
      let notification;

      switch (newStatus) {
        case 'accepted':
        case 'in_progress':
          notification = {
            user_id: buyer.id,
            type: this.TYPES.ORDER_ACCEPTED,
            title: 'Order Accepted! ✅',
            message: `${seller.full_name || seller.email} has accepted your order for "${gig.title}"`,
            data: {
              order_id: order.id,
              gig_id: gig.id,
              seller_id: seller.id,
              seller_name: seller.full_name || seller.email,
              gig_title: gig.title
            }
          };
          break;

        case 'cancelled':
        case 'rejected':
          notification = {
            user_id: buyer.id,
            type: this.TYPES.ORDER_REJECTED,
            title: 'Order Cancelled ❌',
            message: `Your order for "${gig.title}" has been cancelled`,
            data: {
              order_id: order.id,
              gig_id: gig.id,
              seller_id: seller.id,
              seller_name: seller.full_name || seller.email,
              gig_title: gig.title
            }
          };
          break;

        case 'delivered':
          notification = {
            user_id: buyer.id,
            type: this.TYPES.ORDER_DELIVERED,
            title: 'Order Delivered! 📦',
            message: `${seller.full_name || seller.email} has delivered your order for "${gig.title}"`,
            data: {
              order_id: order.id,
              gig_id: gig.id,
              seller_id: seller.id,
              seller_name: seller.full_name || seller.email,
              gig_title: gig.title
            }
          };
          break;

        case 'completed':
          // Notify seller about payment
          notification = {
            user_id: seller.id,
            type: this.TYPES.ORDER_COMPLETED,
            title: 'Payment Received! 💰',
            message: `Payment received for order "${gig.title}" - $${order.price_at_purchase}`,
            data: {
              order_id: order.id,
              gig_id: gig.id,
              buyer_id: buyer.id,
              buyer_name: buyer.full_name || buyer.email,
              gig_title: gig.title,
              amount: order.price_at_purchase
            }
          };
          break;

        default:
          console.log(`⚠️ No notification configured for status: ${newStatus}`);
          return null;
      }

      if (notification) {
        return await this.createAndSend(notification);
      }
    } catch (error) {
      console.error('❌ Error notifying order status change:', error);
      throw error;
    }
  },

  /**
   * Create notification for new message
   * @param {Object} message - Message data
   * @param {Object} sender - Sender data
   * @param {Object} recipient - Recipient data
   */
  async notifyNewMessage(message, sender, recipient) {
    try {
      const notification = {
        user_id: recipient.id,
        type: this.TYPES.MESSAGE_RECEIVED,
        title: 'New Message 💬',
        message: `${sender.full_name || sender.email} sent you a message`,
        data: {
          message_id: message.id,
          conversation_id: message.conversation_id,
          sender_id: sender.id,
          sender_name: sender.full_name || sender.email,
          preview: message.content.substring(0, 100)
        }
      };

      return await this.createAndSend(notification);
    } catch (error) {
      console.error('❌ Error notifying new message:', error);
      throw error;
    }
  },

  /**
   * Create notification for gig approval/rejection
   * @param {Object} gig - Gig data
   * @param {string} status - 'approved' or 'rejected'
   * @param {string} reason - Reason for rejection (optional)
   */
  async notifyGigStatus(gig, status, reason = null) {
    try {
      let notification;

      if (status === 'active') {
        notification = {
          user_id: gig.user_id,
          type: this.TYPES.GIG_APPROVED,
          title: 'Gig Approved! 🎉',
          message: `Your gig "${gig.title}" has been approved and is now live`,
          data: {
            gig_id: gig.id,
            gig_title: gig.title,
            status: 'approved'
          }
        };
      } else if (status === 'rejected' || status === 'denied') {
        notification = {
          user_id: gig.user_id,
          type: this.TYPES.GIG_REJECTED,
          title: 'Gig Rejected ❌',
          message: `Your gig "${gig.title}" has been rejected${reason ? ': ' + reason : ''}`,
          data: {
            gig_id: gig.id,
            gig_title: gig.title,
            status: 'rejected',
            reason: reason
          }
        };
      }

      if (notification) {
        return await this.createAndSend(notification);
      }
    } catch (error) {
      console.error('❌ Error notifying gig status:', error);
      throw error;
    }
  },

  /**
   * Create notification for payment received
   * @param {Object} transaction - Transaction data
   * @param {Object} user - User receiving payment
   */
  async notifyPaymentReceived(transaction, user) {
    try {
      const notification = {
        user_id: user.id,
        type: this.TYPES.PAYMENT_RECEIVED,
        title: 'Payment Received! 💰',
        message: `You received $${transaction.amount} payment`,
        data: {
          transaction_id: transaction.id,
          amount: transaction.amount,
          order_id: transaction.order_id
        }
      };

      return await this.createAndSend(notification);
    } catch (error) {
      console.error('❌ Error notifying payment received:', error);
      throw error;
    }
  }
};

module.exports = NotificationService;
