// routes/reviews.routes.js
const router = require('express').Router();
const reviewController = require('../controllers/review.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Middleware xác thực cho tất cả routes
router.use(authenticateToken);

// Routes cho reviews
router.post('/', reviewController.createReview);
router.get('/recent', reviewController.getRecentReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Routes cho seller reviews
router.get('/seller/:sellerId', reviewController.getSellerReviews);
router.get('/seller/:sellerId/stats', reviewController.getSellerRatingStats);

// Routes cho buyer reviews
router.get('/buyer/:buyerId', reviewController.getBuyerReviews);

// Routes cho order reviews
router.get('/order/:orderId/can-review', reviewController.canReviewOrder);

// Routes cho gig reviews
router.get('/gig/:gigId', reviewController.getGigReviews);

module.exports = router;
