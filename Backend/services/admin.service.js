// services/admin.service.js
const AdminModel = require('../models/admin.model');
const Gig = require('../models/gig.model'); // Dùng lại gig.model.js bạn đã cung cấp
const User = require('../models/user.model'); // Giả sử bạn có user.model tương tự
const supabase = require('../config/supabaseClient'); // Thêm import supabase

// Function tính toán monthly financials với logic mới
const calculateMonthlyFinancials = async () => {
    const last12Months = [];
    const currentDate = new Date();
    
    // Tạo array 12 tháng gần nhất
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Tính ngày đầu và cuối tháng
        const startOfMonth = new Date(year, month - 1, 1).toISOString();
        const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();
        
        // Query Revenue (type = 'payment')
        const { data: revenueData, error: revenueError } = await supabase
            .from('Transactions')
            .select('amount')
            .eq('type', 'payment')
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth);
            
        if (revenueError) throw revenueError;
        
        // Query Seller Payments (type = 'received_payment')
        const { data: sellerPaymentData, error: sellerError } = await supabase
            .from('Transactions')
            .select('amount')
            .eq('type', 'received_payment')
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth);
            
        if (sellerError) throw sellerError;
        
        // Tính toán
        const revenue = revenueData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const sellerPayments = sellerPaymentData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const profit = revenue - sellerPayments;
        
        last12Months.push({
            month: monthKey,
            revenue: revenue,
            profit: profit
        });
    }
    
    return last12Months;
};

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

const fetchDashboardAnalytics = async () => {
    // Tính toán Monthly Financials với logic mới
    const monthlyFinancials = await calculateMonthlyFinancials();
    
    // Gọi các RPC function cho top buyers/sellers
    const [
        topBuyersResult,
        topSellersResult
    ] = await Promise.all([
        supabase.rpc('get_top_buyers_this_month', { limit_count: 5 }),
        supabase.rpc('get_top_sellers_this_month', { limit_count: 5 })
    ]);

    // Xử lý lỗi
    if (topBuyersResult.error) throw topBuyersResult.error;
    if (topSellersResult.error) throw topSellersResult.error;

    // Lấy dữ liệu từ kết quả
    const topBuyers = topBuyersResult.data;
    const topSellers = topSellersResult.data;
    
    // Tính toán các thẻ stat cards
    const today = new Date().toISOString().slice(0, 10);
    const { data: todaySalesData, error: salesError } = await supabase
        .from('Transactions')
        .select('amount')
        .eq('type', 'payment')
        .gte('created_at', today);
    if(salesError) throw salesError;
    const todaySales = todaySalesData.reduce((sum, t) => sum + t.amount, 0);

    const { count: newUsers, error: usersError } = await supabase.from('User').select('*', {count: 'exact', head: true}).gte('created_at', today);
    if(usersError) throw usersError;
    
    // Tính today's visitors từ bảng pagevisits (với tên table đúng)
    const { count: todayAccessCount, error: accessError } = await supabase
        .from('pagevisits')
        .select('*', {count: 'exact', head: true})
        .gte('created_at', today);
    if(accessError) throw accessError;
    
    // Thêm dữ liệu cho 2 StatCard còn thiếu
    const { count: totalOrders, error: ordersError } = await supabase.from('Orders').select('*', {count: 'exact', head: true});
    if(ordersError) throw ordersError;
    
    const { count: activeGigs, error: gigsError } = await supabase.from('Gigs').select('*', {count: 'exact', head: true}).eq('status', 'active');
    if(gigsError) throw gigsError;
    
    return {
        todaySales,
        todayAccess: todayAccessCount || 0,
        newUsers,
        totalOrders: totalOrders || 0,
        activeGigs: activeGigs || 0,
        monthlyFinancials,
        topBuyers,
        topSellers,
    };
};

module.exports = {
    fetchAllAdminData,
    createAdminLog,
    fetchGigReports,
    dismissReport,
    fetchUserReports,
    fetchDashboardAnalytics
};
