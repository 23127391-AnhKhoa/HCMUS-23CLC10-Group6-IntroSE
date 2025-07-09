// controllers/conversation.controller.js
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

const ConversationController = {
  // Lấy tất cả conversations của user
  getUserConversations: async (req, res) => {
    try {
      const userId = req.user.uuid;
      
      const conversations = await Conversation.findByUserId(userId);
      
      // Thêm thông tin last message cho mỗi conversation
      const conversationsWithLastMessage = await Promise.all(
        conversations.map(async (conv) => {
          const lastMessage = await Message.getLastMessage(conv.id);
          return {
            ...conv,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.created_at || conv.created_at
          };
        })
      );

      res.status(200).json(conversationsWithLastMessage);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Tạo conversation mới hoặc lấy conversation hiện có
  createOrGetConversation: async (req, res) => {
    try {
      const { otherUserId } = req.body;
      const currentUserId = req.user.uuid;

      if (!otherUserId) {
        return res.status(400).json({
          message: 'Other user ID is required'
        });
      }

      if (otherUserId === currentUserId) {
        return res.status(400).json({
          message: 'Cannot create conversation with yourself'
        });
      }

      // Kiểm tra xem conversation đã tồn tại chưa
      let conversation = await Conversation.findBetweenUsers(currentUserId, otherUserId);

      if (!conversation) {
        // Tạo conversation mới
        conversation = await Conversation.create(currentUserId, otherUserId);
      }

      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Lấy messages của conversation
  getConversationMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.uuid;

      // Kiểm tra user có quyền truy cập conversation này không
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          message: 'Conversation not found'
        });
      }

      if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const messages = await Message.findByConversationId(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Gửi message mới
  sendMessage: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const senderId = req.user.uuid;

      if (!content || !content.trim()) {
        return res.status(400).json({
          message: 'Message content is required'
        });
      }

      // Kiểm tra user có quyền gửi message vào conversation này không
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          message: 'Conversation not found'
        });
      }

      if (conversation.user1_id !== senderId && conversation.user2_id !== senderId) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const message = await Message.create(conversationId, senderId, content.trim());
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = ConversationController;
