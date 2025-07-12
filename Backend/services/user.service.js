const User = require('../models/user.model');
const supabase = require('../config/supabaseClient');

// Từ nhánh HEAD
const fetchAllUsers = async (searchTerm) => {
    const data = await User.findAll(searchTerm);
    return data;
};

const updateUserByUuid = async (uuid, updateData) => {
    const allowedUpdates = ['role', 'status'];
    const finalUpdateData = {};
    for (const key of allowedUpdates) {
        if (updateData[key]) {
            finalUpdateData[key] = updateData[key];
        }
    }

    if (Object.keys(finalUpdateData).length === 0) {
        throw new Error("No valid fields to update.");
    }

    const data = await User.updateByUuid(uuid, finalUpdateData);
    return data;
};

const deleteUserByUuid = async (uuid) => {
    // Dữ liệu cần cập nhật
    const dataToUpdate = { status: 'inactive' };

    // Gọi hàm update có sẵn trong model của bạn
    const updatedUser = await User.updateByUuid(uuid, dataToUpdate);

    // Không còn xóa user khỏi Supabase Auth nữa
    // Việc này giữ lại tài khoản để họ có thể đăng nhập nếu cần kích hoạt lại

    return { 
        message: `User ${uuid} has been deactivated.`,
        user: updatedUser 
    };
};

// Get user info based on User table schema
const getUserById = async (userId) => {
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select(`
                uuid,
                fullname,
                username,
                avt_url,
                balance,
                created_at,
                updated_at,
                role,
                status,
                seller_headline,
                seller_description,
                seller_since
            `)
            .eq('uuid', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!user) return null;

        return {
            id: user.uuid,
            fullname: user.fullname,
            username: user.username,
            avatar: user.avt_url || 'https://placehold.co/300x300',
            balance: parseFloat(user.balance || 0),
            created_at: user.created_at,
            updated_at: user.updated_at,
            role: user.role,
            status: user.status,
            seller_headline: user.seller_headline,
            seller_description: user.seller_description,
            seller_since: user.seller_since
        };
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

// Get seller earnings data based on Orders, Gigs, Transactions tables
const getSellerEarnings = async (sellerId, period = 'allTime') => {
    try {
        // Get date range based on period
        const now = new Date();
        let startDate = null;
        
        switch(period) {
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default: // allTime
                startDate = null;
        }

        // Query Orders with Gigs data for seller earnings
        let ordersQuery = supabase
            .from('Orders')
            .select(`
                id,
                price_at_purchase,
                status,
                created_at,
                completed_at,
                Gigs!Orders_gig_id_fkey (
                    id,
                    title,
                    owner_id
                )
            `)
            .eq('Gigs.owner_id', sellerId);

        if (startDate) {
            ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
        }

        const { data: orders, error: ordersError } = await ordersQuery;
        if (ordersError) throw ordersError;

        // Calculate earnings statistics
        const completedOrders = orders.filter(order => order.status === 'completed');
        const totalEarnings = completedOrders.reduce((sum, order) => sum + parseFloat(order.price_at_purchase), 0);
        const averageOrderValue = completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0;
        
        // Get pending earnings (orders not completed yet)
        const pendingOrders = orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled');
        const pendingEarnings = pendingOrders.reduce((sum, order) => sum + parseFloat(order.price_at_purchase), 0);

        // Get active gigs count
        const { data: activeGigs, error: gigsError } = await supabase
            .from('Gigs')
            .select('id')
            .eq('owner_id', sellerId)
            .eq('status', 'active');
            
        if (gigsError) throw gigsError;

        // Get user balance
        const { data: user, error: userError } = await supabase
            .from('User')
            .select('balance')
            .eq('uuid', sellerId)
            .single();
            
        if (userError) throw userError;

        // Get transactions for withdrawal calculation
        const { data: transactions, error: transError } = await supabase
            .from('Transactions')
            .select('amount, description')
            .eq('user_id', sellerId)
            .ilike('description', '%withdraw%');
            
        const totalWithdrawn = transactions 
            ? transactions.reduce((sum, trans) => sum + Math.abs(parseFloat(trans.amount)), 0)
            : 0;

        // Calculate monthly breakdown
        const monthlyBreakdown = [];
        const monthlyStats = {};
        
        completedOrders.forEach(order => {
            const date = new Date(order.completed_at || order.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    month: monthName,
                    year: date.getFullYear(),
                    earnings: 0,
                    orders: 0
                };
            }
            
            monthlyStats[monthKey].earnings += parseFloat(order.price_at_purchase);
            monthlyStats[monthKey].orders += 1;
        });

        // Convert to array and sort by date
        Object.values(monthlyStats).forEach(stat => monthlyBreakdown.push(stat));
        monthlyBreakdown.sort((a, b) => new Date(a.year, a.month) - new Date(b.year, b.month));

        return {
            totalEarnings,
            completedOrders: completedOrders.length,
            averageOrderValue,
            pendingEarnings,
            availableBalance: parseFloat(user.balance || 0),
            totalWithdrawn,
            activeGigs: activeGigs.length,
            completionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
            monthlyBreakdown: monthlyBreakdown.slice(-12) // Last 12 months
        };
    } catch (error) {
        throw new Error(`Error fetching seller earnings: ${error.message}`);
    }
};

// Get recent orders for seller
const getSellerRecentOrders = async (sellerId, limit = 10) => {
    try {
        const { data: orders, error } = await supabase
            .from('Orders')
            .select(`
                id,
                price_at_purchase,
                status,
                requirement,
                created_at,
                completed_at,
                Gigs!Orders_gig_id_fkey (
                    id,
                    title,
                    owner_id
                )
            `)
            .eq('Gigs.owner_id', sellerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return orders.map(order => ({
            id: order.id,
            gig_title: order.Gigs.title,
            price_at_purchase: parseFloat(order.price_at_purchase),
            status: order.status,
            requirement: order.requirement,
            created_at: order.created_at,
            completed_at: order.completed_at
        }));
    } catch (error) {
        throw new Error(`Error fetching recent orders: ${error.message}`);
    }
};

const getUserByUsername = async (username) => {
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select(`
                uuid,
                fullname,
                username,
                avt_url,
                balance,
                created_at,
                updated_at,
                role,
                status,
                seller_headline,
                seller_description,
                seller_since
            `)
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!user) return null;

        return {
            id: user.uuid,
            fullname: user.fullname,
            username: user.username,
            avatar: user.avt_url || 'https://placehold.co/300x300',
            balance: parseFloat(user.balance || 0),
            created_at: user.created_at,
            updated_at: user.updated_at,
            role: user.role,
            status: user.status,
            seller_headline: user.seller_headline,
            seller_description: user.seller_description,
            seller_since: user.seller_since
        };
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

// Export tất cả
module.exports = {
    fetchAllUsers,
    updateUserByUuid,
    deleteUserByUuid,
    getUserById,
    getUserByUsername,
    getSellerEarnings,
    getSellerRecentOrders
};
