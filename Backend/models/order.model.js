/**
 * Order Model - Handles database operations for orders
 * 
 * @file order.model.js
 * @description Model for managing order data in the Orders table
 * Includes CRUD operations and relationship queries with User and Gigs tables
 * 
 * @requires ../config/supabaseClient - Supabase client for database operations
 */

const supabase = require('../config/supabaseClient');

const Order = {
  /**
   * Find order by ID with related data
   * 
   * @param {number} id - Order ID
   * @returns {Promise<Object|null>} Order object with client and gig details
   */
  findById: async (id) => {
    const { data, error } = await supabase
      .from('Orders')
      .select(`
        *,
        User!Orders_client_id_fkey (
          uuid,
          username,
          fullname,
          avt_url
        ),
        Gigs!Orders_gig_id_fkey (
          id,
          title,
          cover_image,
          description,
          price,
          delivery_days,
          num_of_edits,
          status,
          owner_id,
          category_id,
          created_at,
          updated_at,
          User!Gigs_owner_id_fkey (
            uuid,
            username,
            fullname,
            avt_url
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create a new order
   * 
   * @param {Object} orderData - Order data object
   * @param {string} orderData.client_id - UUID of the client
   * @param {string} orderData.gig_id - UUID of the gig
   * @param {number} orderData.price_at_purchase - Price at the time of purchase
   * @param {string} orderData.requirement - Order requirements/description
   * @param {string} [orderData.status='pending'] - Order status
   * @returns {Promise<Object>} Created order object
   */
  create: async (orderData) => {
    const { data, error } = await supabase
      .from('Orders')
      .insert([{
        client_id: orderData.client_id,
        gig_id: orderData.gig_id,
        price_at_purchase: orderData.price_at_purchase,
        requirement: orderData.requirement,
        status: orderData.status || 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update order by ID
   * 
   * @param {number} id - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated order object
   */
  updateById: async (id, updateData) => {
    const { data, error } = await supabase
      .from('Orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete order by ID
   * 
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Deleted order object
   */
  deleteById: async (id) => {
    const { data, error } = await supabase
      .from('Orders')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Find orders by client ID
   * 
   * @param {string} clientId - Client UUID
   * @param {Object} options - Query options
   * @param {number} [options.limit] - Limit number of results
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<Array>} Array of order objects
   */
  findByClientId: async (clientId, options = {}) => {
    let query = supabase
      .from('Orders')
      .select(`
        *,
        User!Orders_client_id_fkey (
          uuid,
          username,
          fullname,
          avt_url
        ),
        Gigs!Orders_gig_id_fkey (
          id,
          title,
          cover_image,
          description,
          price,
          delivery_days,
          num_of_edits,
          status,
          owner_id,
          category_id,
          created_at,
          updated_at,
          User!Gigs_owner_id_fkey (
            uuid,
            username,
            fullname,
            avt_url
          )
        )
      `)
      .eq('client_id', clientId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Find orders by gig owner ID
   * 
   * @param {string} ownerId - Gig owner UUID
   * @param {Object} options - Query options
   * @param {number} [options.limit] - Limit number of results
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<Array>} Array of order objects
   */
  findByGigOwnerId: async (ownerId, options = {}) => {
    try {
      console.log('🔍 [Order Model] findByGigOwnerId called with ownerId:', ownerId);
      console.log('🔧 [Order Model] Options:', options);
      
      // First, get all gig IDs owned by this user
      const { data: gigs, error: gigsError } = await supabase
        .from('Gigs')
        .select('id')
        .eq('owner_id', ownerId);
      
      if (gigsError) {
        console.error('❌ [Order Model] Error fetching gigs:', gigsError);
        throw gigsError;
      }
      
      if (!gigs || gigs.length === 0) {
        console.log('ℹ️ [Order Model] No gigs found for owner, returning empty array');
        return [];
      }
      
      const gigIds = gigs.map(gig => gig.id);
      console.log('📋 [Order Model] Found gig IDs:', gigIds);
      
      // Now get orders for these gigs
      let query = supabase
        .from('Orders')
        .select(`
          *,
          User!Orders_client_id_fkey (
            uuid,
            username,
            fullname,
            avt_url
          ),
          Gigs!Orders_gig_id_fkey (
            id,
            title,
            cover_image,
            description,
            price,
            delivery_days,
            num_of_edits,
            status,
            owner_id,
            category_id,
            created_at,
            updated_at,
            User!Gigs_owner_id_fkey (
              uuid,
              username,
              fullname,
              avt_url
            )
          )
        `)
        .in('gig_id', gigIds);

      if (options.status) {
        query = query.eq('status', options.status);
        console.log('🔍 [Order Model] Filtering by status:', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
        console.log('🔍 [Order Model] Limiting to:', options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        console.log('🔍 [Order Model] Range:', options.offset, 'to', options.offset + (options.limit || 10) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ [Order Model] Error fetching orders:', error);
        throw error;
      }
      
      console.log('✅ [Order Model] Successfully fetched', data?.length || 0, 'orders for owner');
      return data || [];
    } catch (error) {
      console.error('💥 [Order Model] Error in findByGigOwnerId:', error);
      throw error;
    }
  },

  /**
   * Get orders with pagination and filtering
   * 
   * @param {Object} filters - Filter options
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.limit=10] - Items per page
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.client_id] - Filter by client ID
   * @param {string} [filters.gig_id] - Filter by gig ID
   * @param {string} [filters.sort_by='created_at'] - Sort field
   * @param {string} [filters.sort_order='desc'] - Sort order
   * @returns {Promise<Array>} Array of order objects
   */
  findWithDetails: async (filters = {}) => {
    try {
      let query = supabase
        .from('Orders')
        .select(`
          *,
          User!Orders_client_id_fkey (
            uuid,
            username,
            fullname,
            avt_url
          ),
          Gigs!Orders_gig_id_fkey (
            id,
            title,
            cover_image,
            description,
            price,
            delivery_days,
            num_of_edits,
            status,
            owner_id,
            category_id,
            created_at,
            updated_at,
            User!Gigs_owner_id_fkey (
              uuid,
              username,
              fullname,
              avt_url
            )
          )
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      
      if (filters.gig_id) {
        query = query.eq('gig_id', filters.gig_id);
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

      console.log('🔍 Executing Orders query with filters:', filters);
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Orders query error:', error);
        throw error;
      }
      
      console.log('✅ Orders query successful, returned:', data?.length || 0, 'records');
      return data || [];
    } catch (error) {
      console.error('💥 Error in findWithDetails:', error);
      throw error;
    }
  },

  /**
   * Get count of orders with filters
   * 
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count of orders
   */
  getCount: async (filters = {}) => {
    try {
      let query = supabase
        .from('Orders')
        .select('*', { count: 'exact', head: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      
      if (filters.gig_id) {
        query = query.eq('gig_id', filters.gig_id);
      }

      console.log('🔢 Executing Orders count query with filters:', filters);
      const { count, error } = await query;
      
      if (error) {
        console.error('❌ Orders count query error:', error);
        throw error;
      }
      
      console.log('✅ Orders count query successful, total records:', count);
      return count || 0;
    } catch (error) {
      console.error('💥 Error in getCount:', error);
      throw error;
    }
  },

  /**
   * Update order status
   * 
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order object
   */
  updateStatus: async (id, status) => {
    const updateData = { status };
    
    // If status is completed, set completed_at timestamp
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // If status is in_progress (seller confirms), calculate delivery deadline
    if (status === 'in_progress') {
      // First, get the order with gig details to access delivery_days
      const { data: orderWithGig, error: fetchError } = await supabase
        .from('Orders')
        .select(`
          *,
          Gigs!Orders_gig_id_fkey (
            delivery_days
          )
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (orderWithGig && orderWithGig.Gigs && orderWithGig.Gigs.delivery_days) {
        // Calculate delivery deadline: current date + delivery_days
        const now = new Date();
        const deliveryDeadline = new Date(now.getTime() + (orderWithGig.Gigs.delivery_days * 24 * 60 * 60 * 1000));
        updateData.delivery_deadline = deliveryDeadline.toISOString();
      }
    }

    const { data, error } = await supabase
      .from('Orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Count orders by client ID
   * 
   * @param {string} clientId - Client UUID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<number>} Count of orders
   */
  countByClientId: async (clientId, options = {}) => {
    let query = supabase
      .from('Orders')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  /**
   * Count orders by gig owner ID
   * 
   * @param {string} ownerId - Gig owner UUID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<number>} Count of orders
   */
  countByGigOwnerId: async (ownerId, options = {}) => {
    try {
      console.log('🔍 [Order Model] countByGigOwnerId called with ownerId:', ownerId);
      console.log('🔧 [Order Model] Options:', options);
      
      // First, get all gig IDs owned by this user
      const { data: gigs, error: gigsError } = await supabase
        .from('Gigs')
        .select('id')
        .eq('owner_id', ownerId);
      
      if (gigsError) {
        console.error('❌ [Order Model] Error fetching gigs for count:', gigsError);
        throw gigsError;
      }
      
      if (!gigs || gigs.length === 0) {
        console.log('ℹ️ [Order Model] No gigs found for owner, returning 0');
        return 0;
      }
      
      const gigIds = gigs.map(gig => gig.id);
      console.log('📋 [Order Model] Counting orders for gig IDs:', gigIds);
      
      // Now count orders for these gigs
      let query = supabase
        .from('Orders')
        .select('*', { count: 'exact', head: true })
        .in('gig_id', gigIds);

      if (options.status) {
        query = query.eq('status', options.status);
        console.log('🔍 [Order Model] Filtering count by status:', options.status);
      }

      const { count, error } = await query;
      
      if (error) {
        console.error('❌ [Order Model] Error counting orders:', error);
        throw error;
      }
      
      console.log('✅ [Order Model] Successfully counted', count || 0, 'orders for owner');
      return count || 0;
    } catch (error) {
      console.error('💥 [Order Model] Error in countByGigOwnerId:', error);
      throw error;
    }
  },

};

module.exports = Order;
