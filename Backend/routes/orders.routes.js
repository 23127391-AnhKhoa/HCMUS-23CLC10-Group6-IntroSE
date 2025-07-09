/**
 * Order Routes - Express routes for order operations
 * 
 * @file orders.routes.js
 * @description Defines HTTP routes for order-related operations
 * Maps HTTP endpoints to controller functions
 * 
 * @requires express - Express.js framework
 * @requires ../controllers/order.controller - Order controller functions
 * @requires ../middleware/auth.middleware - Authentication middleware
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route GET /api/orders
 * @description Get all orders with pagination and filtering
 * @access Protected - Requires authentication
 * @queryParams {number} page - Page number (default: 1)
 * @queryParams {number} limit - Items per page (default: 10)
 * @queryParams {string} status - Filter by status
 * @queryParams {string} client_id - Filter by client ID
 * @queryParams {string} gig_id - Filter by gig ID
 * @queryParams {string} sort_by - Sort field (default: created_at)
 * @queryParams {string} sort_order - Sort order (default: desc)
 * @returns {Object} JSON response with orders and pagination info
 */
router.get('/', authenticateToken, OrderController.getAllOrders);

/**
 * @route GET /api/orders/:id
 * @description Get order by ID
 * @access Protected - Requires authentication
 * @params {string} id - Order ID
 * @returns {Object} JSON response with order data
 */
router.get('/:id', authenticateToken, OrderController.getOrderById);

/**
 * @route POST /api/orders
 * @description Create a new order
 * @access Protected - Requires authentication
 * @body {string} client_id - Client UUID
 * @body {string} gig_id - Gig UUID
 * @body {number} price_at_purchase - Price at purchase
 * @body {string} requirement - Order requirements
 * @body {string} [status=pending] - Order status
 * @returns {Object} JSON response with created order
 */
router.post('/', authenticateToken, OrderController.createOrder);

/**
 * @route PUT /api/orders/:id
 * @description Update order by ID
 * @access Protected - Requires authentication
 * @params {string} id - Order ID
 * @body {Object} updateData - Fields to update
 * @returns {Object} JSON response with updated order
 */
router.put('/:id', authenticateToken, OrderController.updateOrder);

/**
 * @route DELETE /api/orders/:id
 * @description Delete order by ID (only pending orders)
 * @access Protected - Requires authentication
 * @params {string} id - Order ID
 * @returns {Object} JSON response with deleted order
 */
router.delete('/:id', authenticateToken, OrderController.deleteOrder);

/**
 * @route GET /api/orders/client/:clientId
 * @description Get orders for a specific client
 * @access Protected - Requires authentication
 * @params {string} clientId - Client UUID
 * @queryParams {number} page - Page number (default: 1)
 * @queryParams {number} limit - Items per page (default: 10)
 * @queryParams {string} status - Filter by status
 * @queryParams {string} sort_by - Sort field (default: created_at)
 * @queryParams {string} sort_order - Sort order (default: desc)
 * @returns {Object} JSON response with client orders and pagination
 */
router.get('/client/:clientId', authenticateToken, OrderController.getClientOrders);

/**
 * @route GET /api/orders/owner/:ownerId
 * @description Get orders for gigs owned by a specific user
 * @access Protected - Requires authentication
 * @params {string} ownerId - Gig owner UUID
 * @queryParams {number} page - Page number (default: 1)
 * @queryParams {number} limit - Items per page (default: 10)
 * @queryParams {string} status - Filter by status
 * @queryParams {string} sort_by - Sort field (default: created_at)
 * @queryParams {string} sort_order - Sort order (default: desc)
 * @returns {Object} JSON response with owner orders and pagination
 */
router.get('/owner/:ownerId', authenticateToken, OrderController.getOwnerOrders);

/**
 * @route PATCH /api/orders/:id/status
 * @description Update order status
 * @access Protected - Requires authentication
 * @params {string} id - Order ID
 * @body {string} status - New status (pending, in_progress, completed, cancelled)
 * @returns {Object} JSON response with updated order
 */
router.patch('/:id/status', authenticateToken, OrderController.updateOrderStatus);

module.exports = router;

/**
 * Route Security Notes:
 * - All routes are currently public for development
 * - In production, implement authentication middleware
 * - Add authorization checks (users can only access their own orders)
 * - Implement rate limiting for API endpoints
 * - Add input validation middleware
 * - Consider implementing API versioning
 * 
 * Usage Examples:
 * GET /api/orders - Get all orders
 * GET /api/orders?status=pending&limit=5 - Get pending orders with limit
 * GET /api/orders/123 - Get order with ID 123
 * POST /api/orders - Create new order
 * PUT /api/orders/123 - Update order 123
 * DELETE /api/orders/123 - Delete order 123
 * GET /api/orders/client/uuid-123 - Get orders for client
 * GET /api/orders/owner/uuid-456 - Get orders for gig owner
 * PATCH /api/orders/123/status - Update order status
 */