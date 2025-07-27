// models/user.model.js
const supabase = require('../config/supabaseClient'); // Giả định

const User = {
  // HÀM CŨ CỦA BẠN (giữ nguyên)
  findById: async (uuid) => {
    const { data, error } = await supabase.from('User').select('*').eq('uuid', uuid).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Tìm user bằng username
  findByUsername: async (username) => {
    const { data, error } = await supabase.from('User').select('*').eq('username', username).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Tạo profile mới cho user
  createProfile: async (profileData) => {
    const { data, error } = await supabase.from('User').insert([profileData]).select();
    if (error) throw error;
    return data[0];
  },

  // HÀM CŨ CỦA BẠN (giữ nguyên, nhưng tôi sẽ dùng tên bảng là 'User' cho nhất quán)
  updateByUuid: async (uuid, updateData) => {
    
    const { data, error } = await supabase
      .from('User') // Sửa 'users' thành 'User' cho nhất quán với các hàm khác
      .update(updateData)
      .eq('uuid', uuid)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('User not found or no update was made.');
    
    return data[0];
  },

  // === BỔ SUNG HÀM MỚI ===

  /**
   * BỔ SUNG: Tìm tất cả user, có hỗ trợ tìm kiếm
   * @param {string} searchTerm - Từ khóa để tìm theo tên hoặc email
   * @returns {Promise<Array>} - Mảng các user
   */
  findAll: async (searchTerm) => {
    let query = supabase.from('User').select('*');

    // Nếu có searchTerm, thêm điều kiện tìm kiếm
    if (searchTerm) {
      // Dùng or() để tìm kiếm trên nhiều cột: username, name, hoặc email.
      // .ilike là tìm kiếm không phân biệt chữ hoa-thường.
      query = query.or(
        `username.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * BỔ SUNG: Xóa profile user bằng uuid
   * @param {string} uuid - UUID của user cần xóa
   */
  remove: async (uuid) => {
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('uuid', uuid);
    
    if (error) throw error;
    return { message: 'User profile deleted' };
  },

  searchUsers: async (query) => {
    const { data, error } = await supabase
      .from('User')
      .select('uuid, fullname, username, avt_url, role, status, seller_headline')
      .or(`fullname.ilike.%${query}%,username.ilike.%${query}%`)
      .eq('status', 'active')
      .order('fullname')
      .limit(20);

    if (error) throw error;
    
    // Map avt_url to avatar for frontend compatibility
    const users = (data || []).map(user => ({
      ...user,
      avatar: user.avt_url
    }));
    
    return { status: 'success', data: users };
  },

  // === USER FAVORITES FUNCTIONS ===
  
  // Thêm gig vào favorites
  addFavorite: async (userId, gigId) => {
    try {
      const { data, error } = await supabase
        .from('UserFavorites')
        .insert([
          {
            user_id: userId,
            gig_id: gigId,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in addFavorite:', error);
      throw error;
    }
  },

  // Xóa gig khỏi favorites
  removeFavorite: async (userId, gigId) => {
    try {
      const { data, error } = await supabase
        .from('UserFavorites')
        .delete()
        .eq('user_id', userId)
        .eq('gig_id', gigId)
        .select();

      if (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      throw error;
    }
  },

  // Lấy tất cả favorites của user
  getUserFavorites: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('UserFavorites')
        .select(`
          *,
          Gigs!UserFavorites_gig_id_fkey (
            id,
            title,
            description,
            price,
            cover_image,
            category_id,
            owner_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user favorites:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      throw error;
    }
  },

  // Kiểm tra xem gig có được favorite hay không
  isFavorited: async (userId, gigId) => {
    try {
      const { data, error } = await supabase
        .from('UserFavorites')
        .select('*')
        .eq('user_id', userId)
        .eq('gig_id', gigId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        console.error('Error checking favorite status:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isFavorited:', error);
      throw error;
    }
  },

  // Toggle favorite status
  toggleFavorite: async (userId, gigId) => {
    try {
      const isFav = await User.isFavorited(userId, gigId);
      
      if (isFav) {
        await User.removeFavorite(userId, gigId);
        return { action: 'removed', isFavorited: false };
      } else {
        await User.addFavorite(userId, gigId);
        return { action: 'added', isFavorited: true };
      }
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }
};

module.exports = User;