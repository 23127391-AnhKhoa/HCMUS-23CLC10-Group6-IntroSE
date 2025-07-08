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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const createGig = async (req, res) => {
  try {
    // TODO: Add authentication middleware to get user info
    // const ownerId = req.user.uuid; // From auth middleware
    
    const gigData = {
      ...req.body,
      // owner_id: ownerId // Will be added when auth middleware is implemented
    };

    const newGig = await GigService.createGig(gigData);
    
    res.status(201).json({
      status: 'success',
      data: newGig
    });
  } catch (error) {
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

module.exports = {
  healthCheck,
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig
};