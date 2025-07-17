// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// GET /api/admin/stats -> Lấy tất cả dữ liệu thống kê cho admin
router.get('/stats', adminController.getAdminStats);

module.exports = router;
