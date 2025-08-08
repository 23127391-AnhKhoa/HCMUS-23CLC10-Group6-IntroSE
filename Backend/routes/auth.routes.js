// Xử lý đăng nhập, đăng ký
const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);

router.post('/verify-otp', authController.verifyOTP);

router.post('/resend-otp', authController.resendOTP);

router.post('/login', authController.login);

module.exports = router;