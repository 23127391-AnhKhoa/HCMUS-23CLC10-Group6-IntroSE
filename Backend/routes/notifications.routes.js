// routes/notifications.routes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/notifications
 * @desc Get notifications for authenticated user
 * @access Private
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {boolean} unread_only - Get only unread notifications
 * @query {string} type - Filter by notification type
 */
router.get('/', NotificationController.getNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notifications count
 * @access Private
 */
router.get('/unread-count', NotificationController.getUnreadCount);

/**
 * @route PUT /api/notifications/:notificationId/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:notificationId/read', NotificationController.markAsRead);

/**
 * @route PUT /api/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/mark-all-read', NotificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:notificationId
 * @desc Delete notification
 * @access Private
 */
router.delete('/:notificationId', NotificationController.deleteNotification);

/**
 * @route POST /api/notifications
 * @desc Create notification (internal use)
 * @access Private (Admin/System only)
 */
router.post('/', NotificationController.createNotification);

module.exports = router;
