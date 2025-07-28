// services/reports.service.js
const ReportsModel = require('../models/reports.model');

const fetchGigReports = async (searchTerm = '') => {
    // Gọi song song 2 hàm từ model để lấy dữ liệu
    const [mostReported, allReports] = await Promise.all([
        ReportsModel.getMostReportedGigs(searchTerm),
        ReportsModel.getAllReportedGigs(searchTerm)
    ]);

    return { mostReported, allReports };
};

module.exports = { fetchGigReports };