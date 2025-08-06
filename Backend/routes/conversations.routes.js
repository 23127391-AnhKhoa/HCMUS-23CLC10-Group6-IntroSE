// routes/conversations.routes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Lấy tất cả conversations của user
router.get('/', authenticateToken, conversationController.getUserConversations);

// Tạo conversation mới hoặc lấy conversation hiện có
router.post('/', authenticateToken, conversationController.createOrGetConversation);

// Lấy messages của conversation
router.get('/:conversationId/messages', authenticateToken, conversationController.getConversationMessages);

// Gửi message mới
router.post('/:conversationId/messages', authenticateToken, conversationController.sendMessage);

// Tạo hoặc lấy conversation cho order
router.get('/order/:orderId', authenticateToken, conversationController.getOrCreateOrderConversation);

module.exports = router;
