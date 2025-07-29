// controllers/reports.controller.js
const ReportsService = require('../services/reports.service');

const getGigReports = async (req, res) => {
    try {
        const { search } = req.query;
        const reports = await ReportsService.fetchGigReports(search);
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        console.error("Error fetching gig reports:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const dismissReport = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLog = await ReportsService.dismissReport(id);
        res.status(200).json({ status: 'success', data: updatedLog });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { getGigReports, dismissReport }; // Thêm dismissReport vào export
