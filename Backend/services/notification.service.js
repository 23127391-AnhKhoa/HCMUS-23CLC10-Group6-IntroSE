/**
 * Notification Service - Handle notifications for order events
 * 
 * @file notification.service.js
 * @description Service for managing order-related notifications
 */

const NotificationService = {
  /**
   * Send order status update notification
   * 
   * @param {Object} order - Order object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} recipientRole - Recipient role (buyer/seller)
   */
  sendOrderStatusUpdate: async (order, oldStatus, newStatus, recipientRole) => {
    try {
      console.log('📧 Sending order status notification:', {
        orderId: order.id,
        oldStatus,
        newStatus,
        recipientRole
      });

      const notifications = [];

      // Determine notification content based on status change
      switch (newStatus) {
        case 'in_progress':
          if (recipientRole === 'buyer') {
            notifications.push({
              type: 'order_accepted',
              title: 'Order Accepted',
              message: `Your order #${order.id} has been accepted and is now in progress.`,
              recipient_id: order.client_id,
              order_id: order.id
            });
          }
          break;

        case 'delivered':
          if (recipientRole === 'buyer') {
            notifications.push({
              type: 'order_delivered',
              title: 'Order Delivered',
              message: `Your order #${order.id} has been delivered. Review the delivery and complete payment.`,
              recipient_id: order.client_id,
              order_id: order.id
            });
          }
          break;

        case 'completed':
          notifications.push({
            type: 'order_completed',
            title: 'Order Completed',
            message: `Order #${order.id} has been completed successfully.`,
            recipient_id: order.client_id,
            order_id: order.id
          });
          
          notifications.push({
            type: 'payment_received',
            title: 'Payment Received',
            message: `You have received payment for order #${order.id}.`,
            recipient_id: order.gig_owner_id,
            order_id: order.id
          });
          break;

        case 'revision_requested':
          if (recipientRole === 'seller') {
            notifications.push({
              type: 'revision_requested',
              title: 'Revision Requested',
              message: `The buyer has requested a revision for order #${order.id}.`,
              recipient_id: order.gig_owner_id,
              order_id: order.id
            });
          }
          break;

        case 'cancelled':
          const cancelledRecipient = recipientRole === 'buyer' ? order.gig_owner_id : order.client_id;
          notifications.push({
            type: 'order_cancelled',
            title: 'Order Cancelled',
            message: `Order #${order.id} has been cancelled.`,
            recipient_id: cancelledRecipient,
            order_id: order.id
          });
          break;
      }

      // In a real application, you would save these notifications to database
      // and possibly send real-time notifications via WebSocket, push notifications, etc.
      
      // For now, just log them
      notifications.forEach(notification => {
        console.log('📨 Notification:', notification);
      });

      return notifications;

    } catch (error) {
      console.error('❌ Error sending order status notification:', error);
      throw error;
    }
  },

  /**
   * Send payment notification
   * 
   * @param {Object} order - Order object
   * @param {number} amount - Payment amount
   */
  sendPaymentNotification: async (order, amount) => {
    try {
      console.log('💳 Sending payment notification:', {
        orderId: order.id,
        amount
      });

      const notifications = [
        {
          type: 'payment_processed',
          title: 'Payment Processed',
          message: `Payment of $${amount} for order #${order.id} has been processed successfully.`,
          recipient_id: order.client_id,
          order_id: order.id
        },
        {
          type: 'payment_received',
          title: 'Payment Received',
          message: `You have received $${amount} for order #${order.id}.`,
          recipient_id: order.gig_owner_id,
          order_id: order.id
        }
      ];

      // Log notifications (in real app, save to database)
      notifications.forEach(notification => {
        console.log('📨 Payment Notification:', notification);
      });

      return notifications;

    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
      throw error;
    }
  },

  /**
   * Send delivery upload notification
   * 
   * @param {Object} order - Order object
   * @param {number} fileCount - Number of files uploaded
   */
  sendDeliveryUploadNotification: async (order, fileCount) => {
    try {
      console.log('📁 Sending delivery upload notification:', {
        orderId: order.id,
        fileCount
      });

      const notification = {
        type: 'delivery_uploaded',
        title: 'Delivery Files Uploaded',
        message: `${fileCount} delivery file(s) have been uploaded for order #${order.id}.`,
        recipient_id: order.client_id,
        order_id: order.id
      };

      // Log notification (in real app, save to database)
      console.log('📨 Delivery Upload Notification:', notification);

      return [notification];

    } catch (error) {
      console.error('❌ Error sending delivery upload notification:', error);
      throw error;
    }
  }
};

module.exports = NotificationService;
