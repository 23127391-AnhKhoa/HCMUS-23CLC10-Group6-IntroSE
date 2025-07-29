// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// GET /api/reports/gigs -> Lấy dữ liệu các gig bị báo cáo
router.get('/gigs', reportsController.getGigReports);
router.patch('/logs/:id', reportsController.dismissReport);
module.exports = router;