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

module.exports = {
    getAdminStats,
};
