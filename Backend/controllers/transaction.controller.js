// controllers/transaction.controller.js
const User = require('../models/user.model');
const Transaction = require('../models/transactions.model');
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

      // ✅ Ghi vào bảng Transactions
      const { error: insertError } = await Transaction.create({
        user_id: userUuid,
        amount: parseFloat(amount),
        description: 'Deposit to account',
        type: 'deposit',
      });

      if (insertError) throw insertError;

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

      // ✅ Ghi vào bảng Transactions
      const { error: insertError } = await Transaction.create({
        user_id: userUuid,
        amount: parseFloat(amount),
        description: 'Withdraw from account',
        type: 'withdraw',
      });

      if (insertError) throw insertError;


      if (insertError) throw insertError;

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
  },

  // API để lấy lịch sử giao dịch theo user ID
  getTransactionHistory: async (req, res) => {
    try {
      const userUuid = req.user.uuid;
      const { page = 1, limit = 20, type = 'all' } = req.query;

      // Validation
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          message: 'Invalid pagination parameters'
        });
      }

      // Build filter
      let typeFilter = {};
      if (type !== 'all') {
        if (!['deposit', 'withdraw'].includes(type)) {
          return res.status(400).json({
            message: 'Type must be "deposit", "withdraw", or "all"'
          });
        }
        typeFilter.type = type;
      }

      // Get transaction history with pagination
      const { data: transactions, error } = await Transaction.getByUserId(
        userUuid, 
        { 
          ...typeFilter,
          page: pageNum,
          limit: limitNum
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Get total count for pagination
      const { data: totalCount, error: countError } = await Transaction.getTotalCount(
        userUuid, 
        typeFilter
      );

      if (countError) {
        throw new Error(countError.message);
      }

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        message: 'Transaction history retrieved successfully',
        data: {
          transactions: transactions || [],
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = TransactionController;