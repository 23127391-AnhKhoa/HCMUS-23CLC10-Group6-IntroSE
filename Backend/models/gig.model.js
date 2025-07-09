// models/gig.model.js
const supabase = require('../config/supabaseClient');

// Add health check for the connection
const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('Gigs').select('count').limit(1);
    if (error) {
      console.error('Gig Model Connection check failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Gig Model Connection check error:', error);
    return false;
  }
};

// Helper function to execute query with retry using fresh connection
const executeQueryWithRetry = async (queryFunction, queryName = 'unknown') => {
  try {
    const result = await queryFunction(supabase);
    
    // If we get empty results, try with fresh connection
    if (result.data && Array.isArray(result.data) && result.data.length === 0) {
      const { refreshConnection } = require('../config/supabaseClient');
      const freshClient = refreshConnection();
      const retryResult = await queryFunction(freshClient);
      
      if (retryResult.data && Array.isArray(retryResult.data) && retryResult.data.length > 0) {
        return retryResult;
      } else {
        return result;
      }
    }
    
    // If we get a count of 0, try with fresh connection
    if (result.count === 0) {
      const { refreshConnection } = require('../config/supabaseClient');
      const freshClient = refreshConnection();
      const retryResult = await queryFunction(freshClient);
      
      if (retryResult.count > 0) {
        return retryResult;
      } else {
        return result;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Gig Model Error in ${queryName}:`, error);
    throw error;
  }
};

const Gig = {
  // Find gig by ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from('Gigs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create a new gig
  create: async (gigData) => {
    const { data, error } = await supabase
      .from('Gigs')
      .insert([gigData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update gig by ID
  updateById: async (id, updateData) => {
    const { data, error } = await supabase
      .from('Gigs')
      .update({ ...updateData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete gig by ID
  deleteById: async (id) => {
    const { data, error } = await supabase
      .from('Gigs')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find gigs by owner ID
  findByOwnerId: async (ownerId) => {
    const { data, error } = await supabase
      .from('Gigs')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw error;
    return data;
  },

  // Get all active gigs
  findActive: async () => {
    const { data, error } = await supabase
      .from('Gigs')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    return data;
  },

  // Get gigs with owner and category information
  findWithDetails: async (filters = {}) => {
    try {
      const queryFunction = async (client) => {
        let query = client
          .from('Gigs')
          .select(`
            *,
            User!Gigs_owner_id_fkey (
              uuid,
              username,
              fullname,
              avt_url
            ),
            Categories!Gigs_category_id_fkey (
              id,
              name,
              description
            )
          `);

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // Apply sorting
        if (filters.sort_by && filters.sort_order) {
          query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        if (filters.limit) {
          const from = ((filters.page || 1) - 1) * filters.limit;
          const to = from + filters.limit - 1;
          query = query.range(from, to);
        }

        const result = await query;
        
        if (result.error) {
          console.error('Gig Model Query Error:', result.error);
          throw result.error;
        }
        
        return result;
      };

      const result = await executeQueryWithRetry(queryFunction, 'findWithDetails');
      const data = result.data;
      
      return data;
      
    } catch (error) {
      console.error('Gig Model Error in findWithDetails:', error);
      throw error;
    }
  },

  // Get count of gigs with filters
  getCount: async (filters = {}) => {
    try {
      const queryFunction = async (client) => {
        let query = client
          .from('Gigs')
          .select('*', { count: 'exact', head: true });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const result = await query;
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };

      const result = await executeQueryWithRetry(queryFunction, 'getCount');
      const count = result.count;
      
      return count;
      
    } catch (error) {
      console.error('Gig Model Error in getCount:', error);
      throw error;
    }
  }
};

module.exports = Gig;
