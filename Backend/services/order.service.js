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
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(updateData.status)) {
          throw new Error('Invalid status. Must be one of: pending, in_progress, completed, cancelled');
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
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        console.log('❌ Invalid status provided:', status);
        throw new Error('Invalid status. Must be one of: pending, in_progress, completed, cancelled');
      }

      // Check if order exists
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        console.log('❌ Order not found for ID:', orderId);
        throw new Error('Order not found');
      }

      console.log('📊 Existing order found:', existingOrder.id);
      
      const updatedOrder = await Order.updateStatus(orderId, status);
      console.log('✅ [Order Service] Order status updated successfully');
      
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
   * Get order statistics for dashboard
   * 
   * @param {Object} filters - Filters for statistics
   * @param {string} [filters.status] - Filter by order status
   * @param {string} [filters.client_id] - Filter by client ID
   * @param {string} [filters.gig_id] - Filter by gig ID
   * @returns {Promise<Object>} Object containing statistics data
   */
  getOrderStatistics: async (filters = {}) => {
    try {
      console.log('📊 [Order Service] getOrderStatistics called with filters:', filters);
      
      // Prepare base query
      let query = supabase
        .from('Orders')
        .select('status, count(id) as count', { count: 'exact' })
        .group('status')
        .order('status', { ascending: true });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters.gig_id) {
        query = query.eq('gig_id', filters.gig_id);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching statistics: ${error.message}`);
      }

      console.log('✅ [Order Service] Statistics data:', data);
      
      return data;
    } catch (error) {
      console.error('💥 [Order Service] Error in getOrderStatistics:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error fetching order statistics: ${error.message}`);
    }
  }
};

module.exports = OrderService;
