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
const User = require('../models/user.model');
const Transaction = require('../models/transactions.model');
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

    console.log('✅ [Order Service] Flattened client orders:', flattenedOrders?.length || 0);
    
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
      
      // Auto payment timer logic removed - using manual payment only
      
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
      
      // Get buyer details (remove balance check as it was verified during order creation)
      const { data: buyer, error: buyerError } = await supabase
        .from('User')
        .select('uuid, balance')
        .eq('uuid', userId)
        .single();
      
      if (buyerError || !buyer) {
        throw new Error('Buyer not found');
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
      
      // Process payment manually (bypass balance check)
      console.log('💳 Processing payment manually:', {
        orderId,
        buyerId: userId,
        sellerId: order.gig_owner_id,
        amount: order.price_at_purchase,
        buyerCurrentBalance: buyer.balance,
        sellerCurrentBalance: seller.balance
      });

      // Calculate new balances
      const newBuyerBalance = buyer.balance - order.price_at_purchase;
      const newSellerBalance = seller.balance + order.price_at_purchase;

      // Update buyer balance
      const { error: buyerUpdateError } = await supabase
        .from('User')
        .update({ balance: newBuyerBalance })
        .eq('uuid', userId);

      if (buyerUpdateError) {
        throw new Error('Failed to update buyer balance: ' + buyerUpdateError.message);
      }

      // Update seller balance
      const { error: sellerUpdateError } = await supabase
        .from('User')
        .update({ balance: newSellerBalance })
        .eq('uuid', order.gig_owner_id);

      if (sellerUpdateError) {
        // Rollback buyer balance if seller update fails
        await supabase
          .from('User')
          .update({ balance: buyer.balance })
          .eq('uuid', userId);
        throw new Error('Failed to update seller balance: ' + sellerUpdateError.message);
      }

      // Update order status to completed
      const { error: orderUpdateError } = await supabase
        .from('Orders')
        .update({ 
          status: 'completed'
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        // Rollback balances if order update fails
        await supabase.from('User').update({ balance: buyer.balance }).eq('uuid', userId);
        await supabase.from('User').update({ balance: seller.balance }).eq('uuid', order.gig_owner_id);
        throw new Error('Failed to update order status: ' + orderUpdateError.message);
      }

      console.log('✅ Payment processed successfully via manual transaction');

      // Create transaction records for both buyer and seller
      try {
        // Create transaction for buyer (money deducted)
        await Transaction.create({
          user_id: userId,
          order_id: parseInt(orderId),
          amount: -order.price_at_purchase, // Negative for deduction
          type: 'order_payment',
          description: `Payment for order #${orderId}`
        });

        // Create transaction for seller (money received)
        await Transaction.create({
          user_id: order.gig_owner_id,
          order_id: parseInt(orderId),
          amount: order.price_at_purchase, // Positive for income
          type: 'order_payment',
          description: `Payment received from order #${orderId}`
        });
      } catch (transactionError) {
        console.error('❌ Failed to create transaction records:', transactionError);
        // Don't fail the entire payment if transaction record creation fails
      }
      
      // Auto payment timer logic removed - using manual payment only
      
      // Get updated order
      const updatedOrder = await OrderService.getOrderById(orderId);
      
      console.log('✅ Payment processed successfully:', orderId);
      
      return {
        order: updatedOrder,
        payment_amount: order.price_at_purchase,
        buyer_new_balance: newBuyerBalance,
        seller_new_balance: newSellerBalance,
        transaction_id: 'manual_payment'
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
  },

  /**
   * Get recent orders for a seller (for earnings page)
   * 
   * @param {string} sellerId - Seller UUID
   * @param {number} [limit=10] - Number of recent orders to fetch
   * @returns {Promise<Array>} Array of recent orders with gig details
   */
  getSellerRecentOrders: async (sellerId, limit = 10) => {
    try {
      console.log('🔍 [Order Service] getSellerRecentOrders called for seller:', sellerId);
      
      // Get recent orders for seller's gigs using Supabase query
      const { data: orders, error } = await supabase
        .from('Orders')
        .select(`
          id,
          price_at_purchase,
          status,
          requirement,
          created_at,
          completed_at,
          Gigs!Orders_gig_id_fkey (
            id,
            title,
            owner_id
          )
        `)
        .eq('Gigs.owner_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error fetching recent orders: ${error.message}`);
      }

      // Transform data for frontend
      const recentOrders = orders.map(order => ({
        id: order.id,
        gig_title: order.Gigs?.title || 'Unknown Gig',
        price_at_purchase: parseFloat(order.price_at_purchase),
        status: order.status,
        requirement: order.requirement,
        created_at: order.created_at,
        completed_at: order.completed_at
      }));

      console.log('✅ [Order Service] Found', recentOrders.length, 'recent orders for seller');
      return recentOrders;
    } catch (error) {
      console.error('💥 [Order Service] Error in getSellerRecentOrders:', error);
      throw new Error(`Error fetching seller recent orders: ${error.message}`);
    }
  },

  /**
   * Get seller earnings statistics (for earnings page)
   * 
   * @param {string} sellerId - Seller UUID  
   * @param {string} [period='allTime'] - Time period filter
   * @returns {Promise<Object>} Earnings statistics object
   */
  getSellerEarningsStats: async (sellerId, period = 'allTime') => {
    try {
      console.log('📊 [Order Service] getSellerEarningsStats called for seller:', sellerId, 'period:', period);
      
      // Calculate date range based on period
      const now = new Date();
      let startDate = null;
      
      switch(period) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // allTime
          startDate = null;
      }

      // Build query for orders
      let ordersQuery = supabase
        .from('Orders')
        .select(`
          id,
          price_at_purchase,
          status,
          created_at,
          completed_at,
          Gigs!Orders_gig_id_fkey (
            id,
            title,
            owner_id
          )
        `)
        .eq('Gigs.owner_id', sellerId);

      if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Calculate statistics
      const completedOrders = orders.filter(order => order.status === 'completed');
      const totalEarnings = completedOrders.reduce((sum, order) => sum + parseFloat(order.price_at_purchase), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0;
      
      const pendingOrders = orders.filter(order => ['pending', 'in_progress'].includes(order.status));
      const pendingEarnings = pendingOrders.reduce((sum, order) => sum + parseFloat(order.price_at_purchase), 0);

      // Get seller balance
      const { data: user, error: userError } = await supabase
        .from('User')
        .select('balance')
        .eq('uuid', sellerId)
        .single();
      
      if (userError) throw userError;

      // Get active gigs count
      const { data: activeGigs, error: gigsError } = await supabase
        .from('Gigs')
        .select('id')
        .eq('owner_id', sellerId)
        .eq('status', 'active');
      
      if (gigsError) throw gigsError;

      // Get withdrawal transactions
      const { data: transactions, error: transError } = await supabase
        .from('Transactions')
        .select('amount')
        .eq('user_id', sellerId)
        .ilike('description', '%withdraw%');
      
      const totalWithdrawn = transactions 
        ? transactions.reduce((sum, trans) => sum + Math.abs(parseFloat(trans.amount)), 0)
        : 0;

      // Calculate monthly breakdown
      const monthlyStats = {};
      completedOrders.forEach(order => {
        const date = new Date(order.completed_at || order.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthName,
            year: year,
            earnings: 0,
            orders: 0
          };
        }
        
        monthlyStats[monthKey].earnings += parseFloat(order.price_at_purchase);
        monthlyStats[monthKey].orders += 1;
      });

      const monthlyBreakdown = Object.values(monthlyStats)
        .sort((a, b) => new Date(a.year, a.month) - new Date(b.year, b.month))
        .slice(-12); // Last 12 months

      const earningsStats = {
        totalEarnings,
        completedOrders: completedOrders.length,
        averageOrderValue,
        pendingEarnings,
        availableBalance: parseFloat(user.balance || 0),
        totalWithdrawn,
        activeGigs: activeGigs.length,
        completionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
        monthlyBreakdown
      };

      console.log('✅ [Order Service] Earnings stats calculated:', earningsStats);
      return earningsStats;
    } catch (error) {
      console.error('💥 [Order Service] Error in getSellerEarningsStats:', error);
      throw new Error(`Error fetching seller earnings stats: ${error.message}`);
    }
  },

  /**
   * Complete order and process payment manually
   * 
   * @param {number} orderId - Order ID
   * @param {string} userUuid - User UUID performing the action
   * @param {string} userRole - User role (should be 'buyer')
   * @returns {Promise<Object>} Result object
   */
  completeOrder: async (orderId, userUuid, userRole) => {
    try {
      console.log('🎯 [Order Service] Starting completeOrder:', { orderId, userUuid, userRole });

      // Lấy thông tin order với full details
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      console.log('📦 [Order Service] Order found:', { 
        id: order.id, 
        status: order.status, 
        client_id: order.client_id,
        price: order.price_at_purchase 
      });

      // Kiểm tra quyền: chỉ buyer mới có thể complete order
      if (userRole !== 'buyer' || order.client_id !== userUuid) {
        throw new Error('Only the buyer can complete this order');
      }

      // Kiểm tra trạng thái order
      if (order.status !== 'delivered') {
        throw new Error('Order must be delivered before completion');
      }

      // Lấy seller ID từ gig
      const sellerId = order.Gigs?.owner_id;
      if (!sellerId) {
        throw new Error('Seller information not found');
      }

      console.log('👥 [Order Service] Processing payment between:', { 
        buyer: userUuid, 
        seller: sellerId, 
        amount: order.price_at_purchase 
      });

      // Xử lý thanh toán
      const paymentResult = await OrderService.processOrderPayment(order, userUuid, sellerId);

      // Cập nhật trạng thái order thành completed
      const updatedOrder = await Order.updateById(orderId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      console.log('✅ [Order Service] Order completed successfully');

      return {
        success: true,
        message: 'Order completed and payment processed successfully',
        order: updatedOrder,
        payment: paymentResult
      };

    } catch (error) {
      console.error('💥 [Order Service] Error completing order:', error);
      throw error;
    }
  },

  /**
   * Process order payment: transfer money from buyer to seller
   * 
   * @param {Object} order - Order object
   * @param {string} buyerId - Buyer UUID
   * @param {string} sellerId - Seller UUID
   * @returns {Promise<void>}
   */
  processOrderPayment: async (order, buyerId, sellerId) => {
    try {
      const amount = parseFloat(order.price_at_purchase);
      
      console.log('💰 [Order Service] Processing payment:', { 
        orderId: order.id, 
        amount, 
        buyerId, 
        sellerId 
      });

      // Lấy thông tin buyer và seller từ database
      const [buyer, seller] = await Promise.all([
        User.findById(buyerId),
        User.findById(sellerId)
      ]);

      if (!buyer || !seller) {
        throw new Error('Buyer or seller not found');
      }

      console.log('👤 [Order Service] Current balances:', {
        buyer: { username: buyer.username, balance: buyer.balance },
        seller: { username: seller.username, balance: seller.balance }
      });

      // Tính toán balance mới (không kiểm tra insufficient balance)
      const buyerBalance = parseFloat(buyer.balance) || 0;
      const sellerBalance = parseFloat(seller.balance) || 0;
      const newBuyerBalance = buyerBalance - amount;
      const newSellerBalance = sellerBalance + amount;

      console.log('🔄 [Order Service] New balances will be:', {
        buyer: { old: buyerBalance, new: newBuyerBalance },
        seller: { old: sellerBalance, new: newSellerBalance }
      });

      // Cập nhật balance cho buyer và seller trong database
      try {
        console.log('💳 [Order Service] Updating buyer balance using Supabase...');
        
        // Cập nhật buyer balance
        const { data: buyerUpdateData, error: buyerUpdateError } = await supabase
          .from('User')
          .update({ 
            balance: newBuyerBalance,
            updated_at: new Date().toISOString()
          })
          .eq('uuid', buyerId)
          .select();

        if (buyerUpdateError) {
          console.error('❌ [Order Service] Failed to update buyer balance:', buyerUpdateError);
          throw new Error(`Failed to update buyer balance: ${buyerUpdateError.message}`);
        }

        console.log('✅ [Order Service] Buyer balance updated:', buyerUpdateData[0]?.balance);

        console.log('💳 [Order Service] Updating seller balance using Supabase...');
        
        // Cập nhật seller balance
        const { data: sellerUpdateData, error: sellerUpdateError } = await supabase
          .from('User')
          .update({ 
            balance: newSellerBalance,
            updated_at: new Date().toISOString()
          })
          .eq('uuid', sellerId)
          .select();

        if (sellerUpdateError) {
          console.error('❌ [Order Service] Failed to update seller balance:', sellerUpdateError);
          
          // Rollback buyer balance
          console.log('🔄 [Order Service] Rolling back buyer balance...');
          await supabase
            .from('User')
            .update({ balance: buyerBalance })
            .eq('uuid', buyerId);
          
          throw new Error(`Failed to update seller balance: ${sellerUpdateError.message}`);
        }

        console.log('✅ [Order Service] Seller balance updated:', sellerUpdateData[0]?.balance);
        console.log('💳 [Order Service] All balances updated successfully in database');
        
      } catch (balanceError) {
        console.error('❌ [Order Service] Failed to update balances:', balanceError);
        throw new Error(`Failed to update user balances: ${balanceError.message}`);
      }

      // Lưu transaction cho buyer (trừ tiền)
      await Transaction.create({
        user_id: buyerId,
        order_id: order.id,
        amount: -amount, // Số âm vì trừ tiền
        description: `Payment for order #${order.id} - ${order.Gigs?.title || 'Unknown Gig'}`,
        type: 'order_payment'
      });

      // Lưu transaction cho seller (cộng tiền)
      await Transaction.create({
        user_id: sellerId,
        order_id: order.id,
        amount: amount, // Số dương vì nhận tiền
        description: `Payment received from order #${order.id} - ${order.Gigs?.title || 'Unknown Gig'}`,
        type: 'order_payment'
      });

      console.log('📊 [Order Service] Transactions recorded successfully');

      // Verify balances sau khi cập nhật
      const [verifyBuyer, verifySeller] = await Promise.all([
        User.findById(buyerId),
        User.findById(sellerId)
      ]);

      console.log('🔍 [Order Service] Final balances verification:', {
        buyer: { username: verifyBuyer.username, balance: verifyBuyer.balance },
        seller: { username: verifySeller.username, balance: verifySeller.balance }
      });

      console.log(`✅ [Order Service] Payment processed: $${amount} from ${buyer.username} to ${seller.username}`);
      
      // Return updated user data for frontend
      const updatedBuyerData = {
        uuid: verifyBuyer.uuid,
        username: verifyBuyer.username,
        fullname: verifyBuyer.fullname,
        email: verifyBuyer.email,
        role: verifyBuyer.role,
        balance: verifyBuyer.balance,
        avatar_url: verifyBuyer.avt_url,
        bio: verifyBuyer.bio,
        seller_headline: verifyBuyer.seller_headline,
        seller_description: verifyBuyer.seller_description,
        seller_since: verifyBuyer.seller_since
      };

      const updatedSellerData = {
        uuid: verifySeller.uuid,
        username: verifySeller.username,
        fullname: verifySeller.fullname,
        email: verifySeller.email,
        role: verifySeller.role,
        balance: verifySeller.balance,
        avatar_url: verifySeller.avt_url,
        bio: verifySeller.bio,
        seller_headline: verifySeller.seller_headline,
        seller_description: verifySeller.seller_description,
        seller_since: verifySeller.seller_since
      };
      
      return {
        success: true,
        buyerNewBalance: verifyBuyer.balance,
        sellerNewBalance: verifySeller.balance,
        amount: amount,
        updatedBuyerData: updatedBuyerData,
        updatedSellerData: updatedSellerData
      };

    } catch (error) {
      console.error('💥 [Order Service] Error processing order payment:', error);
      throw error;
    }
  }
};

module.exports = OrderService;
