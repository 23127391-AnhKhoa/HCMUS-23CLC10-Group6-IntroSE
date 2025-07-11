const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware'); // Sử dụng middleware xác thực token

// ========== Admin endpoints ==========

// GET /api/users -> Lấy tất cả user (có thể tìm kiếm)
router.get('/', /* authenticateToken, isAdmin, */ userController.getAllUsers); // Thêm middleware nếu cần

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

// ========== Fetch user info endpoints ==========

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', userController.getUserById);

// GET /api/users/username/:username - Lấy user theo username
router.get('/username/:username', userController.getUserByUsername);

module.exports = router;
