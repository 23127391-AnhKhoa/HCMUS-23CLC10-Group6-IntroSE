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
    
    // If we get empty results, just return them (no retry needed)
    if (result.data && Array.isArray(result.data) && result.data.length === 0) {
      console.log(`Query ${queryName} returned no results`);
      return result;
    }
    
    // If we get a count of 0, just return it (no retry needed)
    if (result.count === 0) {
      console.log(`Query ${queryName} returned count of 0`);
      return result;
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
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Gigs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (result.error && result.error.code !== 'PGRST116') {
          throw result.error;
        }
        
        return result;
      };
      const result = await executeQueryWithRetry(queryFunction, 'findById');
      return result.data;
      
    } catch (error) {
      console.error('Gig Model Error in findById:', error);
      throw error;
    }
  },
  findByIds: async (ids) => {
        if (!ids || ids.length === 0) return [];
        const { data, error } = await supabase
            .from('Gigs')
            .select('*')
            .in('id', ids);
        if (error) throw error;
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
        // If search is provided, implement priority-based search
        if (filters.search) {
          // First query: Title matches (higher priority)
          let titleQuery = client
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
            `)
            .ilike('title', `%${filters.search}%`);

          // Second query: Description matches (lower priority)
          let descQuery = client
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
            `)
            .ilike('description', `%${filters.search}%`)
            .not('title', 'ilike', `%${filters.search}%`); // Exclude title matches to avoid duplicates

          // Apply common filters to both queries
          if (filters.status) {
            titleQuery = titleQuery.eq('status', filters.status);
            descQuery = descQuery.eq('status', filters.status);
          }
          
          if (filters.owner_id) {
            titleQuery = titleQuery.eq('owner_id', filters.owner_id);
            descQuery = descQuery.eq('owner_id', filters.owner_id);
          }
          
          if (filters.category_id !== undefined && filters.category_id !== null && filters.category_id !== '') {
            // Check if this is a parent category (get all subcategory IDs)
            const { data: subcategories } = await client
              .from('Categories')
              .select('id')
              .eq('parent_id', filters.category_id);
            
            if (subcategories && subcategories.length > 0) {
              // If parent category has subcategories, include both parent and subcategories
              const categoryIds = [filters.category_id, ...subcategories.map(sub => sub.id)];
              titleQuery = titleQuery.in('category_id', categoryIds);
              descQuery = descQuery.in('category_id', categoryIds);
            } else {
              // If no subcategories, just filter by the specific category
              titleQuery = titleQuery.eq('category_id', filters.category_id);
              descQuery = descQuery.eq('category_id', filters.category_id);
            }
          }

          // Apply sorting to both queries - but we'll re-sort after merging
          if (filters.sort_by && filters.sort_order) {
            // Validate sort_by to prevent SQL injection and invalid column errors
            const validSortColumns = ['created_at', 'updated_at', 'price', 'title', 'delivery_days'];
            const sortColumn = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            titleQuery = titleQuery.order(sortColumn, { ascending: filters.sort_order === 'asc' });
            descQuery = descQuery.order(sortColumn, { ascending: filters.sort_order === 'asc' });
          } else {
            titleQuery = titleQuery.order('created_at', { ascending: false });
            descQuery = descQuery.order('created_at', { ascending: false });
          }

          // Execute both queries
          const [titleResult, descResult] = await Promise.all([
            titleQuery,
            descQuery
          ]);

          if (titleResult.error) {
            console.error('Title search query error:', titleResult.error);
            throw titleResult.error;
          }
          if (descResult.error) {
            console.error('Description search query error:', descResult.error);
            throw descResult.error;
          }

          // Merge results with title matches first, removing duplicates
          const titleData = titleResult.data || [];
          const descData = descResult.data || [];
          const titleIds = new Set(titleData.map(gig => gig.id));
          const uniqueDescData = descData.filter(gig => !titleIds.has(gig.id));
          const mergedData = [...titleData, ...uniqueDescData];
          
          // Sort the merged results properly
          if (filters.sort_by && filters.sort_order && filters.sort_by !== 'relevance') {
            const validSortColumns = ['created_at', 'updated_at', 'price', 'title', 'delivery_days'];
            const sortColumn = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            const isAscending = filters.sort_order === 'asc';
            
            mergedData.sort((a, b) => {
              let aValue = a[sortColumn];
              let bValue = b[sortColumn];
              
              // Handle different data types
              if (sortColumn === 'price' || sortColumn === 'delivery_days') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
              } else if (sortColumn === 'created_at' || sortColumn === 'updated_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
              } else if (sortColumn === 'title') {
                aValue = (aValue || '').toLowerCase();
                bValue = (bValue || '').toLowerCase();
              }
              
              if (aValue < bValue) return isAscending ? -1 : 1;
              if (aValue > bValue) return isAscending ? 1 : -1;
              return 0;
            });
          }
          // If sort_by is 'relevance' or not specified, keep the merged order (title matches first, then description matches)
          
          // Apply pagination to sorted merged results
          let finalData = mergedData;
          if (filters.limit) {
            const from = ((filters.page || 1) - 1) * filters.limit;
            const to = from + filters.limit;
            finalData = mergedData.slice(from, to);
          }

          return { data: finalData, error: null };
        }

        // Regular query without search
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
        
        if (filters.category_id !== undefined && filters.category_id !== null && filters.category_id !== '') {
          // Check if this is a parent category (get all subcategory IDs)
          const { data: subcategories } = await client
            .from('Categories')
            .select('id')
            .eq('parent_id', filters.category_id);
          
          if (subcategories && subcategories.length > 0) {
            // If parent category has subcategories, include both parent and subcategories
            const categoryIds = [filters.category_id, ...subcategories.map(sub => sub.id)];
            query = query.in('category_id', categoryIds);
          } else {
            // If no subcategories, just filter by the specific category
            query = query.eq('category_id', filters.category_id);
          }
        }

        // Apply sorting
        if (filters.sort_by && filters.sort_order) {
          // For non-search queries, 'relevance' should fall back to newest first
          if (filters.sort_by === 'relevance') {
            query = query.order('created_at', { ascending: false });
          } else {
            // Validate sort_by to prevent SQL injection and invalid column errors
            const validSortColumns = ['created_at', 'updated_at', 'price', 'title', 'delivery_days'];
            const sortColumn = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            query = query.order(sortColumn, { ascending: filters.sort_order === 'asc' });
          }
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
        // If search is provided, count both title and description matches
        if (filters.search) {
          // Count title matches
          let titleCountQuery = client
            .from('Gigs')
            .select('*', { count: 'exact', head: true })
            .ilike('title', `%${filters.search}%`);

          // Count description matches (excluding title matches to avoid duplicates)
          let descCountQuery = client
            .from('Gigs')
            .select('*', { count: 'exact', head: true })
            .ilike('description', `%${filters.search}%`)
            .not('title', 'ilike', `%${filters.search}%`);

          // Apply common filters to both queries
          if (filters.status) {
            titleCountQuery = titleCountQuery.eq('status', filters.status);
            descCountQuery = descCountQuery.eq('status', filters.status);
          }
          
          if (filters.owner_id) {
            titleCountQuery = titleCountQuery.eq('owner_id', filters.owner_id);
            descCountQuery = descCountQuery.eq('owner_id', filters.owner_id);
          }
          
          if (filters.category_id !== undefined && filters.category_id !== null && filters.category_id !== '') {
            // Check if this is a parent category (get all subcategory IDs)
            const { data: subcategories } = await client
              .from('Categories')
              .select('id')
              .eq('parent_id', filters.category_id);
            
            if (subcategories && subcategories.length > 0) {
              // If parent category has subcategories, include both parent and subcategories
              const categoryIds = [filters.category_id, ...subcategories.map(sub => sub.id)];
              titleCountQuery = titleCountQuery.in('category_id', categoryIds);
              descCountQuery = descCountQuery.in('category_id', categoryIds);
            } else {
              // If no subcategories, just filter by the specific category
              titleCountQuery = titleCountQuery.eq('category_id', filters.category_id);
              descCountQuery = descCountQuery.eq('category_id', filters.category_id);
            }
          }

          // Execute both count queries
          const [titleCountResult, descCountResult] = await Promise.all([
            titleCountQuery,
            descCountQuery
          ]);

          if (titleCountResult.error) {
            throw titleCountResult.error;
          }
          if (descCountResult.error) {
            throw descCountResult.error;
          }

          // Return combined count
          const totalCount = (titleCountResult.count || 0) + (descCountResult.count || 0);
          return { count: totalCount, error: null };
        }

        // Regular count query without search
        let query = client
          .from('Gigs')
          .select('*', { count: 'exact', head: true });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        
        if (filters.category_id !== undefined && filters.category_id !== null && filters.category_id !== '') {
          // Check if this is a parent category (get all subcategory IDs)
          const { data: subcategories } = await client
            .from('Categories')
            .select('id')
            .eq('parent_id', filters.category_id);
          
          if (subcategories && subcategories.length > 0) {
            // If parent category has subcategories, include both parent and subcategories
            const categoryIds = [filters.category_id, ...subcategories.map(sub => sub.id)];
            query = query.in('category_id', categoryIds);
          } else {
            // If no subcategories, just filter by the specific category
            query = query.eq('category_id', filters.category_id);
          }
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
