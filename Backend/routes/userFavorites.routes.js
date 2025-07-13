// routes/userFavorites.routes.js
const express = require('express');
const router = express.Router();
const UserFavoritesController = require('../controllers/userFavorites.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Tất cả các routes cần authentication (tạm thời comment để test)
// router.use(authMiddleware);

// POST /api/favorites/add - Thêm vào favorites
router.post('/add', authenticateToken, UserFavoritesController.addFavorite);

// DELETE /api/favorites/remove - Xóa khỏi favorites
router.delete('/remove', authenticateToken, UserFavoritesController.removeFavorite);

// POST /api/favorites/toggle - Toggle favorite status
router.post('/toggle', authenticateToken, UserFavoritesController.toggleFavorite);

// GET /api/favorites/user/:userId - Lấy favorites của user
router.get('/user/:userId', authenticateToken, UserFavoritesController.getUserFavorites);

// GET /api/favorites/check/:userId/:gigId - Kiểm tra favorite status
router.get('/check/:userId/:gigId', authenticateToken, UserFavoritesController.checkFavorite);

module.exports = router;
