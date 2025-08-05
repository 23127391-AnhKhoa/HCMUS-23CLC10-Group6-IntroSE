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

    /**
     * Lấy thống kê tổng quan cho Hero Section
     */
    getHeroStats: async () => {
        // Đếm số users có status active
        const { count: activeUsers, error: usersError } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        if (usersError) throw usersError;

        // Đếm số gigs có status active
        const { count: activeGigs, error: gigsError } = await supabase
            .from('Gigs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        if (gigsError) throw gigsError;

        // Đếm số orders có status completed
        const { count: completedOrders, error: ordersError } = await supabase
            .from('Orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
        if (ordersError) throw ordersError;

        // Đếm tổng số categories
        const { count: totalCategories, error: categoriesError } = await supabase
            .from('Categories')
            .select('*', { count: 'exact', head: true });
        if (categoriesError) throw categoriesError;

        return {
            totalUsers: activeUsers || 0,
            totalGigs: activeGigs || 0,
            completedOrders: completedOrders || 0,
            totalCategories: totalCategories || 0
        };
    },

    /**
     * Lấy thống kê cho Stats Section
     */
    getStatsSection: async () => {
        // Đếm số users có role buyer
        const { count: buyerUsers, error: buyerError } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'buyer');
        if (buyerError) throw buyerError;

        // Đếm số dòng trong bảng UserFavorites
        const { count: favoriteGigs, error: favoritesError } = await supabase
            .from('UserFavorites')
            .select('*', { count: 'exact', head: true });
        if (favoritesError) throw favoritesError;

        // Đếm tổng số orders (submitted orders)
        const { count: submittedOrders, error: ordersError } = await supabase
            .from('Orders')
            .select('*', { count: 'exact', head: true });
        if (ordersError) throw ordersError;

        // Tính success rate (completed orders / total orders * 100)
        const { count: completedOrders, error: completedError } = await supabase
            .from('Orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
        if (completedError) throw completedError;

        const successRate = submittedOrders > 0 
            ? Math.round((completedOrders / submittedOrders) * 100) 
            : 0;

        return {
            buyerUsers: buyerUsers || 0,
            favoriteGigs: favoriteGigs || 0,
            submittedOrders: submittedOrders || 0,
            successRate: successRate
        };
    },

    /**
     * Lấy top sellers dựa trên tổng thu nhập từ received_payment
     */
    getTopSellersByEarnings: async (limit = 6) => {
        // Lấy tất cả sellers
        const { data: allSellers, error: sellersError } = await supabase
            .from('User')
            .select('uuid, fullname, username, avt_url, seller_headline, role')
            .eq('role', 'seller');

        if (sellersError) throw sellersError;

        // Lấy tất cả transactions received_payment
        const { data: earningsData, error: earningsError } = await supabase
            .from('Transactions')
            .select('user_id, amount')
            .eq('type', 'received_payment');

        if (earningsError) throw earningsError;

        // Tính tổng earnings cho mỗi seller
        const sellersEarnings = {};
        earningsData.forEach(transaction => {
            const userId = transaction.user_id;
            if (!sellersEarnings[userId]) {
                sellersEarnings[userId] = 0;
            }
            sellersEarnings[userId] += parseFloat(transaction.amount);
        });

        // Kết hợp seller info với earnings (bao gồm cả seller có 0 earnings)
        const sellersWithEarnings = allSellers.map(seller => ({
            ...seller,
            totalEarnings: sellersEarnings[seller.uuid] || 0
        }));

        // Sắp xếp theo totalEarnings giảm dần và lấy theo limit
        const topSellers = sellersWithEarnings
            .sort((a, b) => b.totalEarnings - a.totalEarnings)
            .slice(0, limit);

        return topSellers;
    },

    /**
     * Lấy dữ liệu dashboard với doanh thu và lợi nhuận theo ngày
     */
    getDashboardStats: async () => {
        // 1. Lấy dữ liệu doanh thu và lợi nhuận 7 ngày gần nhất
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: dailyTransactions, error: transactionError } = await supabase
            .from('Transactions')
            .select('amount, created_at, type')
            .in('type', ['payment', 'received_payment'])
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (transactionError) throw transactionError;

        // Xử lý dữ liệu theo ngày
        const dailyStats = {};
        const today = new Date();
        
        // Khởi tạo 7 ngày với dữ liệu rỗng
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayLabel = date.getDate().toString();
            const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
            
            dailyStats[dateKey] = {
                name: i === 6 || date.getDate() === 1 ? monthDay : dayLabel,
                revenue: 0,
                profit: 0,
                payments: 0,
                receivedPayments: 0
            };
        }

        // Điền dữ liệu thực tế
        dailyTransactions.forEach(transaction => {
            const date = new Date(transaction.created_at).toISOString().split('T')[0];
            if (dailyStats[date]) {
                const amount = parseFloat(transaction.amount);
                if (transaction.type === 'payment') {
                    dailyStats[date].revenue += amount;
                    dailyStats[date].payments += amount;
                } else if (transaction.type === 'received_payment') {
                    dailyStats[date].receivedPayments += amount;
                }
            }
        });

        // Tính lợi nhuận (doanh thu - tiền trả cho seller)
        const chartData = Object.values(dailyStats).map(day => ({
            ...day,
            profit: day.revenue - day.receivedPayments
        }));

        // 2. Thống kê hôm nay
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: todayTransactions, error: todayError } = await supabase
            .from('Transactions')
            .select('amount, type')
            .in('type', ['payment', 'received_payment', 'deposit'])
            .gte('created_at', todayStart.toISOString());

        if (todayError) throw todayError;

        let todaySales = 0;
        let todayProfit = 0;
        let todayOrders = 0;
        let todayReceivedPayments = 0;
        let todayDeposits = 0;

        todayTransactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'payment') {
                todaySales += amount;
                todayOrders++;
            } else if (transaction.type === 'received_payment') {
                todayReceivedPayments += amount;
            } else if (transaction.type === 'deposit') {
                todayDeposits += amount;
            }
        });

        todayProfit = todaySales - todayReceivedPayments;

        // 3. Người dùng mới hôm nay
        const { data: newUsers, error: usersError } = await supabase
            .from('User')
            .select('role')
            .gte('created_at', todayStart.toISOString())
            .neq('role', 'admin');

        if (usersError) throw usersError;

        const totalNewUsers = newUsers.length;
        const newClients = newUsers.filter(user => user.role === 'buyer').length;

        // 4. Top Buyers (dựa trên type=payment)
        const { data: buyerTransactions, error: buyerError } = await supabase
            .from('Transactions')
            .select(`
                user_id,
                amount,
                User!Transactions_user_id_fkey (
                    fullname,
                    username,
                    avt_url
                )
            `)
            .eq('type', 'payment')
            .order('created_at', { ascending: false })
            .limit(100);

        if (buyerError) throw buyerError;

        // Nhóm theo buyer
        const buyerStats = {};
        buyerTransactions.forEach(transaction => {
            const userId = transaction.user_id;
            if (!buyerStats[userId]) {
                buyerStats[userId] = {
                    user: transaction.User,
                    totalSpent: 0,
                    orderCount: 0
                };
            }
            buyerStats[userId].totalSpent += parseFloat(transaction.amount);
            buyerStats[userId].orderCount++;
        });

        const topBuyers = Object.values(buyerStats)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map((buyer, index) => ({
                name: buyer.user.fullname || buyer.user.username,
                avatar: buyer.user.avt_url,
                product: `${buyer.orderCount} orders`,
                invoice: `#BUY${1000 + index}`,
                price: `$${buyer.totalSpent.toFixed(2)}`
            }));

        // 5. Top Sellers (dựa trên type=received_payment)
        const { data: sellerTransactions, error: sellerError } = await supabase
            .from('Transactions')
            .select(`
                user_id,
                amount,
                User!Transactions_user_id_fkey (
                    fullname,
                    username,
                    avt_url
                )
            `)
            .eq('type', 'received_payment')
            .order('created_at', { ascending: false })
            .limit(100);

        if (sellerError) throw sellerError;

        // Nhóm theo seller
        const sellerStats = {};
        sellerTransactions.forEach(transaction => {
            const userId = transaction.user_id;
            if (!sellerStats[userId]) {
                sellerStats[userId] = {
                    user: transaction.User,
                    totalEarned: 0,
                    completedOrders: 0
                };
            }
            sellerStats[userId].totalEarned += parseFloat(transaction.amount);
            sellerStats[userId].completedOrders++;
        });

        const topServices = Object.values(sellerStats)
            .sort((a, b) => b.totalEarned - a.totalEarned)
            .slice(0, 5)
            .map((seller, index) => ({
                name: seller.user.fullname || seller.user.username,
                image: seller.user.avt_url || `https://i.pravatar.cc/150?u=${seller.user.username}`,
                price: `$${seller.totalEarned.toFixed(2)}`,
                discount: `${seller.completedOrders} orders`,
                sold: `Top Seller`
            }));

        return {
            statCards: {
                totalSales: todaySales,
                totalProfit: todayProfit,
                totalNewUsers: totalNewUsers,
                totalNewOrders: todayOrders,
                totalNewClients: newClients,
                totalDeposits: todayDeposits
            },
            chartData,
            topBuyers,
            topServices
        };
    },

    // Tính tổng lợi nhuận website để làm admin balance
    getAdminEarnings: async () => {
        try {
            // Lấy tổng doanh thu từ payments (tiền người mua trả)
            const { data: paymentData, error: paymentError } = await supabase
                .from('Transactions')
                .select('amount')
                .eq('type', 'payment');
            
            if (paymentError) throw paymentError;
            
            // Lấy tổng tiền đã trả cho sellers
            const { data: receivedPaymentData, error: receivedError } = await supabase
                .from('Transactions')
                .select('amount')
                .eq('type', 'received_payment');
            
            if (receivedError) throw receivedError;
            
            // Lấy tổng tiền admin đã withdraw
            const { data: adminWithdrawData, error: withdrawError } = await supabase
                .from('Transactions')
                .select('amount, User!Transactions_user_id_fkey(role)')
                .eq('type', 'withdraw');
            
            if (withdrawError) throw withdrawError;
            
            const totalRevenue = paymentData.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const totalPaidToSellers = receivedPaymentData.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const totalAdminWithdraws = adminWithdrawData
                .filter(t => t.User && t.User.role === 'admin')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            // Lợi nhuận = Doanh thu - Tiền trả cho sellers - Tiền admin đã rút
            const totalProfit = totalRevenue - totalPaidToSellers;
            const availableBalance = totalProfit - totalAdminWithdraws;
            
            return {
                totalProfit,
                availableBalance,
                totalRevenue,
                totalPaidToSellers,
                totalAdminWithdraws
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy lịch sử giao dịch của admin (profit + withdraw)
    getAdminTransactionHistory: async () => {
        try {
            // Lấy tất cả giao dịch payment và received_payment để tính profit theo ngày
            const { data: allTransactions, error: allError } = await supabase
                .from('Transactions')
                .select(`
                    id,
                    amount,
                    type,
                    created_at,
                    User!Transactions_user_id_fkey(role, fullname, username)
                `)
                .in('type', ['payment', 'received_payment', 'withdraw'])
                .order('created_at', { ascending: false });
            
            if (allError) throw allError;
            
            // Tách các giao dịch withdraw của admin
            const adminWithdraws = allTransactions
                .filter(t => t.type === 'withdraw' && t.User && t.User.role === 'admin')
                .map(t => ({
                    ...t,
                    type: 'admin_withdraw',
                    description: 'Admin withdrawal from website profits'
                }));
            
            // Tính profit theo ngày từ payment và received_payment
            const dailyProfits = {};
            
            allTransactions.forEach(transaction => {
                if (transaction.type === 'payment' || transaction.type === 'received_payment') {
                    const date = new Date(transaction.created_at).toISOString().split('T')[0];
                    
                    if (!dailyProfits[date]) {
                        dailyProfits[date] = {
                            date: date,
                            revenue: 0,
                            paidToSellers: 0,
                            profit: 0,
                            transactionCount: 0
                        };
                    }
                    
                    if (transaction.type === 'payment') {
                        dailyProfits[date].revenue += parseFloat(transaction.amount);
                        dailyProfits[date].transactionCount++;
                    } else if (transaction.type === 'received_payment') {
                        dailyProfits[date].paidToSellers += parseFloat(transaction.amount);
                    }
                }
            });
            
            // Tạo profit transactions cho mỗi ngày có profit > 0
            const profitTransactions = Object.values(dailyProfits)
                .map(day => {
                    day.profit = day.revenue - day.paidToSellers;
                    return day;
                })
                .filter(day => day.profit > 0)
                .map(day => ({
                    id: `profit_${day.date}`,
                    amount: day.profit,
                    type: 'profit',
                    created_at: `${day.date}T23:59:59.000Z`,
                    User: { role: 'admin', fullname: 'Website', username: 'system' },
                    description: `Daily profit from ${day.transactionCount} transactions (Revenue: $${day.revenue.toFixed(2)} - Sellers: $${day.paidToSellers.toFixed(2)})`
                }));
            
            // Kết hợp profit và withdraw transactions
            const combinedTransactions = [...profitTransactions, ...adminWithdraws]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            return combinedTransactions;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AdminModel;
