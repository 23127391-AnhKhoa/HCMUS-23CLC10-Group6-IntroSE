// transaction.model.js
const supabase = require('../config/supabaseClient');

const TransactionModel = {
  async create({ user_id, order_id = null, amount, description, type }) {
    const { data, error } = await supabase
      .from('Transactions')
      .insert([
        {
          user_id,
          order_id,
          amount,
          description,
          type,
        },
      ])
      .select()
      .single(); // Trả về 1 bản ghi

    if (error) throw error;
    return data;
  },


  async getByUserId(user_id, filters = {}) {
    let query = supabase
      .from('Transactions')
      .select('*')
      .eq('user_id', user_id);

    // Apply type filter if specified
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    return await query;
  },

  async getTotalCount(user_id, filters = {}) {
    let query = supabase
      .from('Transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    // Apply type filter if specified
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const { count, error } = await query;
    
    if (error) {
      return { data: 0, error };
    }
    
    return { data: count || 0, error: null };
  },
};

module.exports = TransactionModel;