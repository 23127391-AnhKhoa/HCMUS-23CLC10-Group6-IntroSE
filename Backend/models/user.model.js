// models/user.model.js
const supabase = require('../config/supabaseClient'); // Giả định

const User = {
  // Tìm user bằng ID
  findById: async (uuid) => {
    const { data, error } = await supabase.from('User').select('*').eq('uuid', uuid).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Tạo profile mới cho user
  createProfile: async (profileData) => {
    const { data, error } = await supabase.from('User').insert([profileData]).select();
    if (error) throw error;
    return data[0];
  },

  updateByUuid: async (uuid, updateData) => {
    const { data, error } = await supabase
      .from('User') // Sử dụng table name đúng
      .update(updateData)
      .eq('uuid', uuid)
      .select(); // .select() để trả về bản ghi đã được cập nhật

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('User not found or no update was made.');
    
    return data[0];
  }
};

module.exports = User;