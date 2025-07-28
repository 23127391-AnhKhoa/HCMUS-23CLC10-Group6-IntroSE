// models/reports.model.js
const supabase = require('../config/supabaseClient');

const ReportsModel = {
    /**
     * Lấy danh sách các gig bị báo cáo nhiều nhất bằng RPC function
     */
    getMostReportedGigs: async (searchTerm) => {
        const { data, error } = await supabase.rpc('get_most_reported_gigs', {
            search_term: searchTerm,
            limit_count: 3 // Lấy top 3
        });

        if (error) {
            console.error("Error calling RPC get_most_reported_gigs:", error);
            throw error;
        }
        return data;
    },

    /**
     * Lấy tất cả các báo cáo riêng lẻ
     */
    getAllReportedGigs: async (searchTerm) => {
        let query = supabase
            .from('AdminLog')
            .select(`
                id,
                description,
                created_at,
                gig:Gigs!target_id (id, title),
                reporter:User!actor_id (username)
            `)
            .eq('target_type', 'gig')
            .eq('action_type', 'report');

        if (searchTerm) {
            query = query.ilike('Gigs.title', `%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false }).limit(10); // Lấy 10 báo cáo gần nhất

        if (error) throw error;
        return data;
    }
};

module.exports = ReportsModel;