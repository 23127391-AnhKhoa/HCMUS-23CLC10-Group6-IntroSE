// models/user.model.js
const supabase = require('../config/supabaseClient'); // Giả định

const User = {
  // HÀM CŨ CỦA BẠN (giữ nguyên)
  findById: async (uuid) => {
    const { data, error } = await supabase.from('User').select('*').eq('uuid', uuid).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // HÀM CŨ CỦA BẠN (giữ nguyên)
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
  }
};

module.exports = User;