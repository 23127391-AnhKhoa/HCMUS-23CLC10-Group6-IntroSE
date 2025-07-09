// backend/routes/transactions.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Route để nạp tiền
router.post('/deposit', authenticateToken, transactionController.deposit);

// Route để rút tiền
router.post('/withdraw', authenticateToken, transactionController.withdraw);

module.exports = router;