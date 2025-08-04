// routes/pageVisit.routes.js
const express = require('express');
const router = express.Router();
const pageVisitController = require('../controllers/pageVisit.controller');

// POST /api/visits/log -> Ghi nhận một lượt truy cập
router.post('/log', pageVisitController.createVisitLog);

module.exports = router;