// controllers/dashboard.controller.js
const DashboardService = require('../services/dashboard.service');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await DashboardService.fetchAllDashboardData();
        res.status(200).json(stats);
    } catch (error) {
        // Ghi lại lỗi chi tiết ở server
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
};