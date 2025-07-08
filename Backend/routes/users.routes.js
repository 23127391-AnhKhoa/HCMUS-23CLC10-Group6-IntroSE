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

module.exports = router;