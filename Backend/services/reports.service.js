// services/reports.service.js
const ReportsModel = require('../models/reports.model');
const Gig = require('../models/gig.model'); // Dùng lại gig.model.js bạn đã cung cấp
const User = require('../models/user.model'); // Giả sử bạn có user.model tương tự

const fetchGigReports = async (searchTerm = '') => {
    // 1. Lấy top gigs bị report (RPC tự xử lý join)
    const mostReported = await ReportsModel.getMostReportedGigs(searchTerm);

    // 2. Lấy tất cả logs báo cáo gig
    const allReportLogs = await ReportsModel.getAllGigReportLogs();

    // 3. Lấy ra các ID duy nhất của gig và user từ logs
    const gigIds = [...new Set(allReportLogs.map(log => log.target_id))];
    const userIds = [...new Set(allReportLogs.map(log => log.actor_id))];

    // 4. Lấy thông tin chi tiết cho các gig và user đó trong 2 câu lệnh song song
    let gigDetailsMap = {};
    let userDetailsMap = {};

    if (gigIds.length > 0 && userIds.length > 0) {
        const [gigDetailsArray, userDetailsArray] = await Promise.all([
            Gig.findByIds(gigIds),      // Cần thêm hàm này vào gig.model.js
            User.findByIds(userIds)     // Giả sử có hàm này trong user.model.js
        ]);

        gigDetailsArray.forEach(gig => { gigDetailsMap[gig.id] = gig; });
        userDetailsArray.forEach(user => { userDetailsMap[user.uuid] = user; });
    }

    // 5. "Join" dữ liệu lại bằng tay
    let allReports = allReportLogs.map(log => ({
        ...log,
        gig: gigDetailsMap[log.target_id] || { title: 'Deleted/Invalid Gig' },
        reporter: userDetailsMap[log.actor_id] || { username: 'Deleted User' }
    }));

    // 6. Lọc kết quả theo searchTerm nếu có
    if (searchTerm) {
        allReports = allReports.filter(report => 
            report.gig.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return { mostReported, allReports: allReports.slice(0, 10) }; // Trả về 10 kết quả sau khi lọc
};

module.exports = { fetchGigReports };