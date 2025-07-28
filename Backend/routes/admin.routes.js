// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/admin/stats -> Lấy tất cả dữ liệu thống kê cho admin
router.get('/stats', adminController.getAdminStats);

// POST /api/admin/log -> Thêm log vào AdminLog table
router.post('/log', authenticateToken, adminController.createAdminLog);

module.exports = router;
