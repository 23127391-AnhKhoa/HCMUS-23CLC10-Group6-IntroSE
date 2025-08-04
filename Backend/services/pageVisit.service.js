// services/pageVisit.service.js
const PageVisit = require('../models/pageVisit.model');

const logVisit = async (visitData) => {
    // Có thể thêm logic xử lý ở đây nếu cần, vd: không ghi log nếu request từ bot
    return await PageVisit.create(visitData);
};

module.exports = { logVisit };