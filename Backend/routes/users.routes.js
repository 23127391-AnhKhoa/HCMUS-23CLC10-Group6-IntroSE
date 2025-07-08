// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Route để user trở thành seller
router.post('/become-seller', authenticateToken, userController.becomeSeller);

// Route để seller chuyển về buyer
router.post('/switch-to-buying', authenticateToken, userController.switchToBuying);

// Route để reactivate seller cho user đã từng là seller
router.post('/reactivate-seller', authenticateToken, userController.reactivateSeller);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// GET /api/users/username/:username - Get user by username
router.get('/username/:username', userController.getUserByUsername);

module.exports = router;