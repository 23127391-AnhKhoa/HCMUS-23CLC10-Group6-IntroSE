const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const UserFavoritesController = require('../controllers/userFavorites.controller');
const EarningsController = require('../controllers/earnings.controller');
const { authenticateToken } = require('../middleware/auth.middleware'); // Sử dụng middleware xác thực token

// ========== Admin endpoints ==========

// GET /api/users -> Lấy tất cả user (có thể tìm kiếm)
router.get('/', /* authenticateToken, isAdmin, */ userController.getAllUsers); // Thêm middleware nếu cần
router.get('/stats', userController.getPublicStats);
// PATCH /api/users/:uuid -> Cập nhật thông tin user
router.patch('/:uuid', /* authenticateToken, isAdmin, */ userController.updateUser);

// DELETE /api/users/:uuid -> Xóa một user
router.delete('/:uuid', /* authenticateToken, isAdmin, */ userController.deleteUser);

// ========== User & Seller endpoints ==========

// Route để search users
router.get('/search', authenticateToken, userController.searchUsers);

// Route để user trở thành seller
router.post('/become-seller', authenticateToken, userController.becomeSeller);

// Route để seller chuyển về buyer
router.post('/switch-to-buying', authenticateToken, userController.switchToBuying);

// Route để reactivate seller cho user đã từng là seller
router.post('/reactivate-seller', authenticateToken, userController.reactivateSeller);

// ========== User Profile endpoints ==========

// GET /api/users/profile - Lấy thông tin profile của user hiện tại
router.get('/profile', authenticateToken, userController.getProfile);

// PUT /api/users/profile - Cập nhật profile của user hiện tại
router.put('/profile', authenticateToken, userController.updateProfile);

// ========== Earnings endpoints ==========

/**
 * @route GET /api/users/:sellerId/earnings/stats
 * @desc Get seller earnings statistics
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {string} [period] - Time period (thisMonth, lastMonth, thisYear, allTime)
 */
router.get('/:sellerId/earnings/stats', authenticateToken, EarningsController.getSellerEarningsStats);

/**
 * @route GET /api/users/:sellerId/earnings/recent-orders
 * @desc Get recent orders for earnings page
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {number} [limit=10] - Number of recent orders to fetch
 */
router.get('/:sellerId/earnings/recent-orders', authenticateToken, EarningsController.getSellerRecentOrders);

/**
 * @route GET /api/users/:sellerId/earnings/monthly
 * @desc Get monthly earnings breakdown for charts
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {number} [months=12] - Number of months to include
 */
router.get('/:sellerId/earnings/monthly', authenticateToken, EarningsController.getMonthlyEarnings);

// ========== Fetch user info endpoints ==========

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', userController.getUserById);

// GET /api/users/username/:username - Lấy user theo username
router.get('/username/:username', userController.getUserByUsername);

// =========== User Favorites endpoints ==========
// POST /api/favorites/add - Thêm vào favorites
router.post('/favorite/add', authenticateToken, UserFavoritesController.addFavorite);

// DELETE /api/favorites/remove - Xóa khỏi favorites
router.delete('/favorite/remove', authenticateToken, UserFavoritesController.removeFavorite);

// POST /api/favorites/toggle - Toggle favorite status
router.post('/favorite/toggle', authenticateToken, UserFavoritesController.toggleFavorite);

// GET /api/favorites/:userId - Lấy favorites của user
router.get('/favorite/:userId', authenticateToken, UserFavoritesController.getUserFavorites);

// GET /api/favorites/check/:userId/:gigId - Kiểm tra favorite status
router.get('/favorite/check/:userId/:gigId', authenticateToken, UserFavoritesController.checkFavorite);

module.exports = router;
