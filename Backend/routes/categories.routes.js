const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory } = require('../controllers/category.controller');

// Public routes - no authentication needed for search and filtering
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes - keep authentication only for creating categories
// router.post('/', authenticateToken, createCategory);

module.exports = router;