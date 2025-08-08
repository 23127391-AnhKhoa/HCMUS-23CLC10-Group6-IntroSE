// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/admin/stats -> Lấy tất cả dữ liệu thống kê cho admin
router.get('/stats', adminController.getAdminStats);

// POST /api/admin/log -> Thêm log vào AdminLog table
router.post('/log', authenticateToken, adminController.createAdminLog);
// Tạo một sub-router cho reports để có cấu trúc /admin/reports/...
const reportsRouter = express.Router();
reportsRouter.get('/gigs', adminController.getGigReports);
reportsRouter.get('/users', adminController.getUserReports);
reportsRouter.patch('/logs/:id', adminController.dismissReport);
// Gắn sub-router vào router chính
router.use('/reports', reportsRouter);

module.exports = router;
