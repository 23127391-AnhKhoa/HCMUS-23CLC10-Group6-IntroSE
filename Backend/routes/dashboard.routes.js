// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET /api/dashboard/stats -> Lấy tất cả dữ liệu thống kê cho dashboard
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;