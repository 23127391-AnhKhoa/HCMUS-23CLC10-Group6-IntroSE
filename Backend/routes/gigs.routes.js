// Xử lý các API liên quan đến Gig
const router = require('express').Router();
const gigController = require('../controllers/gig.controller');
const gigMediaRoutes = require('./gigMedia.routes');

// Include gigMedia routes
router.use('/', gigMediaRoutes);

// GET /api/gigs/health - Health check endpoint
router.get('/health', gigController.healthCheck);

// GET /api/gigs - Get all gigs with pagination and filtering
router.get('/', gigController.getAllGigs);

// GET /api/gigs/:id - Get a single gig by ID
router.get('/:id', gigController.getGigById);

// POST /api/gigs - Create a new gig (require authentication)
router.post('/', gigController.createGig);

// PUT /api/gigs/:id - Update a gig (require authentication)
router.put('/:id', gigController.updateGig);

// DELETE /api/gigs/:id - Delete a gig (require authentication)
router.delete('/:id', gigController.deleteGig);

module.exports = router;