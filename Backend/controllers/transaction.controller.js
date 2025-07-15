// controllers/transaction.controller.js
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const jwt = require('jsonwebtoken');

/**
 * JWT Token Generation Best Practices:
 * 
 * SHOULD generate new JWT token when:
 * - User role changes (buyer <-> seller)
 * - Critical user permissions change
 * - User email changes
 * - User account status changes
 * 
 * SHOULD NOT generate new JWT token when:
 * - Only balance changes (deposit/withdraw)
 * - Profile info changes (fullname, avatar, etc.)
 * - Non-critical data updates
 * 
 * Reasons to avoid unnecessary token generation:
 * 1. Performance: JWT signing/verification is CPU intensive
 * 2. Security: Tokens should have reasonable lifespan
 * 3. Frontend complexity: Handling token updates on every API call
 * 4. Network overhead: Sending tokens in every response
 */

const TransactionController = {
  // API để nạp tiền vào tài khoản user
  deposit: async (req, res) => {
    try {
      const { amount } = req.body;
      const userUuid = req.user.uuid;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: 'Amount must be greater than 0'
        });
      }

      // Kiểm tra amount có trong các gói cho phép không (5, 10, 20)
      const allowedAmounts = [5, 10, 20];
      if (!allowedAmounts.includes(Number(amount))) {
        return res.status(400).json({
          message: 'Invalid amount. Only $5, $10, and $20 packages are allowed.'
        });
      }

      // Lấy thông tin user hiện tại
      const currentUser = await User.findById(userUuid);
      if (!currentUser) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Tính toán balance mới
      const currentBalance = parseFloat(currentUser.balance) || 0;
      const newBalance = currentBalance + parseFloat(amount);

      // Cập nhật balance
      const updateData = {
        balance: newBalance
      };

      const updatedUser = await User.updateByUuid(userUuid, updateData);

      // Không cần tạo token mới cho deposit, chỉ trả về user data mới
      const updatedUserData = {
        uuid: updatedUser.uuid,
        email: updatedUser.email || req.user.email,
        role: updatedUser.role,
        is_seller: updatedUser.role === 'seller',
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        balance: updatedUser.balance,
        avatar_url: updatedUser.avt_url,
        seller_headline: updatedUser.seller_headline,
        seller_description: updatedUser.seller_description,
        seller_since: updatedUser.seller_since
      };

      res.json({
        message: `Successfully deposited $${amount}`,
        user: updatedUserData,
        // Không trả về token mới, frontend sẽ chỉ update user data
        transaction: {
          amount: parseFloat(amount),
          previousBalance: currentBalance,
          newBalance: newBalance,
          type: 'deposit',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in deposit:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // API để rút tiền (withdraw) - có thể thêm sau
  withdraw: async (req, res) => {
    try {
      const { amount } = req.body;
      const userUuid = req.user.uuid;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: 'Amount must be greater than 0'
        });
      }

      // Lấy thông tin user hiện tại
      const currentUser = await User.findById(userUuid);
      if (!currentUser) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const currentBalance = parseFloat(currentUser.balance) || 0;

      // Kiểm tra đủ tiền để rút không
      if (currentBalance < amount) {
        return res.status(400).json({
          message: 'Insufficient balance'
        });
      }

      const newBalance = currentBalance - parseFloat(amount);

      // Cập nhật balance
      const updateData = {
        balance: newBalance
      };

      const updatedUser = await User.updateByUuid(userUuid, updateData);

      // Không cần tạo token mới cho withdraw, chỉ trả về user data mới
      const updatedUserData = {
        uuid: updatedUser.uuid,
        email: updatedUser.email || req.user.email,
        role: updatedUser.role,
        is_seller: updatedUser.role === 'seller',
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        balance: updatedUser.balance,
        avatar_url: updatedUser.avt_url,
        seller_headline: updatedUser.seller_headline,
        seller_description: updatedUser.seller_description,
        seller_since: updatedUser.seller_since
      };

      res.json({
        message: `Successfully withdrew $${amount}`,
        user: updatedUserData,
        // Không trả về token mới, frontend sẽ chỉ update user data
        transaction: {
          amount: parseFloat(amount),
          previousBalance: currentBalance,
          newBalance: newBalance,
          type: 'withdraw',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in withdraw:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = TransactionController;