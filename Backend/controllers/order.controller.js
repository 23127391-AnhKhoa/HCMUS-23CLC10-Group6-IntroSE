/**
 * Order Controller - HTTP request handlers for order operations
 * 
 * @file order.controller.js
 * @description Controller layer for handling order-related HTTP requests
 * Processes requests, validates input, and coordinates with OrderService
 * 
 * @requires ../services/order.service - Order service for business logic
 */

const OrderService = require('../services/order.service');

/**
 * Get all orders with pagination and filtering
 * 
 * @route GET /api/orders
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {string} [req.query.status] - Filter by status
 * @param {string} [req.query.client_id] - Filter by client ID
 * @param {string} [req.query.gig_id] - Filter by gig ID
 * @param {string} [req.query.sort_by=created_at] - Sort field
 * @param {string} [req.query.sort_order=desc] - Sort order
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with orders and pagination info
 */
const getAllOrders = async (req, res) => {
  try {
    console.log('🔍 [Order Controller] getAllOrders called');
    console.log('📄 Query parameters:', req.query);
    
    const {
      page = 1,
      limit = 10,
      status,
      client_id,
      gig_id,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      client_id,
      gig_id,
      sort_by,
      sort_order
    };

    console.log('🔧 Processed filters:', filters);

    const result = await OrderService.getAllOrders(filters);
    console.log('📊 Service result:', { 
      ordersCount: result.orders?.length || 0, 
      total: result.total 
    });

    res.status(200).json({
      status: 'success',
      data: result.orders,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
    
    console.log('✅ [Order Controller] getAllOrders completed successfully');
  } catch (error) {
    console.error('❌ [Order Controller] Error in getAllOrders:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

/**
 * Get order by ID
 * 
 * @route GET /api/orders/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with order data
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [Order Controller] getOrderById called with ID:', id);
    
    const order = await OrderService.getOrderById(id);
    console.log('📊 Service result:', order ? 'Order found' : 'Order not found');
    
    if (!order) {
      console.log('❌ Order not found for ID:', id);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    console.log('✅ [Order Controller] getOrderById completed successfully');
    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('❌ [Order Controller] Error in getOrderById:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Create a new order
 * 
 * @route POST /api/orders
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.client_id - Client UUID
 * @param {string} req.body.gig_id - Gig UUID
 * @param {number} req.body.price_at_purchase - Price at purchase
 * @param {string} req.body.requirement - Order requirements
 * @param {string} [req.body.status=pending] - Order status
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created order
 */
const createOrder = async (req, res) => {
  try {
    console.log('🔍 [Order Controller] createOrder called');
    console.log('📄 Request body:', req.body);
    console.log('👤 Authenticated user:', req.user);
    
    const { client_id, gig_id, price_at_purchase, requirement, status } = req.body;

    // Validate required fields
    if (!client_id || !gig_id || !price_at_purchase || !requirement) {
      console.log('❌ Missing required fields:', { 
        client_id: !!client_id, 
        gig_id: !!gig_id, 
        price_at_purchase: !!price_at_purchase, 
        requirement: !!requirement 
      });
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: client_id, gig_id, price_at_purchase, and requirement are required',
        details: {
          client_id: !!client_id,
          gig_id: !!gig_id,
          price_at_purchase: !!price_at_purchase,
          requirement: !!requirement
        }
      });
    }

    // Validate price_at_purchase is a number
    if (typeof price_at_purchase !== 'number' || price_at_purchase <= 0) {
      console.log('❌ Invalid price_at_purchase:', price_at_purchase, 'Type:', typeof price_at_purchase);
      return res.status(400).json({
        status: 'error',
        message: 'price_at_purchase must be a positive number',
        details: {
          received: price_at_purchase,
          type: typeof price_at_purchase,
          expected: 'positive number'
        }
      });
    }

    // Validate client_id matches authenticated user
    if (client_id !== req.user.uuid) {
      console.log('❌ Client ID mismatch:', { client_id, user_uuid: req.user.uuid });
      return res.status(403).json({
        status: 'error',
        message: 'Client ID must match authenticated user'
      });
    }

    const orderData = {
      client_id,
      gig_id,
      price_at_purchase,
      requirement,
      status
    };

    console.log('🔧 Processed order data:', orderData);

    const order = await OrderService.createOrder(orderData);
    console.log('📊 Order created successfully:', order.id);

    console.log('✅ [Order Controller] createOrder completed successfully');
    res.status(201).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('❌ [Order Controller] Error in createOrder:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Update order by ID
 * 
 * @route PUT /api/orders/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body - Request body with update data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated order
 */
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    const { id: _, client_id, gig_id, created_at, ...allowedUpdates } = updateData;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    const order = await OrderService.updateOrder(id, allowedUpdates);

    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('❌ Error in updateOrder:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Delete order by ID
 * 
 * @route DELETE /api/orders/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deleted order
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderService.deleteOrder(id);

    res.status(200).json({
      status: 'success',
      data: order,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteOrder:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get orders for a specific client
 * 
 * @route GET /api/orders/client/:clientId
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.clientId - Client UUID
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit] - Limit results
 * @param {number} [req.query.offset] - Offset for pagination
 * @param {string} [req.query.status] - Filter by status
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with client orders
 */
const getClientOrders = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sort_by = 'created_at', 
      sort_order = 'desc' 
    } = req.query;
    
    console.log('🔍 [Order Controller] getClientOrders called');
    console.log('👤 Client ID:', clientId);
    console.log('📄 Query parameters:', { page, limit, status, sort_by, sort_order });

    // Convert page-based pagination to offset-based
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const options = {
      limit: parsedLimit,
      offset: offset
    };
    
    if (status && status !== 'all') {
      options.status = status;
    }

    console.log('🔧 Processed options:', options);

    const orders = await OrderService.getClientOrders(clientId, options);
    
    // Get total count for pagination
    const totalOptions = { status: options.status };
    const totalCount = await OrderService.getClientOrdersCount(clientId, totalOptions);

    console.log('📊 Service result:', { 
      ordersCount: orders?.length || 0,
      totalCount 
    });

    console.log('✅ [Order Controller] getClientOrders completed successfully');
    res.status(200).json({
      status: 'success',
      data: orders,
      pagination: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(totalCount / parsedLimit)
      }
    });
  } catch (error) {
    console.error('❌ [Order Controller] Error in getClientOrders:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get orders for gigs owned by a specific user
 * 
 * @route GET /api/orders/owner/:ownerId
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.ownerId - Gig owner UUID
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit] - Limit results
 * @param {number} [req.query.offset] - Offset for pagination
 * @param {string} [req.query.status] - Filter by status
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with owner orders
 */
const   getOwnerOrders = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sort_by = 'created_at', 
      sort_order = 'desc' 
    } = req.query;
    
    console.log('🔍 [Order Controller] getOwnerOrders called');
    console.log('👤 Owner ID:', ownerId);
    console.log('📄 Query parameters:', { page, limit, status, sort_by, sort_order });

    // Convert page-based pagination to offset-based
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const options = {
      limit: parsedLimit,
      offset: offset
    };
    
    if (status && status !== 'all') {
      options.status = status;
    }

    console.log('🔧 Processed options:', options);

    const orders = await OrderService.getOwnerOrders(ownerId, options);
    
    // Get total count for pagination
    const totalOptions = { status: options.status };
    const totalCount = await OrderService.getOwnerOrdersCount(ownerId, totalOptions);

    console.log('📊 Service result:', { 
      ordersCount: orders?.length || 0,
      totalCount 
    });

    console.log('✅ [Order Controller] getOwnerOrders completed successfully');
    res.status(200).json({
      status: 'success',
      data: orders,
      pagination: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(totalCount / parsedLimit)
      }
    });
  } catch (error) {
    console.error('❌ [Order Controller] Error in getOwnerOrders:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Update order status
 * 
 * @route PATCH /api/orders/:id/status
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.status - New status
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated order
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔍 [Order Controller] updateOrderStatus called');
    console.log('📄 Order ID:', id);
    console.log('📄 New status:', status);

    if (!status) {
      console.log('❌ Status is required but not provided');
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }

    const order = await OrderService.updateOrderStatus(id, status);
    console.log('📊 Order status updated successfully:', order.id);

    console.log('✅ [Order Controller] updateOrderStatus completed successfully');
    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('❌ [Order Controller] Error in updateOrderStatus:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getClientOrders,
  getOwnerOrders,
  updateOrderStatus
};