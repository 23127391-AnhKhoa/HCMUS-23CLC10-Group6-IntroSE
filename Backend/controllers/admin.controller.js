// controllers/admin.controller.js
const AdminService = require('../services/admin.service');

const getAdminStats = async (req, res) => {
    try {
        const stats = await AdminService.fetchAllAdminData();
        res.status(200).json(stats);
    } catch (error) {
        // Ghi lại lỗi chi tiết ở server
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: error.message });
    }
};

const createAdminLog = async (req, res) => {
    try {
        const { target_id, target_type, action_type, description } = req.body;
        const actor_id = req.user.uuid; // Lấy từ token
        const actor_role = req.user.role; // Lấy từ token

        // Validation
        if (!target_id || !target_type || !action_type || !description) {
            return res.status(400).json({
                message: 'Missing required fields: target_id, target_type, action_type, description'
            });
        }

        // Validate action_type
        const validActionTypes = ['report user', 'report gig', 'report comment', 'approve gig', 'reject gig', 'ban user', 'unban user'];
        if (!validActionTypes.includes(action_type)) {
            return res.status(400).json({
                message: 'Invalid action_type. Must be one of: ' + validActionTypes.join(', ')
            });
        }

        // Validate target_type
        const validTargetTypes = ['user', 'gig', 'comment', 'order'];
        if (!validTargetTypes.includes(target_type)) {
            return res.status(400).json({
                message: 'Invalid target_type. Must be one of: ' + validTargetTypes.join(', ')
            });
        }

        // Validate actor_role
        const validRoles = ['admin', 'buyer', 'seller'];
        if (!validRoles.includes(actor_role)) {
            return res.status(400).json({
                message: 'Invalid actor_role. Must be one of: ' + validRoles.join(', ')
            });
        }

        const logData = {
            actor_id,
            actor_role,
            target_id,
            target_type,
            action_type,
            description
        };

        const result = await AdminService.createAdminLog(logData);
        
        res.status(201).json({
            message: 'Admin log created successfully',
            data: result
        });

    } catch (error) {
        console.error("Error creating admin log:", error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const getGigReports = async (req, res) => {
    try {
        const { search } = req.query;
        const reports = await AdminService.fetchGigReports(search);
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        console.error("Error fetching gig reports:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const dismissReport = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLog = await AdminService.dismissReport(id);
        res.status(200).json({ status: 'success', data: updatedLog });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getUserReports = async (req, res) => {
    try {
        const { search } = req.query;
        const reports = await AdminService.fetchUserReports(search);
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getHeroStats = async (req, res) => {
    try {
        const stats = await AdminService.getHeroStats();
        res.status(200).json({ 
            status: 'success', 
            data: stats 
        });
    } catch (error) {
        console.error("Error fetching hero stats:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getStatsSection = async (req, res) => {
    try {
        const stats = await AdminService.getStatsSection();
        res.status(200).json({ 
            status: 'success', 
            data: stats 
        });
    } catch (error) {
        console.error("Error fetching stats section:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getTopSellersByEarnings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const topSellers = await AdminService.getTopSellersByEarnings(limit);
        res.status(200).json({ 
            status: 'success', 
            data: topSellers 
        });
    } catch (error) {
        console.error("Error fetching top sellers by earnings:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const dashboardData = await AdminService.getDashboardStats();
        res.status(200).json({ 
            status: 'success', 
            data: dashboardData 
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getAdminEarnings = async (req, res) => {
    try {
        const earningsData = await AdminService.getAdminEarnings();
        res.status(200).json({ 
            status: 'success', 
            data: earningsData 
        });
    } catch (error) {
        console.error("Error fetching admin earnings:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getAdminTransactionHistory = async (req, res) => {
    try {
        const transactions = await AdminService.getAdminTransactionHistory();
        res.status(200).json({ 
            status: 'success', 
            transactions: transactions 
        });
    } catch (error) {
        console.error("Error fetching admin transaction history:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const adminWithdraw = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Forbidden: Admin only' });
        }
        const { amount } = req.body;
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Amount must be greater than 0' });
        }

        // Lấy earnings hiện tại để kiểm tra availableBalance
        const earningsData = await AdminService.getAdminEarnings();
        if (parsedAmount > earningsData.availableBalance) {
            return res.status(400).json({ status: 'error', message: 'Amount exceeds available admin balance' });
        }

        // Ghi transaction admin_withdraw (không cập nhật User.balance)
        const Transaction = require('../models/transactions.model');
        const { error: insertError } = await Transaction.create({
            user_id: req.user.uuid, // Lưu lại admin uuid để truy vết
            amount: parsedAmount,
            description: 'Admin withdrawal from website profits',
            type: 'admin_withdraw'
        });
        if (insertError) throw insertError;

        // Lấy lại earnings sau khi withdraw
        const updatedEarnings = await AdminService.getAdminEarnings();

        return res.status(201).json({
            status: 'success',
            message: `Admin withdrew $${parsedAmount.toFixed(2)}`,
            data: {
                withdrawnAmount: parsedAmount,
                earnings: updatedEarnings
            }
        });
    } catch (error) {
        console.error('Error in adminWithdraw:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getAdminStats,
    createAdminLog,
    getGigReports,
    dismissReport,
    getUserReports,
    getHeroStats,
    getStatsSection,
    getTopSellersByEarnings,
    getDashboardStats,
    getAdminEarnings,
    getAdminTransactionHistory,
    adminWithdraw
};
