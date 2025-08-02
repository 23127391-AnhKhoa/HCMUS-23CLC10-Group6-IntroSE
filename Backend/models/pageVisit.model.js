// models/pageVisit.model.js
const supabase = require('../config/supabaseClient');

const PageVisit = {
    create: async (visitData) => {
        const { data, error } = await supabase
            .from('pagevisits')
            .insert([visitData]);
        if (error) throw error;
        return data;
    },
    // Thêm hàm đếm lượt truy cập trong ngày
    getCountToday: async () => {
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         const { count, error } = await supabase
            .from('pagevisits')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());
        if (error) throw error;
        return count;
    }
};
module.exports = PageVisit;