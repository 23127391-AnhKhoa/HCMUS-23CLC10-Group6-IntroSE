// services/admin.service.js
const AdminModel = require('../models/admin.model');

const fetchAllAdminData = async () => {
    // Thực hiện các truy vấn lấy dữ liệu song song để tối ưu hiệu suất
    const [
        statCards,
        topBuyers,
        topServices
    ] = await Promise.all([
        AdminModel.getStatCardData(),
        AdminModel.getTopBuyersOfMonth(),
        AdminModel.getTopSellingServices()
    ]);

    return {
        statCards,
        topBuyers,
        topServices
    };
};

const createAdminLog = async (logData) => {
    try {
        const result = await AdminModel.createAdminLog(logData);
        return result;
    } catch (error) {
        console.error('Error in createAdminLog service:', error);
        throw error;
    }
};

module.exports = {
    fetchAllAdminData,
    createAdminLog,
};
