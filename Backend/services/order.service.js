/**
 * Order Service - Business logic for order operations
 * 
 * @file order.service.js
 * @description Service layer for handling order business logic
 * Processes order data and coordinates between controller and model
 * 
 * @requires ../models/order.model - Order model for database operations
 * @requires ../config/supabaseClient - Supabase client for additional queries
 */

const Order = require('../models/order.model');
const Transaction = require('../models/transaction.model');
const NotificationService = require('./notification.service');
const supabase = require('../config/supabaseClient');

const OrderService = {
  /**
   * Get all orders with pagination and filtering
   * 
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.client_id] - Filter by client ID
   * @param {string} [options.gig_id] - Filter by gig ID
   * @param {string} [options.sort_by='created_at'] - Sort field
   * @param {string} [options.sort_order='desc'] - Sort order
   * @returns {Promise<Object>} Object containing orders array and pagination info
   */
  getAllOrders: async (options) => {
    const {
      page = 1,
      limit = 10,
      status,
      client_id,
      gig_id,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;

    try {
      console.log('📋 [Order Service] getAllOrders called with options:', options);
      
      // Prepare filters
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order
      };

      console.log('🔧 [Order Service] Prepared filters:', filters);

      if (status) {
        filters.status = status;
      }

      if (client_id) {
        filters.client_id = client_id;
      }

      if (gig_id) {
        filters.gig_id = gig_id;
      }

      console.log('🔍 Processed filters:', filters);

      // Get orders with details
      const orders = await Order.findWithDetails(filters);
      console.log('📊 Raw orders from DB:', orders?.length || 0);
      
      // Get total count
      const total = await Order.getCount(filters);
      console.log('📈 Total count:', total);

      // Flatten the nested data for easier frontend consumption
      const flattenedOrders = orders.map(order => ({
        id: order.id,
        client_id: order.client_id,
        gig_id: order.gig_id,
        price_at_purchase: order.price_at_purchase,
        requirement: order.requirement,
        status: order.status,
        created_at: order.created_at,
        completed_at: order.completed_at,
        // Client information
        client_username: order.User?.username,
        client_fullname: order.User?.fullname,
        client_name: order.User?.fullname || order.User?.username || 'Unknown Client',
        client_avatar: order.User?.avt_url || 'https://placehold.co/300x300',
        // Gig information with detailed fields
        gig_title: order.Gigs?.title,
        gig_cover_image: order.Gigs?.cover_image,
        gig_description: order.Gigs?.description,
        gig_price: order.Gigs?.price,
        gig_delivery_days: order.Gigs?.delivery_days,
        gig_num_of_edits: order.Gigs?.num_of_edits,
        gig_status: order.Gigs?.status,
        gig_owner_id: order.Gigs?.owner_id,
        gig_category_id: order.Gigs?.category_id,
        gig_created_at: order.Gigs?.created_at,
        gig_updated_at: order.Gigs?.updated_at,
        // Gig owner information
        gig_owner_username: order.Gigs?.User?.username,
        gig_owner_fullname: order.Gigs?.User?.fullname,
        gig_owner_name: order.Gigs?.User?.fullname || order.Gigs?.User?.username || 'Unknown Seller',
        gig_owner_avatar: order.Gigs?.User?.avt_url || 'https://placehold.co/300x300'
      }));

      console.log('✅ [Order Service] Flattened orders:', flattenedOrders?.length || 0);
      
      return {
        orders: flattenedOrders,
        total: total || 0
      };
    } catch (error) {
      console.error('💥 [Order Service] Error in getAllOrders:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  },

  /**
   * Get order by ID
   * 
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order object with related data
   */
  getOrderById: async (orderId) => {
    try {
      console.log('🔍 OrderService.getOrderById called with ID:', orderId);
      
      const order = await Order.findById(orderId);
      
      if (!order) {
        return null;
      }

      // Flatten the nested data
      const flattenedOrder = {
        id: order.id,
        client_id: order.client_id,
        gig_id: order.gig_id,
        price_at_purchase: order.price_at_purchase,
        requirement: order.requirement,
        status: order.status,
        created_at: order.created_at,
        completed_at: order.completed_at,
        // Client information
        client_username: order.User?.username,
        client_fullname: order.User?.fullname,
        client_name: order.User?.fullname || order.User?.username || 'Unknown Client',
        client_avatar: order.User?.avt_url || 'https://placehold.co/300x300',
        // Gig information with detailed fields
        gig_title: order.Gigs?.title,
        gig_cover_image: order.Gigs?.cover_image,
        gig_description: order.Gigs?.description,
        gig_price: order.Gigs?.price,
        gig_delivery_days: order.Gigs?.delivery_days,
        gig_num_of_edits: order.Gigs?.num_of_edits,
        gig_status: order.Gigs?.status,
        gig_owner_id: order.Gigs?.owner_id,
        gig_category_id: order.Gigs?.category_id,
        gig_created_at: order.Gigs?.created_at,
        gig_updated_at: order.Gigs?.updated_at,
        // Gig owner information
        gig_owner_username: order.Gigs?.User?.username,
        gig_owner_fullname: order.Gigs?.User?.fullname,
        gig_owner_name: order.Gigs?.User?.fullname || order.Gigs?.User?.username || 'Unknown Seller',
        gig_owner_avatar: order.Gigs?.User?.avt_url || 'https://placehold.co/300x300'
      };

      console.log('✅ Order found and flattened');
      console.log('🔍 Debug gig_owner_id:', {
        raw_gig_owner_id: order.Gigs?.owner_id,
        flattened_gig_owner_id: flattenedOrder.gig_owner_id,
        gig_exists: !!order.Gigs,
        gig_owner_exists: !!order.Gigs?.owner_id
      });
      
      return flattenedOrder;
    } catch (error) {
      console.error('💥 Error in getOrderById:', error);
      throw new Error(`Error fetching order: ${error.message}`);
    }
  },

  /**
   * Create a new order
   * 
   * @param {Object} orderData - Order data
   * @param {string} orderData.client_id - Client UUID
   * @param {string} orderData.gig_id - Gig UUID
   * @param {number} orderData.price_at_purchase - Price at purchase
   * @param {string} orderData.requirement - Order requirements
   * @param {string} [orderData.status='pending'] - Order status
   * @returns {Promise<Object>} Created order object
   */
  createOrder: async (orderData) => {
    try {
      console.log('📝 OrderService.createOrder called with data:', orderData);
      
      // Validate required fields
      if (!orderData.client_id || !orderData.gig_id || !orderData.price_at_purchase || !orderData.requirement) {
        throw new Error('Missing required fields: client_id, gig_id, price_at_purchase, and requirement are required');
      }

      // Validate that the gig exists and is active
      const { data: gig, error: gigError } = await supabase
        .from('Gigs')
        .select('id, status, price, owner_id')
        .eq('id', orderData.gig_id)
        .single();

      if (gigError || !gig) {
        throw new Error('Gig not found');
      }

      if (gig.status !== 'active') {
        throw new Error('Cannot order from inactive gig');
      }

      // Validate that user cannot order their own gig
      if (gig.owner_id === orderData.client_id) {
        console.log('❌ [Order Service] User attempted to order their own gig:', {
          gig_id: orderData.gig_id,
          gig_owner: gig.owner_id,
          client_id: orderData.client_id
        });
        throw new Error('You cannot order your own gig');
      }

      // Validate that the client exists
      const { data: client, error: clientError } = await supabase
        .from('User')
        .select('uuid')
        .eq('uuid', orderData.client_id)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // Create the order
      const order = await Order.create(orderData);
      console.log('✅ Order created successfully:', order.id);
      
      return order;
    } catch (error) {
      console.error('💥 Error in createOrder:', error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  },

  /**
   * Update order by ID
   * 
   * @param {number} orderId - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated order object
   */
  updateOrder: async (orderId, updateData) => {
    try {
      console.log('🔄 OrderService.updateOrder called with ID:', orderId, 'and data:', updateData);
      
      // Check if order exists
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Validate status transition if status is being updated
      if (updateData.status) {
        const validStatuses = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'];
        if (!validStatuses.includes(updateData.status)) {
          throw new Error('Invalid status. Must be one of: pending, in_progress, delivered, completed, cancelled');
        }
      }

      const updatedOrder = await Order.updateById(orderId, updateData);
      console.log('✅ Order updated successfully');
      
      return updatedOrder;
    } catch (error) {
      console.error('💥 Error in updateOrder:', error);
      throw new Error(`Error updating order: ${error.message}`);
    }
  },

  /**
   * Delete order by ID
   * 
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Deleted order object
   */
  deleteOrder: async (orderId) => {
    try {
      console.log('🗑️ OrderService.deleteOrder called with ID:', orderId);
      
      // Check if order exists
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Only allow deletion of pending orders
      if (existingOrder.status !== 'pending') {
        throw new Error('Can only delete pending orders');
      }

      const deletedOrder = await Order.deleteById(orderId);
      console.log('✅ Order deleted successfully');
      
      return deletedOrder;
    } catch (error) {
      console.error('💥 Error in deleteOrder:', error);
      throw new Error(`Error deleting order: ${error.message}`);
    }
  },

  /**
   * Get orders for a specific client
   * 
   * @param {string} clientId - Client UUID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of client orders
   */
  getClientOrders: async (clientId, options = {}) => {
    try {
      console.log('👤 [Order Service] getClientOrders called for client:', clientId);
      console.log('🔧 Options:', options);
      
      const orders = await Order.findByClientId(clientId, options);
      console.log('✅ [Order Service] Found', orders?.length || 0, 'orders for client');
      
      // Flatten the nested data for easier frontend consumption
      const flattenedOrders = orders.map(order => ({
        id: order.id,
        client_id: order.client_id,
        gig_id: order.gig_id,
        price_at_purchase: order.price_at_purchase,
        requirement: order.requirement,
        status: order.status,
        created_at: order.created_at,
        completed_at: order.completed_at,
        // Client information (current user)
        client_username: order.User?.username,
        client_fullname: order.User?.fullname,
        client_name: order.User?.fullname || order.User?.username || 'Unknown Client',
        client_avatar: order.User?.avt_url || 'https://placehold.co/300x300',
        // Gig information with detailed fields
        gig_title: order.Gigs?.title,
        gig_cover_image: order.Gigs?.cover_image,
        gig_description: order.Gigs?.description,
        gig_price: order.Gigs?.price,
        gig_delivery_days: order.Gigs?.delivery_days,
        gig_num_of_edits: order.Gigs?.num_of_edits,
        gig_status: order.Gigs?.status,
        gig_owner_id: order.Gigs?.owner_id,
        gig_category_id: order.Gigs?.category_id,
        gig_created_at: order.Gigs?.created_at,
        gig_updated_at: order.Gigs?.updated_at,
        // Gig owner information (seller)
        gig_owner_username: order.Gigs?.User?.username,
        gig_owner_fullname: order.Gigs?.User?.fullname,
        gig_owner_name: order.Gigs?.User?.fullname || order.Gigs?.User?.username || 'Unknown Seller',
        gig_owner_avatar: order.Gigs?.User?.avt_url || 'https://placehold.co/300x300'
      }));

      console.log('✅ [Order Service] Flattened client orders:', flattenedOrders?.length || 0);
      console.log('🔍 Sample order:', flattenedOrders[0]);
      
      return flattenedOrders;
    } catch (error) {
      console.error('💥 [Order Service] Error in getClientOrders:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error fetching client orders: ${error.message}`);
    }
  },

  /**
   * Get orders for gigs owned by a specific user
   * 
   * @param {string} ownerId - Gig owner UUID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of orders for owner's gigs
   */
  getOwnerOrders: async (ownerId, options = {}) => {
    try {
      console.log('👨‍💼 [Order Service] getOwnerOrders called for owner:', ownerId);
      console.log('🔧 Options:', options);
      
      const orders = await Order.findByGigOwnerId(ownerId, options);
      console.log('✅ [Order Service] Found', orders?.length || 0, 'orders for owner');
      
      // Flatten the nested data for easier frontend consumption
      const flattenedOrders = orders.map(order => ({
        id: order.id,
        client_id: order.client_id,
        gig_id: order.gig_id,
        price_at_purchase: order.price_at_purchase,
        requirement: order.requirement,
        status: order.status,
        created_at: order.created_at,
        completed_at: order.completed_at,
        // Client information (buyer)
        client_username: order.User?.username,
        client_fullname: order.User?.fullname,
        client_name: order.User?.fullname || order.User?.username || 'Unknown Client',
        client_avatar: order.User?.avt_url || 'https://placehold.co/300x300',
        // Gig information with detailed fields
        gig_title: order.Gigs?.title,
        gig_cover_image: order.Gigs?.cover_image,
        gig_description: order.Gigs?.description,
        gig_price: order.Gigs?.price,
        gig_delivery_days: order.Gigs?.delivery_days,
        gig_num_of_edits: order.Gigs?.num_of_edits,
        gig_status: order.Gigs?.status,
        gig_owner_id: order.Gigs?.owner_id,
        gig_category_id: order.Gigs?.category_id,
        gig_created_at: order.Gigs?.created_at,
        gig_updated_at: order.Gigs?.updated_at,
        // Gig owner information (current user)
        gig_owner_username: order.Gigs?.User?.username,
        gig_owner_fullname: order.Gigs?.User?.fullname,
        gig_owner_name: order.Gigs?.User?.fullname || order.Gigs?.User?.username || 'Unknown Seller',
        gig_owner_avatar: order.Gigs?.User?.avt_url || 'https://placehold.co/300x300'
      }));

      console.log('✅ [Order Service] Flattened owner orders:', flattenedOrders?.length || 0);
      console.log('🔍 Sample order:', flattenedOrders[0]);
      
      return flattenedOrders;
    } catch (error) {
      console.error('💥 [Order Service] Error in getOwnerOrders:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error fetching owner orders: ${error.message}`);
    }
  },

  /**
   * Update order status
   * 
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order object
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log('🔄 [Order Service] updateOrderStatus called with ID:', orderId, 'and status:', status);
      
      // Validate status
      const validStatuses = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'revision_requested'];
      if (!validStatuses.includes(status)) {
        console.log('❌ Invalid status provided:', status);
        throw new Error('Invalid status. Must be one of: pending, in_progress, delivered, completed, cancelled, revision_requested');
      }

      // Check if order exists and get current status
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        console.log('❌ Order not found for ID:', orderId);
        throw new Error('Order not found');
      }

      const oldStatus = existingOrder.status;
      console.log('📊 Existing order found:', existingOrder.id, 'Current status:', oldStatus);
      
      const updatedOrder = await Order.updateStatus(orderId, status);
      console.log('✅ [Order Service] Order status updated successfully');
      
      // Send notifications for status change
      try {
        // Determine recipient role based on status change
        let recipientRole = null;
        
        if (status === 'in_progress' && oldStatus === 'pending') {
          recipientRole = 'buyer'; // Notify buyer that order is accepted
        } else if (status === 'delivered') {
          recipientRole = 'buyer'; // Notify buyer that order is delivered
        } else if (status === 'revision_requested') {
          recipientRole = 'seller'; // Notify seller that revision is requested
        }
        
        if (recipientRole) {
          await NotificationService.sendOrderStatusUpdate(
            updatedOrder, 
            oldStatus, 
            status, 
            recipientRole
          );
        }
      } catch (notificationError) {
        console.error('❌ Failed to send notification:', notificationError);
        // Don't fail the entire operation if notification fails
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('💥 [Order Service] Error in updateOrderStatus:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  },

  /**
   * Get count of orders for a specific client
   * 
   * @param {string} clientId - Client UUID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<number>} Count of client orders
   */
  getClientOrdersCount: async (clientId, options = {}) => {
    try {
      console.log('📊 [Order Service] getClientOrdersCount called for client:', clientId);
      console.log('🔧 Options:', options);
      
      const count = await Order.countByClientId(clientId, options);
      console.log('✅ [Order Service] Found', count, 'orders for client');
      
      return count;
    } catch (error) {
      console.error('💥 [Order Service] Error in getClientOrdersCount:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error counting client orders: ${error.message}`);
    }
  },

  /**
   * Get count of orders for gigs owned by a specific user
   * 
   * @param {string} ownerId - Gig owner UUID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<number>} Count of orders for owner's gigs
   */
  getOwnerOrdersCount: async (ownerId, options = {}) => {
    try {
      console.log('📊 [Order Service] getOwnerOrdersCount called for owner:', ownerId);
      console.log('🔧 Options:', options);
      
      const count = await Order.countByGigOwnerId(ownerId, options);
      console.log('✅ [Order Service] Found', count, 'orders for owner');
      
      return count;
    } catch (error) {
      console.error('💥 [Order Service] Error in getOwnerOrdersCount:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error counting owner orders: ${error.message}`);
    }
  },

  /**
   * Process payment for order
   * 
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (buyer)
   * @returns {Promise<Object>} Payment result
   */
  processPayment: async (orderId, userId) => {
    try {
      console.log('💳 [Order Service] processPayment called:', { orderId, userId });
      
      // Get order details
      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Verify user is the buyer
      if (order.client_id !== userId) {
        throw new Error('Only the buyer can process payment');
      }
      
      // Check order status
      if (order.status !== 'delivered') {
        throw new Error('Order must be delivered before payment');
      }
      
      // Get buyer's current balance
      const { data: buyer, error: buyerError } = await supabase
        .from('User')
        .select('balance')
        .eq('uuid', userId)
        .single();
      
      if (buyerError || !buyer) {
        throw new Error('Buyer not found');
      }
      
      // Check if buyer has sufficient balance
      if (buyer.balance < order.price_at_purchase) {
        throw new Error('Insufficient balance to complete payment');
      }
      
      // Get seller details
      const { data: seller, error: sellerError } = await supabase
        .from('User')
        .select('balance')
        .eq('uuid', order.gig_owner_id)
        .single();
      
      if (sellerError || !seller) {
        throw new Error('Seller not found');
      }
      
      // Start transaction using database function
      const { data: transactionResult, error: transactionError } = await supabase.rpc('process_order_payment', {
        p_order_id: parseInt(orderId),
        p_buyer_id: userId,
        p_seller_id: order.gig_owner_id,
        p_amount: order.price_at_purchase
      });
      
      if (transactionError) {
        console.error('Database transaction failed:', transactionError);
        throw new Error(transactionError.message || 'Payment processing failed');
      }
      
      console.log('✅ Payment processed via database function:', transactionResult);
      
      // Get updated order
      const updatedOrder = await OrderService.getOrderById(orderId);
      
      // Send payment notifications
      try {
        await NotificationService.sendPaymentNotification(updatedOrder, order.price_at_purchase);
      } catch (notificationError) {
        console.error('❌ Failed to send payment notification:', notificationError);
        // Don't fail the entire operation if notification fails
      }
      
      console.log('✅ Payment processed successfully:', orderId);
      
      return {
        order: updatedOrder,
        payment_amount: order.price_at_purchase,
        buyer_new_balance: transactionResult.buyer_new_balance,
        seller_new_balance: transactionResult.seller_new_balance,
        transaction_id: 'database_function'
      };
      
    } catch (error) {
      console.error('❌ [Order Service] Error in processPayment:', error);
      throw error;
    }
  },

  /**
   * Get order statistics for dashboard
   * 
   * @param {string} userId - User ID
   * @param {string} role - User role (buyer/seller)
   * @returns {Promise<Object>} Order statistics
   */
  getOrderStatistics: async (userId, role) => {
    try {
      console.log('📊 [Order Service] getOrderStatistics called:', { userId, role });
      
      let query = supabase
        .from('Orders')
        .select('status, price_at_purchase, created_at');
      
      if (role === 'buyer') {
        query = query.eq('client_id', userId);
      } else if (role === 'seller') {
        query = query
          .select('status, price_at_purchase, created_at, Gigs!inner(owner_id)')
          .eq('Gigs.owner_id', userId);
      }
      
      const { data: orders, error } = await query;
      
      if (error) {
        throw new Error(`Failed to get order statistics: ${error.message}`);
      }
      
      // Calculate statistics
      const stats = {
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        in_progress: orders.filter(o => o.status === 'in_progress').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revision_requested: orders.filter(o => o.status === 'revision_requested').length,
        total_revenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + parseFloat(o.price_at_purchase), 0),
        this_month_orders: orders.filter(o => {
          const orderDate = new Date(o.created_at);
          const currentDate = new Date();
          return orderDate.getMonth() === currentDate.getMonth() && 
                 orderDate.getFullYear() === currentDate.getFullYear();
        }).length
      };
      
      console.log('📊 Order statistics calculated:', stats);
      
      return stats;
      
    } catch (error) {
      console.error('❌ [Order Service] Error in getOrderStatistics:', error);
      throw error;
    }
  }
};

module.exports = OrderService;
