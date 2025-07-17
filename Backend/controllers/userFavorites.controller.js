// controllers/userFavorites.controller.js
const User = require('../models/user.model'); // model

class UserFavoritesController {
    // Thêm favorite
    static async addFavorite(req, res) {
        try {
            const { gig_id } = req.body;
            const userId = req.user.uuid; // Từ auth middleware

            if (!gig_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Gig ID is required'
                });
            }

            const result = await User.addFavorite(userId, gig_id);

            res.status(201).json({
                status: 'success',
                message: 'Added to favorites successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in addFavorite controller:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to add to favorites'
            });
        }
    }

    // Xóa favorite
    static async removeFavorite(req, res) {
        try {
            const { gig_id } = req.body;
            const userId = req.user.uuid;

            if (!gig_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Gig ID is required'
                });
            }

            await User.removeFavorite(userId, gig_id);

            res.status(200).json({
                status: 'success',
                message: 'Removed from favorites successfully'
            });
        } catch (error) {
            console.error('Error in removeFavorite controller:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to remove from favorites'
            });
        }
    }

    // Lấy favorites của user
    static async getUserFavorites(req, res) {
        try {
            const { userId } = req.params;
            const requestUserId = req.user.uuid;

            // Chỉ cho phép user xem favorites của chính mình
            if (userId !== requestUserId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You can only view your own favorites'
                });
            }

            const favorites = await User.getUserFavorites(userId);
            res.status(200).json({
                status: 'success',
                message: 'Favorites retrieved successfully',
                data: favorites
            });
        } catch (error) {
            console.error('Error in getUserFavorites controller:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get favorites'
            });
        }
    }

    // Toggle favorite
    static async toggleFavorite(req, res) {
        try {
            const { gig_id } = req.body;
            const userId = req.user.uuid;

            if (!gig_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Gig ID is required'
                });
            }

            const result = await User.toggleFavorite(userId, gig_id);

            res.status(200).json({
                status: 'success',
                message: `Favorite ${result.action} successfully`,
                data: result
            });
        } catch (error) {
            console.error('Error in toggleFavorite controller:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to toggle favorite'
            });
        }
    }

    // Kiểm tra favorite status
    static async checkFavorite(req, res) {
        try {
            const { userId, gigId } = req.params;
            const requestUserId = req.user.uuid;

            // Chỉ cho phép user kiểm tra favorites của chính mình
            if (userId !== requestUserId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You can only check your own favorites'
                });
            }

            const result = await User.isFavorited(userId, gigId);

            res.status(200).json({
                status: 'success',
                data: { isFavorited: result }
            });
        } catch (error) {
            console.error('Error in checkFavorite controller:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to check favorite status'
            });
        }
    }
}

module.exports = UserFavoritesController;
