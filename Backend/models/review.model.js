// models/review.model.js
const supabase = require('../config/supabaseClient');

const Review = {
  // Tạo review mới
  create: async (reviewData) => {
    const { data, error } = await supabase
      .from('Reviews')
      .insert([reviewData])
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(id, gig_id, price_at_purchase, requirement)
      `);

    if (error) throw error;
    return data[0];
  },

  // Get reviews by gig ID (from order relationship)
  findByGigId: async (gigId, options = {}) => {
    try {
      const { limit = 10, offset = 0, sort_order = 'desc' } = options;

      const { data, error } = await supabase
        .from('Reviews')
        .select(`
          *,
          seller:seller_id(uuid, username, fullname, avt_url),
          buyer:buyer_id(uuid, username, fullname, avt_url),
          order:order_id(id, gig_id, price_at_purchase, requirement)
        `)
        .eq('order.gig_id', gigId)
        .order('created_at', { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Review Model Error in findByGigId:', error);
      throw error;
    }
  },

  // Get gig rating statistics for a specific gig
  getGigRatingStats: async (gigId) => {
    try {
      // First get all orders for this gig, then get reviews for those orders
      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select('id')
        .eq('gig_id', gigId);

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return { avgRating: null, totalReviews: 0 };
      }

      const orderIds = orders.map(order => order.id);

      const { data: reviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('rating')
        .in('order_id', orderIds);

      if (reviewsError) throw reviewsError;

      const reviewsData = reviews || [];
      const totalReviews = reviewsData.length;
      
      if (totalReviews === 0) {
        return { avgRating: null, totalReviews: 0 };
      }

      const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      return { 
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        totalReviews 
      };
    } catch (error) {
      console.error('Review Model Error in getGigRatingStats:', error);
      throw error;
    }
  },

  // Lấy review theo ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from('Reviews')
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(id, gig_id, price_at_purchase, requirement)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Lấy reviews của seller
  findBySellerId: async (sellerId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('Reviews')
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(
          id, 
          gig_id, 
          price_at_purchase,
          gig:gig_id(id, title, cover_image, price)
        )
      `, { count: 'exact' })
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { reviews: data, total: count };
  },

  // Lấy reviews của buyer
  findByBuyerId: async (buyerId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('Reviews')
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(id, gig_id, price_at_purchase)
      `, { count: 'exact' })
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { reviews: data, total: count };
  },

  // Kiểm tra xem order đã được review chưa
  findByOrderId: async (orderId) => {
    const { data, error } = await supabase
      .from('Reviews')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Lấy thống kê rating của seller
  getSellerRatingStats: async (sellerId) => {
    const { data, error } = await supabase
      .from('Reviews')
      .select('rating')
      .eq('seller_id', sellerId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      };
    }

    const ratings = data.map(review => review.rating);
    const totalReviews = ratings.length;
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews;
    
    const ratingDistribution = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution
    };
  },

  // Cập nhật review
  update: async (id, updateData) => {
    const { data, error } = await supabase
      .from('Reviews')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(id, gig_id, price_at_purchase)
      `);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Review not found');
    return data[0];
  },

  // Xóa review
  delete: async (id) => {
    const { error } = await supabase
      .from('Reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Lấy reviews gần đây
  getRecentReviews: async (limit = 5) => {
    const { data, error } = await supabase
      .from('Reviews')
      .select(`
        *,
        seller:seller_id(uuid, username, fullname, avt_url),
        buyer:buyer_id(uuid, username, fullname, avt_url),
        order:order_id(id, gig_id, price_at_purchase)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

module.exports = Review;
