// services/dashboard.service.js
const DashboardModel = require('../models/dashboard.model');

const fetchAllDashboardData = async () => {
    // Thực hiện các truy vấn lấy dữ liệu song song để tối ưu hiệu suất
    const [
        statCards,
        topBuyers,
        topServices
    ] = await Promise.all([
        DashboardModel.getStatCardData(),
        DashboardModel.getTopBuyersOfMonth(),
        DashboardModel.getTopSellingServices()
    ]);

    return {
        statCards,
        topBuyers,
        topServices
    };
};

module.exports = {
    fetchAllDashboardData,
};