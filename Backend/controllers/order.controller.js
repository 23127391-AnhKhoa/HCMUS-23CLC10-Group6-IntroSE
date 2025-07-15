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
const DeliveryFile = require('../models/deliveryFile.model');
const FileValidation = require('../utils/fileValidation');
const NotificationService = require('../services/notification.service');
const supabase = require('../config/supabaseClient');
const path = require('path');

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
const getOwnerOrders = async (req, res) => {
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

/**
 * Upload delivery files for order
 * 
 * @route POST /api/orders/:id/delivery
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Order ID
 * @param {Object} req.files - Uploaded files
 * @param {string} req.body.message - Delivery message
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upload result
 */
const uploadDelivery = async (req, res) => {
  try {
    const orderId = req.params.id;
    const files = req.files;
    const message = req.body.message || '';
    const userId = req.user.uuid;

    console.log('📤 Upload delivery request:', {
      orderId,
      filesCount: files ? files.length : 0,
      message,
      userId
    });

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files provided for delivery'
      });
    }

    // Validate files
    const validationResult = FileValidation.validateFiles(files, {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxTotalSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    });

    if (!validationResult.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'File validation failed',
        errors: validationResult.errors
      });
    }

    // Verify that the user is the seller of this order
    const order = await OrderService.getOrderById(orderId);
    console.log('📋 Full order object:', JSON.stringify(order, null, 2));
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    console.log('📋 Order details:', {
      id: order.id,
      status: order.status,
      gig_owner_id: order.gig_owner_id,
      requesting_user: userId,
      user_object: req.user
    });

    // Check if user is the gig owner (seller) - improved debugging
    console.log('🔍 Authorization check:', {
      order_gig_owner_id: order.gig_owner_id,
      user_id: userId,
      types: {
        order_gig_owner_id: typeof order.gig_owner_id,
        user_id: typeof userId
      },
      strict_match: order.gig_owner_id === userId,
      loose_match: order.gig_owner_id == userId
    });

    if (order.gig_owner_id !== userId) {
      console.log('❌ Authorization failed - user is not the gig owner');
      
      // Additional debugging - check if user is actually the client
      if (order.client_id === userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You are the buyer of this order. Only the seller can upload delivery files.',
          details: {
            current_user_role: 'buyer',
            required_role: 'seller',
            seller_username: order.gig_owner_username || 'Unknown',
            action_required: 'Please log in as the seller to upload delivery files'
          }
        });
      }
      
      return res.status(403).json({
        status: 'error',
        message: 'Only the seller can upload delivery files',
        debug: {
          expected_gig_owner_id: order.gig_owner_id,
          actual_user_id: userId,
          user_role: req.user.role || 'unknown',
          is_buyer: order.client_id === userId,
          is_seller: order.gig_owner_id === userId
        }
      });
    }

    // Check if order is in correct status for delivery
    if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
      console.log('❌ Invalid order status for upload:', order.status);
      return res.status(400).json({
        status: 'error',
        message: 'Order must be in progress or revision requested to upload delivery'
      });
    }
    
    // DEBUG: Check for other delivered orders by this seller
    console.log('🔍 Checking for other delivered orders by this seller...');
    const { data: otherDeliveredOrders, error: otherOrdersError } = await supabase
      .from('Orders')
      .select(`
        *,
        Gigs!Orders_gig_id_fkey (
          owner_id
        )
      `)
      .eq('Gigs.owner_id', order.gig_owner_id)
      .eq('status', 'delivered')
      .neq('id', orderId);
    
    if (otherOrdersError) {
      console.error('❌ Error checking other delivered orders:', otherOrdersError);
    } else {
      console.log('📦 Other delivered orders found:', otherDeliveredOrders.length);
      console.log('✅ Multiple delivered orders are ALLOWED for seller');
    }

    // Process file uploads and save to Supabase Storage
    const deliveryFiles = [];
    
    for (const file of files) {
      try {
        // Generate unique filename with timestamp and order ID
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const filename = `${orderId}_${timestamp}_${file.originalname}`;
        const filePath = `deliveries/${orderId}/${filename}`;
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('order-deliveries')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Supabase upload error:', error);
          return res.status(500).json({
            status: 'error',
            message: `Failed to upload file: ${file.originalname}`,
            error: error.message
          });
        }
        
        // Generate signed URL for secure access (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('order-deliveries')
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        
        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError);
        }
        
        // Save file record to database
        const fileRecord = await DeliveryFile.create({
          order_id: orderId,
          original_name: file.originalname,
          file_name: filename,
          file_size: file.size,
          file_type: file.mimetype,
          storage_path: data.path,
          uploaded_by: userId,
          upload_status: 'uploaded',
          message: message // Add message to file record
        });
        
        deliveryFiles.push({
          id: fileRecord.id,
          name: file.originalname,
          filename: filename,
          size: file.size,
          type: file.mimetype,
          storage_path: data.path,
          signed_url: signedUrlData?.signedUrl,
          uploaded_at: fileRecord.created_at
        });
        
        console.log(`✅ File uploaded to Supabase: ${filename}`);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({
          status: 'error',
          message: `Failed to upload file: ${file.originalname}`,
          error: error.message
        });
      }
    }

    // Log the delivery
    console.log(`📦 Delivery uploaded for order ${orderId}:`, {
      files: deliveryFiles.length,
      message: message,
      seller: userId
    });

    res.status(200).json({
      status: 'success',
      message: 'Delivery files uploaded successfully',
      data: {
        orderId: orderId,
        filesUploaded: deliveryFiles.length,
        deliveryMessage: message,
        files: deliveryFiles
      }
    });

  } catch (error) {
    console.error('Error uploading delivery:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get signed URL for delivery file access
 * 
 * @route GET /api/orders/:orderId/delivery/:filename
 * @param {Object} req - Express request object
 * @param {string} req.params.orderId - Order ID
 * @param {string} req.params.filename - File name
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with signed URL
 */
const getDeliveryFileUrl = async (req, res) => {
  try {
    const { orderId, filename } = req.params;
    const userId = req.user.uuid;
    
    console.log('📥 Getting delivery file URL:', { orderId, filename, userId });
    
    // Get order to verify user has access
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    // Check if user is either the buyer or seller of this order
    const isAuthorized = order.client_id === userId || order.gig_owner_id === userId;
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this file'
      });
    }
    
    // 🔒 SECURITY: Only allow file download if order is completed (paid) or user is the seller
    if (order.status !== 'completed' && order.gig_owner_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Files can only be downloaded after payment completion',
        order_status: order.status,
        requires_payment: true
      });
    }
    
    // Generate signed URL for the file
    const filePath = `deliveries/${orderId}/${filename}`;
    const { data, error } = await supabase.storage
      .from('order-deliveries')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate file access URL',
        error: error.message
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        signedUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }
    });
    
  } catch (error) {
    console.error('Error getting delivery file URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get delivery files for an order
 * 
 * @route GET /api/orders/:orderId/delivery-files
 * @param {Object} req - Express request object
 * @param {string} req.params.orderId - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with delivery files
 */
const getDeliveryFiles = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.uuid;
    
    console.log('📥 Getting delivery files:', { orderId, userId });
    
    // Get order to verify user has access
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    // Check if user is either the buyer or seller of this order
    const isAuthorized = order.client_id === userId || order.gig_owner_id === userId;
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access these files'
      });
    }
    
    // Get delivery files from database
    const deliveryFiles = await DeliveryFile.findByOrderId(orderId);
    
    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
      deliveryFiles.map(async (file) => {
        try {
          // 🔒 SECURITY: Only generate signed URLs if order is completed or user is seller
          const canDownload = order.status === 'completed' || order.gig_owner_id === userId;
          
          if (!canDownload) {
            return {
              ...file,
              signed_url: null,
              can_download: false,
              download_message: 'Payment required to download files'
            };
          }
          
          const { data, error } = await supabase.storage
            .from('order-deliveries')
            .createSignedUrl(file.storage_path, 3600);
          
          return {
            ...file,
            signed_url: data?.signedUrl,
            can_download: true
          };
        } catch (error) {
          console.error('Error generating signed URL for file:', file.id, error);
          return {
            ...file,
            signed_url: null,
            can_download: false,
            download_message: 'Error generating download link'
          };
        }
      })
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        files: filesWithUrls,
        order_status: order.status,
        can_download: order.status === 'completed' || order.gig_owner_id === userId
      }
    });
    
  } catch (error) {
    console.error('Error getting delivery files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark order as delivered (seller action)
 * 
 * @route POST /api/orders/:id/mark-delivered
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated order
 */
const markAsDelivered = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.uuid;
    
    console.log('🚚 Mark as delivered request:', { orderId, userId });
    
    // Get order with gig owner details
    const { data: order, error } = await supabase
      .from('Orders')
      .select(`
        *,
        Gigs!Orders_gig_id_fkey (
          owner_id
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error || !order) {
      console.log('❌ Order not found:', orderId, error);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    const gigOwnerId = order.Gigs?.owner_id;
    
    console.log('📋 Order details:', {
      id: order.id,
      status: order.status,
      gig_owner_id: gigOwnerId,
      client_id: order.client_id
    });
    
    // Check if user is the seller (gig owner)
    if (gigOwnerId !== userId) {
      console.log('❌ Unauthorized access - user is not seller:', { userId, gig_owner_id: gigOwnerId });
      return res.status(403).json({
        status: 'error',
        message: 'Only the seller can mark order as delivered'
      });
    }
    
    // Check for other delivered orders by this seller (DEBUG)
    console.log('🔍 Checking for other delivered orders by this seller...');
    const { data: otherDeliveredOrders, error: otherOrdersError } = await supabase
      .from('Orders')
      .select(`
        *,
        Gigs!Orders_gig_id_fkey (
          owner_id
        )
      `)
      .eq('Gigs.owner_id', gigOwnerId)
      .eq('status', 'delivered')
      .neq('id', orderId);
    
    if (otherOrdersError) {
      console.error('❌ Error checking other delivered orders:', otherOrdersError);
    } else {
      console.log('📦 Other delivered orders found:', otherDeliveredOrders.length);
      otherDeliveredOrders.forEach(o => {
        console.log(`  - Order #${o.id}: ${o.status}`);
      });
    }
    
    // Check if order has delivery files
    const deliveryFiles = await DeliveryFile.findByOrderId(orderId);
    console.log('📁 Delivery files found:', deliveryFiles.length);
    
    if (!deliveryFiles || deliveryFiles.length === 0) {
      console.log('❌ No delivery files found');
      return res.status(400).json({
        status: 'error',
        message: 'Please upload delivery files before marking as delivered'
      });
    }
    
    // Check order status
    if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
      console.log('❌ Invalid order status:', order.status);
      return res.status(400).json({
        status: 'error',
        message: 'Order must be in progress or revision requested to mark as delivered'
      });
    }
    
    // Update order status to delivered
    console.log('🔄 Updating order status to delivered...');
    console.log('📊 About to call OrderService.updateOrderStatus with:', { orderId, status: 'delivered' });
    
    const updatedOrder = await OrderService.updateOrderStatus(orderId, 'delivered');
    console.log('✅ Order marked as delivered successfully:', { orderId, newStatus: updatedOrder.status });
    
    console.log('✅ Order marked as delivered:', orderId);
    
    res.status(200).json({
      status: 'success',
      message: 'Order marked as delivered successfully',
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('💥 Error marking order as delivered:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Process payment for order (buyer action)
 * 
 * @route POST /api/orders/:id/pay
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment result
 */
const processPayment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.uuid;
    
    console.log('💳 Process payment request:', { orderId, userId });
    console.log('💳 User object:', req.user);
    
    // Get order to verify user has access
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    console.log('💳 Order details:', {
      orderId: order.id,
      clientId: order.client_id,
      userId: userId,
      status: order.status
    });
    
    // Check if user is the buyer (client) - improved check
    if (order.client_id !== userId) {
      console.log('❌ Payment authorization failed:', {
        expected: order.client_id,
        actual: userId,
        match: order.client_id === userId
      });
      return res.status(403).json({
        status: 'error',
        message: 'Only the buyer can process payment',
        debug: {
          order_client_id: order.client_id,
          user_id: userId
        }
      });
    }
    
    // Check order status
    if (order.status !== 'delivered') {
      return res.status(400).json({
        status: 'error',
        message: 'Order must be delivered before payment can be processed'
      });
    }
    
    // Process payment using order service
    const paymentResult = await OrderService.processPayment(orderId, userId);
    
    console.log('✅ Payment processed successfully:', orderId);
    
    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: paymentResult
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Request revision for order (buyer action)
 * 
 * @route POST /api/orders/:id/request-revision
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.revision_note - Revision note
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated order
 */
const requestRevision = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.uuid;
    const { revision_note } = req.body;
    
    console.log('🔄 Request revision:', { orderId, userId, revision_note });
    
    // Get order to verify user has access
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    // Check if user is the buyer (client)
    if (order.client_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the buyer can request revision'
      });
    }
    
    // Check order status
    if (order.status !== 'delivered') {
      return res.status(400).json({
        status: 'error',
        message: 'Order must be delivered to request revision'
      });
    }
    
    // Update order status to revision_requested
    const updatedOrder = await OrderService.updateOrderStatus(orderId, 'revision_requested');
    
    // TODO: Save revision note in database if needed
    // TODO: Send notification to seller
    
    console.log('✅ Revision requested:', orderId);
    
    res.status(200).json({
      status: 'success',
      message: 'Revision requested successfully',
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('Error requesting revision:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order workflow status and available actions
 * 
 * @route GET /api/orders/:id/workflow
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with workflow status
 */
const getOrderWorkflow = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.uuid;
    
    console.log('📊 Get order workflow:', { orderId, userId });
    
    // Get order to verify user has access
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = order.client_id === userId || order.gig_owner_id === userId;
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this order workflow'
      });
    }
    
    // Get delivery files
    const deliveryFiles = await DeliveryFile.findByOrderId(orderId);
    
    // Determine user role
    const userRole = order.client_id === userId ? 'buyer' : 'seller';
    
    // Determine available actions based on status and role
    const availableActions = getAvailableActions(order, userRole, deliveryFiles);
    
    res.status(200).json({
      status: 'success',
      data: {
        order_id: orderId,
        current_status: order.status,
        user_role: userRole,
        available_actions: availableActions,
        delivery_files_count: deliveryFiles.length,
        can_download: order.status === 'completed' || userRole === 'seller'
      }
    });
    
  } catch (error) {
    console.error('Error getting order workflow:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to determine available actions
 * @param {Object} order - Order object
 * @param {string} userRole - User role (buyer/seller)
 * @param {Array} deliveryFiles - Delivery files array
 * @returns {Array} Available actions
 */
function getAvailableActions(order, userRole, deliveryFiles) {
  const actions = [];
  
  if (userRole === 'seller') {
    switch (order.status) {
      case 'pending':
        actions.push('accept', 'decline');
        break;
      case 'in_progress':
        actions.push('upload_delivery', 'mark_delivered');
        break;
      case 'revision_requested':
        actions.push('upload_delivery', 'mark_delivered');
        break;
      case 'delivered':
        actions.push('upload_additional_files');
        break;
      case 'completed':
        actions.push('view_files');
        break;
    }
  } else if (userRole === 'buyer') {
    switch (order.status) {
      case 'pending':
        actions.push('cancel');
        break;
      case 'in_progress':
        actions.push('message');
        break;
      case 'delivered':
        actions.push('pay', 'request_revision', 'preview_files');
        break;
      case 'completed':
        actions.push('download_files', 'leave_review');
        break;
    }
  }
  
  return actions;
}

/**
 * Delete delivery file
 * 
 * @route DELETE /api/orders/:orderId/delivery-files/:fileId
 * @param {Object} req - Express request object
 * @param {string} req.params.orderId - Order ID
 * @param {string} req.params.fileId - File ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
const deleteDeliveryFile = async (req, res) => {
  try {
    const { orderId, fileId } = req.params;
    const userId = req.user.uuid;
    
    console.log('🗑️ Delete delivery file request:', { orderId, fileId, userId });
    
    // Get order with gig owner details
    const { data: order, error } = await supabase
      .from('Orders')
      .select(`
        *,
        Gigs!Orders_gig_id_fkey (
          owner_id
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error || !order) {
      console.log('❌ Order not found:', orderId, error);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    const gigOwnerId = order.Gigs?.owner_id;
    
    // Check if user is the seller (gig owner) or client
    const isAuthorized = order.client_id === userId || gigOwnerId === userId;
    if (!isAuthorized) {
      console.log('❌ Unauthorized access:', { userId, gig_owner_id: gigOwnerId, client_id: order.client_id });
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this file'
      });
    }
    
    // Get file details before deletion
    const { data: fileData, error: fileError } = await supabase
      .from('DeliveryFiles')
      .select('*')
      .eq('id', fileId)
      .eq('order_id', orderId)
      .single();
    
    if (fileError || !fileData) {
      console.log('❌ File not found:', fileId, fileError);
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }
    
    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('order-deliveries')
      .remove([fileData.storage_path]);
    
    if (storageError) {
      console.error('❌ Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete file record from database
    await DeliveryFile.delete(fileId);
    
    console.log('✅ File deleted successfully:', fileId);
    
    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting delivery file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  updateOrderStatus,
  uploadDelivery,
  getDeliveryFileUrl,
  getDeliveryFiles,
  markAsDelivered,
  deleteDeliveryFile,
  processPayment,
  requestRevision,
  getOrderWorkflow
};