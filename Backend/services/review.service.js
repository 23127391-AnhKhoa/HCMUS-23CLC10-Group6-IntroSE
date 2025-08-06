// services/review.service.js
const Review = require('../models/review.model');
const Order = require('../models/order.model');
const Gig = require('../models/gig.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const { v4: uuidv4 } = require('uuid');

const reviewService = {
  // Tạo review mới với validation và business logic
  createReview: async (reviewData, userId) => {
    const { orderId, rating, comment } = reviewData;

    // Kiểm tra order có tồn tại và thuộc về user không
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.client_id !== userId) {
      throw new Error('Bạn không có quyền đánh giá đơn hàng này');
    }

    // Kiểm tra order đã hoàn thành chưa
    if (order.status !== 'completed') {
      throw new Error('Chỉ có thể đánh giá đơn hàng đã hoàn thành');
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findByOrderId(orderId);
    if (existingReview) {
      throw new Error('Đơn hàng này đã được đánh giá');
    }

    // Lấy thông tin gig để biết seller
    const gig = await Gig.findById(order.gig_id);
    if (!gig) {
      throw new Error('Không tìm thấy gig');
    }

    // Tạo review
    const newReviewData = {
      id: uuidv4(),
      seller_id: gig.owner_id,
      buyer_id: userId,
      order_id: orderId,
      rating: parseInt(rating),
      comment: comment || '',
      created_at: new Date().toISOString()
    };

    const review = await Review.create(newReviewData);

    // Gửi notification cho seller
    try {
      await notificationService.createNotification({
        user_id: gig.owner_id,
        type: 'REVIEW_RECEIVED',
        title: 'Bạn nhận được đánh giá mới',
        message: `Bạn nhận được ${rating} sao từ khách hàng`,
        data: {
          reviewId: review.id,
          orderId: orderId,
          rating: rating
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Không throw error ở đây vì review đã được tạo thành công
    }

    // Cập nhật rating trung bình cho seller
    try {
      const ratingUpdate = await User.updateUserRating(gig.owner_id);
      console.log('Seller rating updated:', ratingUpdate);
    } catch (ratingError) {
      console.error('Error updating seller rating:', ratingError);
      // Không throw error ở đây vì review đã được tạo thành công
    }

    return review;
  },

  // Kiểm tra quyền review order
  canReviewOrder: async (orderId, userId) => {
    console.log('=== canReviewOrder called ===');
    console.log('orderId:', orderId, 'userId:', userId);
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found');
      return {
        canReview: false,
        reason: 'Không tìm thấy đơn hàng',
        order: null
      };
    }

    console.log('Order found:', order.id, 'gig_id:', order.gig_id);

    if (order.client_id !== userId) {
      console.log('User not authorized for this order');
      return {
        canReview: false,
        reason: 'Không có quyền đánh giá đơn hàng này',
        order: null
      };
    }

    if (order.status !== 'completed') {
      console.log('Order not completed, status:', order.status);
      return {
        canReview: false,
        reason: 'Đơn hàng chưa hoàn thành',
        order: order
      };
    }

    const existingReview = await Review.findByOrderId(orderId);
    
    // Lấy thông tin gig cho frontend (dùng cho cả trường hợp có và chưa có review)
    let gigInfo = null;
    if (order.gig_id) {
      console.log('Order has gig_id:', order.gig_id);
      console.log('Order gig_id type:', typeof order.gig_id);
      console.log('Order gig_id length:', order.gig_id.length);
      try {
        gigInfo = await Gig.findById(order.gig_id);
        console.log('Successfully fetched gig info:', gigInfo ? 'Found' : 'Not found');
        if (gigInfo) {
          console.log('Gig title:', gigInfo.title);
        } else {
          console.log('Gig is null for ID:', order.gig_id);
        }
      } catch (error) {
        console.warn('Could not fetch gig info:', error);
      }
    } else {
      console.log('Order does not have gig_id');
    }

    if (existingReview) {
      console.log('Review already exists');
      return {
        canReview: false,
        reason: 'Đã đánh giá',
        order: order,
        gig: gigInfo,  // ✅ Thêm gig data vào response
        review: existingReview
      };
    }

    console.log('Returning canReview response with gig:', gigInfo ? 'YES' : 'NO');
    return {
      canReview: true,
      order: order,
      gig: gigInfo
    };
  },

  // Lấy reviews của seller với pagination
  getSellerReviews: async (sellerId, options = {}) => {
    return await Review.findBySellerId(sellerId, options);
  },

  // Lấy thống kê rating của seller
  getSellerRatingStats: async (sellerId) => {
    return await Review.getSellerRatingStats(sellerId);
  },

  // Lấy reviews của buyer
  getBuyerReviews: async (buyerId, options = {}) => {
    return await Review.findByBuyerId(buyerId, options);
  },

  // Cập nhật review (chỉ comment)
  updateReview: async (reviewId, updateData, userId) => {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Không tìm thấy đánh giá');
    }

    if (review.buyer_id !== userId) {
      throw new Error('Không có quyền chỉnh sửa đánh giá này');
    }

    // Chỉ cho phép update comment
    const allowedFields = { comment: updateData.comment };
    return await Review.update(reviewId, allowedFields);
  },

  // Xóa review (chỉ admin)
  deleteReview: async (reviewId, userRole) => {
    if (userRole !== 'admin') {
      throw new Error('Không có quyền xóa đánh giá');
    }

    return await Review.delete(reviewId);
  },

  // Lấy review theo ID
  getReviewById: async (reviewId) => {
    return await Review.findById(reviewId);
  },

  // Lấy reviews gần đây
  getRecentReviews: async (limit = 5) => {
    return await Review.getRecentReviews(limit);
  }
};

module.exports = reviewService;
