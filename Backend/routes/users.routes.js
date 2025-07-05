// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// GET /api/users/username/:username - Get user by username
router.get('/username/:username', userController.getUserByUsername);

module.exports = router;