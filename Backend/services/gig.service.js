// services/gig.service.js
const Gig = require('../models/gig.model');
const supabase = require('../config/supabaseClient');

const GigService = {
  // Health check for the service
  healthCheck: async () => {
    try {
      const startTime = Date.now();
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('Gigs')
        .select('id')
        .limit(1);
      
      const connectionTime = Date.now() - startTime;
      
      if (testError) {
        console.error('Gig Service health check failed:', testError);
        throw testError;
      }
      
      // Test count query
      const countStartTime = Date.now();
      const count = await Gig.getCount({ status: 'active' });
      const countTime = Date.now() - countStartTime;
      
      return {
        status: 'healthy',
        connectionTime: connectionTime,
        countTime: countTime,
        totalGigs: count,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Gig Service health check error:', error);
      throw error;
    }
  },

  // Get all gigs with pagination and filtering
  getAllGigs: async (options) => {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
      filter_by_category_id,
      filter_by_owner_id,
      filter_by_status = 'active',
      search
    } = options;

    try {
      // Prepare filters
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order,
        status: filter_by_status
      };

      if (filter_by_category_id) {
        filters.category_id = parseInt(filter_by_category_id);
      }

      if (filter_by_owner_id) {
        filters.owner_id = filter_by_owner_id;
      }

      if (search) {
        filters.search = search;
      }

      // Get gigs with details
      const gigs = await Gig.findWithDetails(filters);
      
      // Get total count
      const total = await Gig.getCount(filters);

      // Flatten the nested data for easier frontend consumption
      const flattenedGigs = gigs.map(gig => ({
        id: gig.id,
        owner_id: gig.owner_id,
        status: gig.status,
        title: gig.title,
        cover_image: gig.cover_image,
        description: gig.description,
        price: gig.price,
        delivery_days: gig.delivery_days,
        num_of_edits: gig.num_of_edits,
        created_at: gig.created_at,
        updated_at: gig.updated_at,
        category_id: gig.category_id,
        // Owner information
        owner_username: gig.User?.username,
        owner_fullname: gig.User?.fullname,
        owner_avatar: gig.User?.avt_url || 'https://placehold.co/300x300', // Use actual avt_url with fallback
        // Category information
        category_name: gig.Categories?.name,
        category_description: gig.Categories?.description
      }));

      return {
        gigs: flattenedGigs,
        total: total || 0
      };
    } catch (error) {
      console.error('Error in getAllGigs:', error);
      throw new Error(`Error fetching gigs: ${error.message}`);
    }
  },

  // Get a single gig by ID with retry logic
  getGigById: async (gigId) => {
    try {
      // Enhanced query with related data using retry logic
      const queryFunction = async (client) => {
        const result = await client
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
          .eq('id', gigId)
          .single();
        if (result.error && result.error.code !== 'PGRST116') {
          throw result.error;
        }
        
        return result;
      };

      // Execute query with retry logic
      let result;
      try {
        result = await queryFunction(supabase);
        
        // If we get null/empty result, try with fresh connection
        if (!result.data) {
          const { refreshConnection } = require('../config/supabaseClient');
          const freshClient = refreshConnection();
          result = await queryFunction(freshClient);
        }
        
      } catch (error) {
        console.error('Error in getGigById query, retrying with fresh connection:', error);
        // Retry with fresh connection
        const { refreshConnection } = require('../config/supabaseClient');
        const freshClient = refreshConnection();
        result = await queryFunction(freshClient);
      }

      const gigWithDetails = result.data;
      if (!gigWithDetails) {
        return null;
      }

      // Flatten the data
      const flattenedGig = {
        id: gigWithDetails.id,
        owner_id: gigWithDetails.owner_id,
        status: gigWithDetails.status,
        title: gigWithDetails.title,
        cover_image: gigWithDetails.cover_image,
        description: gigWithDetails.description,
        price: gigWithDetails.price,
        delivery_days: gigWithDetails.delivery_days,
        num_of_edits: gigWithDetails.num_of_edits,
        created_at: gigWithDetails.created_at,
        updated_at: gigWithDetails.updated_at,
        category_id: gigWithDetails.category_id,
        // Owner information
        owner_username: gigWithDetails.User?.username,
        owner_fullname: gigWithDetails.User?.fullname,
        owner_avatar: gigWithDetails.User?.avt_url || 'https://placehold.co/300x300',
        // Category information
        category_name: gigWithDetails.Categories?.name,
        category_description: gigWithDetails.Categories?.description
      };

      return flattenedGig;
    } catch (error) {
      console.error('Error in getGigById:', error);
      throw new Error(`Error fetching gig: ${error.message}`);
    }
  },

  // Create a new gig
  createGig: async (gigData) => {
    try {
      // Validate required fields based on schema
      const requiredFields = ['title', 'cover_image', 'description', 'price', 'delivery_days', 'category_id'];
      const missingFields = requiredFields.filter(field => !gigData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Set default values
      const gigToCreate = {
        owner_id: gigData.owner_id, // Should come from auth middleware
        status: gigData.status || 'active',
        title: gigData.title,
        cover_image: gigData.cover_image,
        description: gigData.description,
        price: parseFloat(gigData.price),
        delivery_days: parseInt(gigData.delivery_days),
        num_of_edits: gigData.num_of_edits ? parseInt(gigData.num_of_edits) : null,
        category_id: parseInt(gigData.category_id),
        created_at: new Date(),
        updated_at: null
      };

      const newGig = await Gig.create(gigToCreate);
      return newGig;
    } catch (error) {
      throw new Error(`Error creating gig: ${error.message}`);
    }
  },

  // Update an existing gig
  updateGig: async (gigId, updateData) => {
    try {
      // Prepare update data with proper type conversion
      const updateFields = {};

      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.cover_image) updateFields.cover_image = updateData.cover_image;
      if (updateData.description) updateFields.description = updateData.description;
      if (updateData.price) updateFields.price = parseFloat(updateData.price);
      if (updateData.delivery_days) updateFields.delivery_days = parseInt(updateData.delivery_days);
      if (updateData.num_of_edits !== undefined) updateFields.num_of_edits = updateData.num_of_edits ? parseInt(updateData.num_of_edits) : null;
      if (updateData.category_id) updateFields.category_id = parseInt(updateData.category_id);
      if (updateData.status) updateFields.status = updateData.status;

      const updatedGig = await Gig.updateById(gigId, updateFields);
      return updatedGig;
    } catch (error) {
      throw new Error(`Error updating gig: ${error.message}`);
    }
  },

  // Delete a gig
  deleteGig: async (gigId) => {
    try {
      const deleted = await Gig.deleteById(gigId);
      return deleted;
    } catch (error) {
      throw new Error(`Error deleting gig: ${error.message}`);
    }
  },

  // Get gigs by owner ID
  getGigsByOwnerId: async (ownerId) => {
    try {
      const gigs = await Gig.findByOwnerId(ownerId);
      return gigs;
    } catch (error) {
      throw new Error(`Error fetching owner gigs: ${error.message}`);
    }
  }
};

module.exports = GigService;
