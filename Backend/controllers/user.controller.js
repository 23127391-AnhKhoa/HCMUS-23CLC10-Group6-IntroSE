// backend/controllers/user.controller.js
const UserService = require('../services/user.service');

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    
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
};

const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserService.getUserByUsername(username);
    
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
};

module.exports = {
  getUserById,
  getUserByUsername
};
