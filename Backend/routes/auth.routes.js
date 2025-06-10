// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Định nghĩa route cho việc đăng nhập
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;