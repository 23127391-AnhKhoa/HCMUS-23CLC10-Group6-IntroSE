// hooks/useOrderNotification.js
import { useCallback } from 'react';
import NotificationService from '../services/notification.service';

export const useOrderNotification = () => {
  
  /**
   * Create notification when a new order is placed
   * @param {Object} orderData - Order data
   * @returns {Promise<boolean>} Success status
   */
  const notifyOrderCreated = useCallback(async (orderData) => {
    try {
      console.log('🔔 Creating order notification for:', orderData);
      
      // Create notification for the gig owner
      await NotificationService.createOrderNotification({
        id: orderData.id,
        gig_owner_id: orderData.gig_owner_id,
        gig_id: orderData.gig_id,
        gig_title: orderData.gig_title,
        client_name: orderData.client_name,
        price_at_purchase: orderData.price_at_purchase
      });

      console.log('✅ Order notification created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create order notification:', error);
      return false;
    }
  }, []);

  /**
   * Create notification when order status changes
   * @param {Object} orderData - Order data
   * @param {string} newStatus - New order status
   * @param {string} recipientId - Who should receive the notification
   * @returns {Promise<boolean>} Success status
   */
  const notifyOrderStatusChange = useCallback(async (orderData, newStatus, recipientId) => {
    try {
      let notificationData = {
        user_id: recipientId,
        data: {
          orderId: orderData.id,
          gigId: orderData.gig_id,
          gigTitle: orderData.gig_title
        }
      };

      switch (newStatus) {
        case 'in_progress':
          notificationData = {
            ...notificationData,
            type: 'order_accepted',
            title: 'Order Accepted!',
            message: `Your order for "${orderData.gig_title}" has been accepted and is now in progress.`
          };
          break;

        case 'delivered':
          notificationData = {
            ...notificationData,
            type: 'order_delivered',
            title: 'Order Delivered!',
            message: `Your order for "${orderData.gig_title}" has been delivered. Please review and complete payment.`
          };
          break;

        case 'completed':
          notificationData = {
            ...notificationData,
            type: 'order_completed',
            title: 'Order Completed!',
            message: `Order for "${orderData.gig_title}" has been completed successfully.`
          };
          break;

        case 'cancelled':
          notificationData = {
            ...notificationData,
            type: 'order_cancelled',
            title: 'Order Cancelled',
            message: `Order for "${orderData.gig_title}" has been cancelled.`
          };
          break;

        case 'revision_requested':
          notificationData = {
            ...notificationData,
            type: 'revision_requested',
            title: 'Revision Requested',
            message: `Client has requested revisions for "${orderData.gig_title}".`
          };
          break;

        default:
          console.log('No notification needed for status:', newStatus);
          return true;
      }

      await NotificationService.createNotification(notificationData);
      console.log('✅ Order status notification created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create order status notification:', error);
      return false;
    }
  }, []);

  /**
   * Create notification when payment is received
   * @param {Object} paymentData - Payment data
   * @returns {Promise<boolean>} Success status
   */
  const notifyPaymentReceived = useCallback(async (paymentData) => {
    try {
      await NotificationService.createPaymentNotification(paymentData);
      console.log('✅ Payment notification created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create payment notification:', error);
      return false;
    }
  }, []);

  /**
   * Create notification for message received
   * @param {Object} messageData - Message data
   * @returns {Promise<boolean>} Success status
   */
  const notifyMessageReceived = useCallback(async (messageData) => {
    try {
      await NotificationService.createMessageNotification(messageData);
      console.log('✅ Message notification created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create message notification:', error);
      return false;
    }
  }, []);

  return {
    notifyOrderCreated,
    notifyOrderStatusChange,
    notifyPaymentReceived,
    notifyMessageReceived
  };
};
