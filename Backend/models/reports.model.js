// models/reports.model.js
const supabase = require('../config/supabaseClient');

const ReportsModel = {
    getMostReportedGigs: async (searchTerm) => {
        const { data, error } = await supabase.rpc('get_most_reported_gigs', {
            search_term: searchTerm,
            limit_count: 3
        });
        if (error) throw error;
        return data;
    },
    updateLogStatus: async (logId, newStatus) => {
        const { data, error } = await supabase
            .from('AdminLog')
            .update({ status: newStatus })
            .eq('id', logId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    // Lấy tất cả log báo cáo cho gig
    getAllGigReportLogs: async (searchTerm) => {
    let query = supabase
        .from('AdminLog')
        .select('id, description, created_at, target_id, actor_id')
        .eq('action_type', 'report gig')
        .eq('status', 'pending'); // <-- THÊM DÒNG NÀY

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data;
},
};

module.exports = ReportsModel;