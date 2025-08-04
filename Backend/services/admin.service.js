// services/admin.service.js
const AdminModel = require('../models/admin.model');
const Gig = require('../models/gig.model'); // Dùng lại gig.model.js bạn đã cung cấp
const User = require('../models/user.model'); // Giả sử bạn có user.model tương tự

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
const fetchGigReports = async (searchTerm = '') => {
    const [mostReported, allReportLogs] = await Promise.all([
        AdminModel.getMostReportedGigs(searchTerm),
        AdminModel.getAllGigReportLogs()
    ]);

    const gigIds = [...new Set(allReportLogs.map(log => log.target_id))];
    const userIds = [...new Set(allReportLogs.map(log => log.actor_id))];
    
    let gigDetailsMap = {}, userDetailsMap = {};

    if (gigIds.length > 0 || userIds.length > 0) {
        const [gigDetailsArray, userDetailsArray] = await Promise.all([
            gigIds.length > 0 ? Gig.findByIds(gigIds) : [],
            userIds.length > 0 ? User.findByIds(userIds) : []
        ]);
        gigDetailsArray.forEach(gig => { gigDetailsMap[gig.id] = gig; });
        userDetailsArray.forEach(user => { userDetailsMap[user.uuid] = user; });
    }

    let allReports = allReportLogs.map(log => ({
        ...log,
        gig: gigDetailsMap[log.target_id] || null, // Trả về null nếu không tìm thấy gig
        reporter: userDetailsMap[log.actor_id] || { username: 'Deleted User' }
    }));

    // Sửa đổi ở đây: Thêm kiểm tra an toàn trước khi lọc
    if (searchTerm) {
        allReports = allReports.filter(report => 
            report.gig && // <-- Kiểm tra xem report.gig có tồn tại không
            report.gig.title && // <-- Kiểm tra xem gig có title không
            report.gig.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return { mostReported, allReports: allReports.slice(0, 10) };
};

const fetchUserReports = async (searchTerm = '') => {
    const [mostReported, allReportLogs] = await Promise.all([
        AdminModel.getMostReportedUsers(searchTerm),
        AdminModel.getAllUserReportLogs()
    ]);

    const targetUserIds = [...new Set(allReportLogs.map(log => log.target_id))];
    const reporterIds = [...new Set(allReportLogs.map(log => log.actor_id))];
    const allUserIds = [...new Set([...targetUserIds, ...reporterIds])];

    let userDetailsMap = {};
    if (allUserIds.length > 0) {
        const userDetailsArray = await User.findByIds(allUserIds);
        userDetailsArray.forEach(user => { userDetailsMap[user.uuid] = user; });
    }

    let allReports = allReportLogs.map(log => ({
        ...log,
        user: userDetailsMap[log.target_id] || null, // Trả về null nếu không tìm thấy user
        reporter: userDetailsMap[log.actor_id] || { username: 'Deleted User' }
    }));

    // Sửa đổi ở đây: Thêm kiểm tra an toàn trước khi lọc
    if (searchTerm) {
        allReports = allReports.filter(report => 
            report.user && // <-- Kiểm tra xem report.user có tồn tại không
            report.user.username && // <-- Kiểm tra xem user có username không
            report.user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return { mostReported, allReports: allReports.slice(0, 10) };
};

const dismissReport = async (logId) => {
    return await AdminModel.updateLogStatus(logId, 'dismissed');
};


module.exports = {
    fetchAllAdminData,
    createAdminLog,
    fetchGigReports,
    dismissReport,
    fetchUserReports
};
