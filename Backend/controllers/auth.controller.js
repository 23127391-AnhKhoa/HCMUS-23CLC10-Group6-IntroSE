// controllers/auth.controller.js
const AuthService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const result = await AuthService.handleRegister(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await AuthService.handleVerifyOTP(email, otp);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.handleLogin(email, password);
    // Frontend sẽ dựa vào result.user.role để quyết định chuyển hướng
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { register, verifyOTP, login };