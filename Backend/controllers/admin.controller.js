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
module.exports = {
    getAdminStats,
    createAdminLog,
    getGigReports,
    dismissReport,
    getUserReports
};
