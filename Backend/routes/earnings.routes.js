/**
 * Earnings Routes
 * 
 * @file earnings.routes.js
 * @description Handles routing for earnings-related endpoints
 * Routes for seller earnings statistics and analytics
 * 
 * @requires express
 * @requires ../controllers/earnings.controller
 * @requires ../middleware/auth.middleware
 */

const express = require('express');
const router = express.Router();
const EarningsController = require('../controllers/earnings.controller');
const OrderService = require('../services/order.service');

/**
 * @route GET /api/earnings/seller/:sellerId/stats
 * @desc Get seller earnings statistics
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {string} [period] - Time period (thisMonth, lastMonth, thisYear, allTime)
 */
router.get('/seller/:sellerId/stats', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { period = 'thisMonth' } = req.query;
    
    console.log('💰 [Earnings Routes] GET /seller/:sellerId/stats called');
    console.log('👤 Seller ID:', sellerId);
    console.log('📊 Period:', period);

    // Get earnings statistics using the new service function
    const earningsStats = await OrderService.getSellerEarningsStats(sellerId, period);
    
    res.status(200).json({
      status: 'success',
      data: {
        period,
        ...earningsStats
      }
    });

  } catch (error) {
    console.error('❌ [Earnings Routes] Error in GET /seller/:sellerId/stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route GET /api/earnings/seller/:sellerId/recent-orders
 * @desc Get recent orders for earnings page
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {number} [limit=10] - Number of recent orders to fetch
 */
router.get('/seller/:sellerId/recent-orders', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { limit = 10 } = req.query;
    
    console.log('📋 [Earnings Routes] GET /seller/:sellerId/recent-orders called');
    console.log('👤 Seller ID:', sellerId);
    console.log('📊 Limit:', limit);

    // Get recent orders using the new service function
    const recentOrders = await OrderService.getSellerRecentOrders(sellerId, parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: recentOrders
    });

  } catch (error) {
    console.error('❌ [Earnings Routes] Error in GET /seller/:sellerId/recent-orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route GET /api/earnings/seller/:sellerId/monthly
 * @desc Get monthly earnings breakdown for charts
 * @access Private (Seller only)
 * @param {string} sellerId - Seller UUID
 * @param {number} [months=12] - Number of months to include
 */
router.get('/seller/:sellerId/monthly', EarningsController.getMonthlyEarnings);

module.exports = router;
