// controllers/pageVisit.controller.js
const PageVisitService = require('../services/pageVisit.service');

const createVisitLog = async (req, res) => {
    try {
        console.log('📊 Page visit logged from:', req.ip || req.socket.remoteAddress);
        const visitData = {
            // req.user?.uuid sẽ tồn tại nếu bạn dùng middleware optionalAuth
            user_id: req.user?.uuid || null, 
            // Lấy IP, cần cấu hình server để lấy đúng
            ip_address: req.ip || req.socket.remoteAddress 
        };
        await PageVisitService.logVisit(visitData);
        console.log('✅ Visit successfully logged');
        res.status(201).json({ status: 'success', message: 'Visit logged.' });
    } catch (error) {
        console.error('❌ Error logging visit:', error);
        res.status(500).json({ status: 'error', message: 'Failed to log visit.' });
    }
};
module.exports = { createVisitLog };