// services/reviewService.js
import ApiService from './apiService';

const reviewService = {
  // Tạo review mới
  createReview: async (reviewData, token) => {
    return await ApiService.request({
      url: '/reviews',
      method: 'POST',
      data: reviewData,
      token
    });
  },

  // Lấy review theo ID
  getReviewById: async (reviewId, token) => {
    return await ApiService.request({
      url: `/reviews/${reviewId}`,
      method: 'GET',
      token
    });
  },

  // Lấy reviews của seller
  getSellerReviews: async (sellerId, params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await ApiService.request({
      url: `/reviews/seller/${sellerId}${queryString ? `?${queryString}` : ''}`,
      method: 'GET',
      token
    });
  },

  // Lấy thống kê rating của seller
  getSellerRatingStats: async (sellerId, token) => {
    return await ApiService.request({
      url: `/reviews/seller/${sellerId}/stats`,
      method: 'GET',
      token
    });
  },

  // Lấy reviews của buyer
  getBuyerReviews: async (buyerId, params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await ApiService.request({
      url: `/reviews/buyer/${buyerId}${queryString ? `?${queryString}` : ''}`,
      method: 'GET',
      token
    });
  },

  // Kiểm tra có thể review order không
  canReviewOrder: async (orderId, token) => {
    return await ApiService.request({
      url: `/reviews/order/${orderId}/can-review`,
      method: 'GET',
      token
    });
  },

  // Cập nhật review
  updateReview: async (reviewId, updateData, token) => {
    return await ApiService.request({
      url: `/reviews/${reviewId}`,
      method: 'PUT',
      data: updateData,
      token
    });
  },

  // Xóa review (admin only)
  deleteReview: async (reviewId, token) => {
    return await ApiService.request({
      url: `/reviews/${reviewId}`,
      method: 'DELETE',
      token
    });
  },

  // Lấy reviews gần đây
  getRecentReviews: async (limit = 5, token) => {
    return await ApiService.request({
      url: `/reviews/recent?limit=${limit}`,
      method: 'GET',
      token
    });
  }
};

export default reviewService;