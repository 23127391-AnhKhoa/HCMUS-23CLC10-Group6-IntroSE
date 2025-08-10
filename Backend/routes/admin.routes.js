// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/admin/stats -> Lấy tất cả dữ liệu thống kê cho admin
router.get('/stats', adminController.getAdminStats);

// GET /api/admin/hero-stats -> Lấy thống kê cho Hero Section
router.get('/hero-stats', adminController.getHeroStats);

// GET /api/admin/stats-section -> Lấy thống kê cho Stats Section
router.get('/stats-section', adminController.getStatsSection);

// GET /api/admin/top-sellers -> Lấy top sellers theo tổng thu nhập
router.get('/top-sellers', adminController.getTopSellersByEarnings);

// GET /api/admin/dashboard-stats -> Lấy dữ liệu dashboard với doanh thu và lợi nhuận
router.get('/dashboard-stats', adminController.getDashboardStats);

// GET /api/admin/earnings -> Lấy thông tin lợi nhuận và balance admin
router.get('/earnings', authenticateToken, adminController.getAdminEarnings);

// GET /api/admin/transaction-history -> Lấy lịch sử withdraw của admin
router.get('/transaction-history', authenticateToken, adminController.getAdminTransactionHistory);

// POST /api/admin/log -> Thêm log vào AdminLog table
router.post('/log', authenticateToken, adminController.createAdminLog);

// POST /api/admin/withdraw -> Admin withdraw website profits
router.post('/withdraw', authenticateToken, adminController.adminWithdraw);

// Tạo một sub-router cho reports để có cấu trúc /admin/reports/...
const reportsRouter = express.Router();
reportsRouter.get('/gigs', adminController.getGigReports);
reportsRouter.get('/users', adminController.getUserReports);
reportsRouter.patch('/logs/:id', adminController.dismissReport);
// Gắn sub-router vào router chính
router.use('/reports', reportsRouter);

module.exports = router;
