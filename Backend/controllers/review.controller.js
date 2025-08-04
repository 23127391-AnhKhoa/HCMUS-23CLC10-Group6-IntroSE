// controllers/review.controller.js
const reviewService = require('../services/review.service');

// Validation functions
const validateReviewData = (data) => {
  const errors = [];

  // Validate rating
  if (!data.rating) {
    errors.push('Rating là bắt buộc');
  } else if (data.rating < 1 || data.rating > 5) {
    errors.push('Rating phải từ 1 đến 5');
  }

  // Validate comment (optional but if provided, should have reasonable length)
  if (data.comment && data.comment.length > 1000) {
    errors.push('Bình luận không được vượt quá 1000 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOrderId = (orderId) => {
  if (!orderId) {
    return {
      isValid: false,
      error: 'Order ID là bắt buộc'
    };
  }

  // Check if it's a valid number
  if (isNaN(orderId)) {
    return {
      isValid: false,
      error: 'Order ID phải là số'
    };
  }

  return {
    isValid: true
  };
};

const reviewController = {
  // Tạo review mới
  createReview: async (req, res) => {
    try {
      const { orderId, rating, comment } = req.body;
      const userId = req.user.uuid;

      // Validate input
      const validation = validateReviewData({ orderId, rating, comment });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors.join(', ')
        });
      }

      const orderValidation = validateOrderId(orderId);
      if (!orderValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: orderValidation.error
        });
      }

      // Sử dụng service layer
      const review = await reviewService.createReview(
        { orderId, rating, comment },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Tạo đánh giá thành công',
        data: review
      });

    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo đánh giá'
      });
    }
  },

  // Lấy review theo ID
  getReviewById: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await reviewService.getReviewById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      res.json({
        success: true,
        data: review
      });

    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá'
      });
    }
  },

  // Lấy reviews của seller
  getSellerReviews: async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await reviewService.getSellerReviews(sellerId, options);

      res.json({
        success: true,
        data: result.reviews,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit)
        }
      });

    } catch (error) {
      console.error('Error getting seller reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá của seller'
      });
    }
  },

  // Lấy reviews của buyer
  getBuyerReviews: async (req, res) => {
    try {
      const { buyerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Kiểm tra quyền truy cập
      if (req.user.uuid !== buyerId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await reviewService.getBuyerReviews(buyerId, options);

      res.json({
        success: true,
        data: result.reviews,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit)
        }
      });

    } catch (error) {
      console.error('Error getting buyer reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá của buyer'
      });
    }
  },

  // Lấy thống kê rating của seller
  getSellerRatingStats: async (req, res) => {
    try {
      const { sellerId } = req.params;

      const stats = await reviewService.getSellerRatingStats(sellerId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error getting seller rating stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê rating'
      });
    }
  },

  // Lấy reviews gần đây
  getRecentReviews: async (req, res) => {
    try {
      const { limit = 5 } = req.query;

      const reviews = await reviewService.getRecentReviews(parseInt(limit));

      res.json({
        success: true,
        data: reviews
      });

    } catch (error) {
      console.error('Error getting recent reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy reviews gần đây'
      });
    }
  },

  // Kiểm tra xem order có thể review không
  canReviewOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user.uuid;

      console.log('🔍 [Review Controller] canReviewOrder called');
      console.log('📋 Order ID:', orderId);
      console.log('👤 User ID:', userId);

      const result = await reviewService.canReviewOrder(orderId, userId);

      console.log('✅ [Review Controller] canReviewOrder result:', result.canReview ? 'Can Review' : 'Cannot Review');

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Error checking can review order:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra đánh giá'
      });
    }
  },

  // Cập nhật review (chỉ comment, không được thay đổi rating)
  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.uuid;

      const updatedReview = await reviewService.updateReview(
        id,
        { comment },
        userId
      );

      res.json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: updatedReview
      });

    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật đánh giá'
      });
    }
  },

  // Xóa review (chỉ admin)
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;

      await reviewService.deleteReview(id, req.user.role);

      res.json({
        success: true,
        message: 'Xóa đánh giá thành công'
      });

    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xóa đánh giá'
      });
    }
  }
};

module.exports = reviewController;
