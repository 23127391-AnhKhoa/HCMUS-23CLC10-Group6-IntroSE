// Xử lý các API liên quan đến Gig
const router = require('express').Router();
const gigController = require('../controllers/gig.controller');
const gigMediaRoutes = require('./gigMedia.routes');
const { authenticateToken } = require('../middleware/auth.middleware');

// Optional auth middleware - không bắt buộc nhưng sẽ extract user info nếu có token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
        next();
      });
    } catch (error) {
      next(); // Không block request nếu token invalid
    }
  } else {
    next();
  }
};

// Include gigMedia routes
router.use('/', gigMediaRoutes);

// GET /api/gigs/health - Health check endpoint
router.get('/health', gigController.healthCheck);

// GET /api/gigs - Get all gigs with pagination and filtering
router.get('/', gigController.getAllGigs);

// GET /api/gigs/:id - Get a single gig by ID
router.get('/:id', gigController.getGigById);

// POST /api/gigs - Create a new gig (with optional authentication)
router.post('/', optionalAuth, gigController.createGig);

// PUT /api/gigs/:id - Update a gig (require authentication)
router.put('/:id', authenticateToken, gigController.updateGig);

// DELETE /api/gigs/:id - Delete a gig (require authentication)
router.delete('/:id', authenticateToken, gigController.deleteGig);

module.exports = router;