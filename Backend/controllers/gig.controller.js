// controllers/gig.controller.js
const GigService = require('../services/gig.service');

const healthCheck = async (req, res) => {
  try {
    const health = await GigService.healthCheck();
    
    res.status(200).json({
      status: 'success',
      message: 'Gig API is healthy',
      data: health
    });
  } catch (error) {
    console.error('Gig Controller health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
};

const getAllGigs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
      filter_by_category_id,
      filter_by_owner_id,
      filter_by_status,
      search
    } = req.query;

    const result = await GigService.getAllGigs({
      page: parseInt(page),
      limit: parseInt(limit),
      sort_by,
      sort_order,
      filter_by_category_id,
      filter_by_owner_id,
      filter_by_status,
      search
    });

    res.status(200).json({
      status: 'success',
      data: result.gigs,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllGigs:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

const getGigById = async (req, res) => {
  try {
    const { id } = req.params;
    const gig = await GigService.getGigById(id);
    
    if (!gig) {
      return res.status(404).json({
        status: 'error',
        message: 'Gig not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: gig
    });
  } catch (error) {
    console.error('Error in getGigById controller:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const createGig = async (req, res) => {
  try {
    // Validation dữ liệu đầu vào
    const { title, cover_image, description, price, delivery_days, category_id, response_time_hours } = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!title || !cover_image || !description || !price || !delivery_days || !category_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, cover_image, description, price, delivery_days, category_id'
      });
    }
    
    // Validation giá trị
    if (price < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be at least $1'
      });
    }
    
    if (delivery_days < 1 || delivery_days > 365) {
      return res.status(400).json({
        status: 'error',
        message: 'Delivery days must be between 1 and 365'
      });
    }

    // Validate response_time_hours if provided
    if (response_time_hours && (response_time_hours < 1 || response_time_hours > 168)) {
      return res.status(400).json({
        status: 'error',
        message: 'Response time must be between 1 hour and 1 week (168 hours)'
      });
    }
    
    // Lấy owner_id từ auth middleware nếu có, hoặc từ body (tạm thời)
    let ownerId = req.user?.uuid || req.body.owner_id;
    
    // Tạm thời sử dụng một UUID có sẵn trong database hoặc tạo user test
    if (!ownerId || ownerId === 'test-user-123') {
      // Kiểm tra có user nào trong database không
      const supabase = require('../config/supabaseClient');
      const { data: users, error: userError } = await supabase
        .from('User')
        .select('uuid')
        .limit(1);
      
      if (!userError && users && users.length > 0) {
        ownerId = users[0].uuid;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'No valid user found in database. Please create a user first or provide valid owner_id.'
        });
      }
    }

    const gigData = {
      ...req.body,
      owner_id: ownerId,
      response_time_hours: response_time_hours || 24 // Default to 24 hours
    };

    const newGig = await GigService.createGig(gigData);
    
    res.status(201).json({
      status: 'success',
      message: 'Gig created successfully',
      data: newGig
    });
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Add authentication and ownership check
    // const ownerId = req.user.uuid;
    
    const updatedGig = await GigService.updateGig(id, req.body);
    
    if (!updatedGig) {
      return res.status(404).json({
        status: 'error',
        message: 'Gig not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedGig
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Add authentication and ownership check
    // const ownerId = req.user.uuid;
    
    const deleted = await GigService.deleteGig(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Gig not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// THÊM MỚI: Controller method cho recommendations
const getRecommendedGigs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const result = await GigService.getRecommendedGigs({
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
      message: `Retrieved ${result.length} recommended gigs`
    });
  } catch (error) {
    console.error('Get recommended gigs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recommended gigs',
      error: error.message
    });
  }
};

// NEW: Get seller gigs with statistics
const getSellerGigsWithStats = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    console.log('📊 [Gig Controller] getSellerGigsWithStats called for seller:', sellerId);

    const gigsWithStats = await GigService.getSellerGigsWithStats(sellerId);

    res.status(200).json({
      status: 'success',
      data: gigsWithStats
    });
  } catch (error) {
    console.error('Get seller gigs with stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get seller gigs with statistics',
      error: error.message
    });
  }
};
const getPublicStats = async (req, res) => {
    try {
        const stats = await GigService.fetchPublicStats();
        res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
module.exports = {
  healthCheck,
  getAllGigs,
  getRecommendedGigs,  // THÊM MỚI
  getSellerGigsWithStats, // NEW
  getPublicStats,
  getGigById,
  createGig,
  updateGig,
  deleteGig
};