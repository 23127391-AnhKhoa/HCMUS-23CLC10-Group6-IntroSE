// models/user.model.js
const supabase = require('../config/supabaseClient');

const User = {
  findByUsername: async (username) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single(); // .single() để chỉ lấy 1 dòng kết quả

    if (error && error.code !== 'PGRST116') { // PGRST116: Lỗi khi không tìm thấy dòng nào, ta bỏ qua lỗi này
      throw error;
    }
    
    return data;
  }
};

module.exports = User;