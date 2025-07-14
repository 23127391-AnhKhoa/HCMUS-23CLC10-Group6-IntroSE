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

module.exports = {
    fetchAllAdminData,
};
