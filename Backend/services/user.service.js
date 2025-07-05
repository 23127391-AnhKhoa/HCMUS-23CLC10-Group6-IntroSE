// backend/services/user.service.js
const supabase = require('../config/supabaseClient');

const UserService = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const { data: user, error } = await supabase
        .from('User')
        .select(`
          uuid,
          fullname,
          username,
          avt_url,
          balance,
          created_at,
          updated_at,
          role,
          status,
          seller_headline,
          seller_description,
          seller_since
        `)
        .eq('uuid', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!user) return null;

      // Return flattened user data
      return {
        id: user.uuid,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avt_url || 'https://placehold.co/300x300',
        balance: user.balance,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role: user.role,
        status: user.status,
        seller_headline: user.seller_headline,
        seller_description: user.seller_description,
        seller_since: user.seller_since
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  },

  // Get user by username
  getUserByUsername: async (username) => {
    try {
      const { data: user, error } = await supabase
        .from('User')
        .select(`
          uuid,
          fullname,
          username,
          avt_url,
          balance,
          created_at,
          updated_at,
          role,
          status,
          seller_headline,
          seller_description,
          seller_since
        `)
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!user) return null;

      // Return flattened user data
      return {
        id: user.uuid,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avt_url || 'https://placehold.co/300x300',
        balance: user.balance,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role: user.role,
        status: user.status,
        seller_headline: user.seller_headline,
        seller_description: user.seller_description,
        seller_since: user.seller_since
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }
};

module.exports = UserService;
