// models/admin.model.js
const supabase = require('../config/supabaseClient');

const getStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
};

const getStartOfMonth = () => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
}

const AdminModel = {
    /**
     * Lấy dữ liệu cho 4 thẻ thống kê đầu trang.
     */
    getStatCardData: async () => {
        const today = getStartOfToday();

        // 1. Today's Sales: Tổng tiền từ bảng Transactions hôm nay
        const { data: salesData, error: salesError } = await supabase
            .from('Transactions')
            .select('amount')
            .eq('type', 'payment')  
            .gte('created_at', today);
        if (salesError) throw salesError;
        const totalSales = salesData.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // 2. Today's Users: Tổng user mới tạo hôm nay
        const { count: newUsers, error: usersError } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
        if (usersError) throw usersError;

        // 3. New Orders: Tổng đơn hàng mới tạo hôm nay
        const { count: newOrders, error: ordersError } = await supabase
            .from('Orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
        if (ordersError) throw ordersError;
        
        // Dữ liệu "New Clients" không rõ ràng trong schema, tạm thời để bằng "New Users"
        return {
            totalSales: totalSales,
            totalNewUsers: newUsers,
            totalNewClients: newUsers, // Giả định client mới là user mới
            totalNewOrders: newOrders
        };
    },

    /**
     * Lấy top 5 người mua nhiều nhất trong tháng.
     */
    getTopBuyersOfMonth: async () => {
        const startOfMonth = getStartOfMonth();

        const { data, error } = await supabase
            .from('Orders')
            .select(`
                price_at_purchase,
                client:User!client_id(username, avt_url)
            `)
            .gte('created_at', startOfMonth)
            .eq('status', 'completed'); // Chỉ tính đơn hàng đã hoàn thành

        if (error) throw error;
        
        // Xử lý dữ liệu ở phía server để giảm tải cho client
        const buyerTotals = data.reduce((acc, order) => {
            const buyerId = order.client.username;
            if (!acc[buyerId]) {
                acc[buyerId] = { 
                    totalSpent: 0,
                    avatar: order.client.avt_url,
                    name: order.client.username,
                };
            }
            acc[buyerId].totalSpent += order.price_at_purchase;
            return acc;
        }, {});

        // Sắp xếp và lấy top 5
        const sortedBuyers = Object.values(buyerTotals)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map(b => ({...b, price: `$${b.totalSpent.toFixed(2)}`})); // Định dạng lại cho giống UI

        // Giả lập thêm các trường cho giống UI
        return sortedBuyers.map(b => ({
            ...b,
            product: 'Multiple',
            invoice: '#MONTHLY'
        }));
    },

    /**
     * Lấy top 5 dịch vụ (gigs) được bán nhiều nhất.
     */
    getTopSellingServices: async () => {
        // RPC (Remote Procedure Call) là cách tốt nhất cho truy vấn phức tạp này.
        // Bạn cần tạo function này trong Supabase SQL Editor:
        /*
            CREATE OR REPLACE FUNCTION get_top_selling_gigs(limit_count INT)
            RETURNS TABLE(gig_id UUID, title TEXT, cover_image TEXT, price NUMERIC, sold_count BIGINT) AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    g.id as gig_id,
                    g.title,
                    g.cover_image,
                    g.price,
                    count(o.id) as sold_count
                FROM "Gigs" g
                JOIN "Orders" o ON g.id = o.gig_id
                GROUP BY g.id
                ORDER BY sold_count DESC
                LIMIT limit_count;
            END;
            $$ LANGUAGE plpgsql;
        */
       
        const { data, error } = await supabase.rpc('get_top_selling_gigs', { limit_count: 5 });

        if (error) {
            console.error("Error calling RPC. Make sure you created the 'get_top_selling_gigs' function in Supabase SQL Editor.");
            throw error;
        }

        // Định dạng lại cho giống UI
        return data.map(g => ({
            image: g.cover_image,
            name: g.title,
            price: `$${g.price}`,
            discount: 'N/A', // Schema không có trường discount
            sold: g.sold_count
        }));
    },

    /**
     * Tạo log mới trong bảng AdminLog
     */
    createAdminLog: async (logData) => {
        const { actor_id, actor_role, target_id, target_type, action_type, description } = logData;
        
        const { data, error } = await supabase
            .from('AdminLog')
            .insert([{
                actor_id,
                actor_role,
                target_id,
                target_type,
                action_type,
                description
            }])
            .select()
            .single();

        if (error) {
            console.error('Error inserting admin log:', error);
            throw error;
        }

        return data;
    },
    getMostReportedGigs: async (searchTerm) => {
        const { data, error } = await supabase.rpc('get_most_reported_gigs', {
            search_term: searchTerm,
            limit_count: 3
        });
        if (error) throw error;
        return data;
    },

    getAllGigReportLogs: async () => {
        let query = supabase
            .from('AdminLog')
            .select('id, description, created_at, target_id, actor_id')
            .eq('action_type', 'report gig')
            .eq('status', 'pending');
        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        return data;
    },

    getMostReportedUsers: async (searchTerm) => {
        const { data, error } = await supabase.rpc('get_most_reported_users', {
            search_term: searchTerm,
            limit_count: 3
        });
        if (error) throw error;
        return data;
    },

    getAllUserReportLogs: async () => {
        let query = supabase
            .from('AdminLog')
            .select('id, description, created_at, target_id, actor_id')
            .eq('action_type', 'report user')
            .eq('status', 'pending');
        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        return data;
    },

    updateLogStatus: async (logId, newStatus) => {
        const { data, error } = await supabase
            .from('AdminLog')
            .update({ status: newStatus })
            .eq('id', logId)
            .select().single();
        if (error) throw error;
        return data;
    },
};

module.exports = AdminModel;
