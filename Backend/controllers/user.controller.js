const UserService = require('../services/user.Service');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

/**
 * User Controller
 * Kết hợp chức năng:
 * - Quản lý user: getAllUsers, updateUser, deleteUser
 * - Quản lý role: becomeSeller, switchToBuying, reactivateSeller
 * - Truy xuất thông tin user theo ID hoặc username
 */

const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const result = await UserService.fetchAllUsers(search);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        const updateData = req.body;

        const result = await UserService.updateUserByUuid(uuid, updateData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        const result = await UserService.deleteUserByUuid(uuid);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const becomeSeller = async (req, res) => {
    try {
        const { seller_headline, seller_description } = req.body;
        const userUuid = req.user.uuid;

        if (!seller_headline || !seller_description) {
            return res.status(400).json({
                message: 'Seller headline and description are required'
            });
        }

        const updateData = {
            role: 'seller',
            seller_headline,
            seller_description,
            seller_since: new Date().toISOString()
        };

        const updatedUser = await User.updateByUuid(userUuid, updateData);

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
            message: 'Successfully became a seller',
            user: newPayload,
            token: newToken
        });
    } catch (error) {
        console.error('Error in becomeSeller:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const switchToBuying = async (req, res) => {
    try {
        const userUuid = req.user.uuid;

        const currentUser = await User.findById(userUuid);
        if (!currentUser || currentUser.role !== 'seller') {
            return res.status(400).json({ message: 'Only sellers can switch to buying' });
        }

        const updatedUser = await User.updateByUuid(userUuid, { role: 'buyer' });

        const newPayload = {
            uuid: updatedUser.uuid,
            email: updatedUser.email || req.user.email,
            role: updatedUser.role,
            is_seller: false,
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
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const reactivateSeller = async (req, res) => {
    try {
        const userUuid = req.user.uuid;

        const currentUser = await User.findById(userUuid);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.seller_since) {
            return res.status(400).json({
                message: 'User has never been a seller. Please use become-seller endpoint instead.'
            });
        }

        const updatedUser = await User.updateByUuid(userUuid, { role: 'seller' });

        const newPayload = {
            uuid: updatedUser.uuid,
            email: updatedUser.email || req.user.email,
            role: updatedUser.role,
            is_seller: true,
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
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Search query must be at least 2 characters' 
            });
        }

        const users = await User.searchUsers(q.trim());
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    becomeSeller,
    switchToBuying,
    reactivateSeller,
    getUserById,
    getUserByUsername,
    searchUsers
};
