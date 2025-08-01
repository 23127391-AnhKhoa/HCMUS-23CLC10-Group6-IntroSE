/**
 * Auto Payment Service - Handles automatic payment processing
 * 
 * @file autoPayment.service.js
 * @description Service for managing automatic payments when response time expires
 */

const Order = require('../models/order.model');
const NotificationService = require('./notification.service');
const supabase = require('../config/supabaseClient');

const AutoPaymentService = {
  /**
   * Start download timer for an order
   * Sets download_start_time and calculates auto_payment_deadline
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  startDownloadTimer: async (orderId) => {
    try {
      console.log('🕐 [Auto Payment] Starting download timer for order:', orderId);
      
      // Get order with response time hours
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const downloadStartTime = new Date();
      const responseTimeMs = (order.response_time_hours || 24) * 60 * 60 * 1000; // Convert hours to milliseconds
      const autoPaymentDeadline = new Date(downloadStartTime.getTime() + responseTimeMs);

      // Update order with download timer info
      const updatedOrder = await Order.updateById(orderId, {
        download_start_time: downloadStartTime.toISOString(),
        auto_payment_deadline: autoPaymentDeadline.toISOString()
      });

      console.log('✅ [Auto Payment] Download timer started. Deadline:', autoPaymentDeadline);

      // Schedule auto payment check
      setTimeout(() => {
        AutoPaymentService.checkAndProcessAutoPayment(orderId);
      }, responseTimeMs);

      return updatedOrder;
    } catch (error) {
      console.error('❌ [Auto Payment] Error starting download timer:', error);
      throw error;
    }
  },

  /**
   * Check and process automatic payment if no response from buyer
   * 
   * @param {string} orderId - Order ID
   */
  checkAndProcessAutoPayment: async (orderId) => {
    try {
      console.log('🔍 [Auto Payment] Checking auto payment for order:', orderId);
      
      const order = await Order.findById(orderId);
      if (!order) {
        console.log('⚠️ [Auto Payment] Order not found, skipping');
        return;
      }

      // Check if order is still in delivered status (no feedback from buyer)
      if (order.status !== 'delivered') {
        console.log('ℹ️ [Auto Payment] Order status changed, skipping auto payment. Current status:', order.status);
        return;
      }

      // Check if deadline has passed
      const now = new Date();
      const deadline = new Date(order.auto_payment_deadline);
      
      if (now < deadline) {
        console.log('⏰ [Auto Payment] Deadline not reached yet, skipping');
        return;
      }

      console.log('💰 [Auto Payment] Processing automatic payment for order:', orderId);

      // Process automatic payment
      await AutoPaymentService.processAutoPayment(orderId);

    } catch (error) {
      console.error('❌ [Auto Payment] Error in auto payment check:', error);
    }
  },

  /**
   * Process automatic payment
   * Transfers money from buyer to seller automatically
   * 
   * @param {string} orderId - Order ID
   */
  processAutoPayment: async (orderId) => {
    try {
      console.log('💳 [Auto Payment] Processing automatic payment for order:', orderId);
      
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const sellerId = order.gig_owner_id;
      const buyerId = order.client_id;
      const amount = order.price_at_purchase;

      // Use the same payment processing as manual payment
      const { data: transactionResult, error: transactionError } = await supabase.rpc('process_order_payment', {
        p_order_id: parseInt(orderId),
        p_buyer_id: buyerId,
        p_seller_id: sellerId,
        p_amount: amount
      });

      if (transactionError) {
        console.error('Auto payment transaction failed:', transactionError);
        throw new Error(transactionError.message || 'Auto payment processing failed');
      }

      console.log('✅ [Auto Payment] Payment processed via database function:', transactionResult);
      
      // Note: Order status is already updated to 'completed' by the database function
      // No need to update it again here

      // Send notifications
      try {
        await NotificationService.sendNotification({
          userId: buyerId,
          type: 'auto_payment_processed',
          title: 'Automatic Payment Processed',
          message: `Payment has been automatically processed for order #${orderId} due to response time expiration.`,
          orderId: orderId
        });

        await NotificationService.sendNotification({
          userId: sellerId,
          type: 'payment_received',
          title: 'Payment Received',
          message: `You have received payment for order #${orderId} (automatic payment).`,
          orderId: orderId
        });
      } catch (notificationError) {
        console.error('❌ Failed to send auto payment notifications:', notificationError);
        // Don't fail the payment if notifications fail
      }

      console.log('✅ [Auto Payment] Automatic payment processed successfully');
      return transactionResult;

    } catch (error) {
      console.error('❌ [Auto Payment] Error processing automatic payment:', error);
      throw error;
    }
  },

  /**
   * Clear auto payment timer when order is completed manually
   * 
   * @param {string} orderId - Order ID
   */
  clearAutoPaymentTimer: async (orderId) => {
    try {
      console.log('⏰ [Auto Payment] Clearing timer for order:', orderId);
      
      // Update order to clear timer fields
      const updatedOrder = await Order.updateById(orderId, {
        auto_payment_deadline: null,
        payment_processed_manually: true
      });

      console.log('✅ [Auto Payment] Timer cleared successfully');
      return updatedOrder;
    } catch (error) {
      console.error('❌ [Auto Payment] Error clearing timer:', error);
      throw error;
    }
  },

  /**
   * Check all pending auto payments
   * Called periodically to check for expired deadlines
   */
  checkAllPendingAutoPayments: async () => {
    try {
      console.log('🔄 [Auto Payment] Checking all pending auto payments');
      
      // Get all orders with auto payment deadline that are still in delivered status
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('id, auto_payment_deadline')
        .eq('status', 'delivered')
        .not('auto_payment_deadline', 'is', null);

      if (error) {
        throw error;
      }

      const now = new Date();
      const expiredOrders = orders.filter(order => 
        new Date(order.auto_payment_deadline) <= now
      );

      console.log(`⏰ [Auto Payment] Found ${expiredOrders.length} expired orders`);

      // Process each expired order using the checkAndProcessAutoPayment method
      // This ensures proper validation and error handling
      for (const order of expiredOrders) {
        await AutoPaymentService.checkAndProcessAutoPayment(order.id);
      }

      return {
        totalChecked: orders.length,
        expiredProcessed: expiredOrders.length
      };

    } catch (error) {
      console.error('❌ [Auto Payment] Error checking pending auto payments:', error);
      throw error;
    }
  }
};

module.exports = AutoPaymentService;
