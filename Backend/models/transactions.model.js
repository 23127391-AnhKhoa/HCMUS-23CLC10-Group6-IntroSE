/**
 * Transaction Model - Handles database operations for transactions
 * 
 * @file transactions.model.js
 * @description Model for managing transaction data in the Transactions table
 * 
 * @requires ../config/supabaseClient - Supabase client for database operations
 */

const supabase = require('../config/supabaseClient');

const TransactionModel = {
  /**
   * Create a new transaction record
   * 
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction record
   */
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

  /**
   * Create multiple transaction records
   * 
   * @param {Array} transactionDataArray - Array of transaction data
   * @returns {Promise<Array>} Created transaction records
   */
  createMultiple: async (transactionDataArray) => {
    // Remove fields that don't exist in database
    const cleanedData = transactionDataArray.map(({ transaction_type, status, ...dbData }) => dbData);
    
    const { data, error } = await supabase
      .from('Transactions')
      .insert(cleanedData)
      .select();

    if (error) {
      throw new Error(`Error creating transactions: ${error.message}`);
    }

    return data;
  },

  /**
   * Get transactions by user ID with detailed information
   * 
   * @param {string} userId - User UUID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of transactions
   */
  findByUserId: async (userId, options = {}) => {
    let query = supabase
      .from('Transactions')
      .select(`
        *,
        Orders!Transactions_order_id_fkey (
          id,
          status,
          price_at_purchase,
          Gigs!Orders_gig_id_fkey (
            title,
            cover_image
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get transactions by user ID (simpler version for pagination)
   * 
   * @param {string} user_id - User UUID
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Query result with data and error
   */
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

  /**
   * Get transactions by order ID
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Array of transactions
   */
  findByOrderId: async (orderId) => {
    const { data, error } = await supabase
      .from('Transactions')
      .select(`
        *,
        User!Transactions_user_id_fkey (
          uuid,
          username,
          fullname
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get total count of transactions for user
   * 
   * @param {string} user_id - User UUID
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Count result
   */
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

  /**
   * Get transaction statistics for a user
   * 
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Transaction statistics
   */
  getStatistics: async (userId) => {
    const { data, error } = await supabase
      .from('Transactions')
      .select('amount, created_at')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error fetching transaction statistics: ${error.message}`);
    }

    const transactions = data || [];
    const income = transactions.filter(t => t.amount > 0);
    const expenses = transactions.filter(t => t.amount < 0);

    return {
      total_transactions: transactions.length,
      total_income: income.reduce((sum, t) => sum + t.amount, 0),
      total_expenses: Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0)),
      this_month_income: income.filter(t => {
        const transactionDate = new Date(t.created_at);
        const currentDate = new Date();
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, t) => sum + t.amount, 0),
      this_month_expenses: Math.abs(expenses.filter(t => {
        const transactionDate = new Date(t.created_at);
        const currentDate = new Date();
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, t) => sum + t.amount, 0))
    };
  }
};

module.exports = TransactionModel;