const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

/**
 * User Controller - Role Management
 * 
 * These APIs handle user role changes which REQUIRE new JWT tokens because:
 * - Role information is stored in JWT payload
 * - Role changes affect user permissions and access control
 * - Frontend needs updated token to access role-specific features
 * 
 * APIs that generate new tokens:
 * - becomeSeller: buyer -> seller (role change)
 * - switchToBuying: seller -> buyer (role change) 
 * - reactivateSeller: buyer -> seller (role change)
 */

const UserController = {
  // API để user trở thành seller
  becomeSeller: async (req, res) => {
    try {
      const { seller_headline, seller_description } = req.body;
      const userUuid = req.user.uuid; // Lấy từ middleware auth

      // Validation
      if (!seller_headline || !seller_description) {
        return res.status(400).json({
          message: 'Seller headline and description are required'
        });
      }

      // Cập nhật user thành seller và thêm thông tin seller
      const updateData = {
        role: 'seller',
        seller_headline,
        seller_description,
        seller_since: new Date().toISOString() // Thêm thời gian trở thành seller
      };

      const updatedUser = await User.updateByUuid(userUuid, updateData);

      // Tạo token mới với role đã cập nhật
      const newPayload = {
        uuid: updatedUser.uuid,
        email: updatedUser.email || req.user.email,
        role: updatedUser.role,
        is_seller: updatedUser.role === 'seller', // Tính toán dựa trên role
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        balance: updatedUser.balance || 0,
        avatar_url: updatedUser.avt_url, // Sửa tên field cho đúng với schema
        seller_headline: updatedUser.seller_headline,
        seller_description: updatedUser.seller_description,
        seller_since: updatedUser.seller_since
      };

      const newToken = jwt.sign(
        {
          uuid: newPayload.uuid,
          email: newPayload.email,
          role: newPayload.role,
          is_seller: newPayload.is_seller
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Successfully became a seller',
        user: newPayload,
        token: newToken
      });
    } catch (error) {
      console.error('Error in becomeSeller:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // API để seller chuyển về buyer
  switchToBuying: async (req, res) => {
    try {
      const userUuid = req.user.uuid; // Lấy từ middleware auth

      // Kiểm tra user hiện tại có phải seller không
      const currentUser = await User.findById(userUuid);
      if (!currentUser || currentUser.role !== 'seller') {
        return res.status(400).json({
          message: 'Only sellers can switch to buying'
        });
      }

      // Cập nhật user về buyer
      const updateData = {
        role: 'buyer'
      };

      const updatedUser = await User.updateByUuid(userUuid, updateData);

      // Tạo token mới với role đã cập nhật
      const newPayload = {
        uuid: updatedUser.uuid,
        email: updatedUser.email || req.user.email,
        role: updatedUser.role,
        is_seller: updatedUser.role === 'seller', // Sẽ là false
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        balance: updatedUser.balance || 0,
        avatar_url: updatedUser.avt_url,
        seller_headline: updatedUser.seller_headline,
        seller_description: updatedUser.seller_description,
        seller_since: updatedUser.seller_since
      };

      const newToken = jwt.sign(
        {
          uuid: newPayload.uuid,
          email: newPayload.email,
          role: newPayload.role,
          is_seller: newPayload.is_seller
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Successfully switched to buying',
        user: newPayload,
        token: newToken
      });
    } catch (error) {
      console.error('Error in switchToBuying:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // API để reactivate seller cho user đã từng là seller
  reactivateSeller: async (req, res) => {
    try {
      const userUuid = req.user.uuid;

      // Lấy thông tin user hiện tại
      const currentUser = await User.findById(userUuid);
      
      if (!currentUser) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Kiểm tra user đã từng là seller hay chưa
      if (!currentUser.seller_since) {
        return res.status(400).json({
          message: 'User has never been a seller. Please use become-seller endpoint instead.'
        });
      }

      // Cập nhật role về seller
      const updateData = {
        role: 'seller'
      };

      const updatedUser = await User.updateByUuid(userUuid, updateData);

      // Tạo token mới với role đã cập nhật
      const newPayload = {
        uuid: updatedUser.uuid,
        email: updatedUser.email || req.user.email,
        role: updatedUser.role,
        is_seller: updatedUser.role === 'seller',
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        balance: updatedUser.balance || 0,
        avatar_url: updatedUser.avt_url,
        seller_headline: updatedUser.seller_headline,
        seller_description: updatedUser.seller_description,
        seller_since: updatedUser.seller_since
      };

      const newToken = jwt.sign(
        {
          uuid: newPayload.uuid,
          email: newPayload.email,
          role: newPayload.role,
          is_seller: newPayload.is_seller
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Successfully reactivated seller account',
        user: newPayload,
        token: newToken
      });
    } catch (error) {
      console.error('Error in reactivateSeller:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // API để get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // API để get user by username
  getUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findByUsername(username);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = UserController;
