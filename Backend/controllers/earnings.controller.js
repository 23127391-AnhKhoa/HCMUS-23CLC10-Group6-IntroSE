// controllers/earnings.controller.js
const OrderService = require('../services/order.service');

/**
 * Earnings Controller
 * Handles seller earnings and statistics endpoints
 */
const EarningsController = {
  /**
   * Get seller earnings statistics
   * 
   * @route GET /api/earnings/seller/:sellerId/stats
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.sellerId - Seller UUID
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.period] - Time period (thisMonth, lastMonth, thisYear, allTime)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with earnings statistics
   */
  getSellerEarningsStats: async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { period = 'thisMonth' } = req.query;
      
      console.log('💰 [Earnings Controller] getSellerEarningsStats called');
      console.log('👤 Seller ID:', sellerId);
      console.log('📊 Period:', period);

      // Validate that authenticated user matches the seller ID (security check)
      if (req.user.uuid !== sellerId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You can only view your own earnings'
        });
      }

      // Calculate date range based on period
      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          break;
        case 'allTime':
        default:
          startDate = null;
          endDate = null;
          break;
      }

      console.log('📅 Date range:', { startDate, endDate });

      // Get orders for this seller
      const allOrders = await OrderService.getOwnerOrders(sellerId, { limit: 1000 });
      console.log('📦 Total orders found:', allOrders?.length || 0);

      // Filter orders by date range if specified
      let filteredOrders = allOrders;
      if (startDate && endDate) {
        filteredOrders = allOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      console.log('📦 Filtered orders for period:', filteredOrders?.length || 0);

      // Calculate statistics
      const stats = calculateEarningsStats(filteredOrders);
      
      console.log('📊 Calculated stats:', stats);

      res.status(200).json({
        status: 'success',
        data: {
          period,
          dateRange: {
            startDate: startDate?.toISOString() || null,
            endDate: endDate?.toISOString() || null
          },
          ...stats
        }
      });

    } catch (error) {
      console.error('❌ [Earnings Controller] Error in getSellerEarningsStats:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: error.message
      });
    }
  },

  /**
   * Get monthly earnings breakdown for charts
   * 
   * @route GET /api/earnings/seller/:sellerId/monthly
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.sellerId - Seller UUID
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.months=12] - Number of months to include
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with monthly earnings data
   */
  getMonthlyEarnings: async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { months = 12 } = req.query;
      
      console.log('📈 [Earnings Controller] getMonthlyEarnings called');
      console.log('👤 Seller ID:', sellerId);
      console.log('📊 Months:', months);

      // Validate that authenticated user matches the seller ID
      if (req.user.uuid !== sellerId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You can only view your own earnings'
        });
      }

      // Get all orders for this seller
      const allOrders = await OrderService.getOwnerOrders(sellerId, { limit: 1000 });

      // Generate monthly breakdown
      const monthlyData = generateMonthlyBreakdown(allOrders, parseInt(months));

      res.status(200).json({
        status: 'success',
        data: monthlyData
      });

    } catch (error) {
      console.error('❌ [Earnings Controller] Error in getMonthlyEarnings:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: error.message
      });
    }
  }
};

/**
 * Calculate comprehensive earnings statistics from orders
 * 
 * @param {Array} orders - Array of order objects
 * @returns {Object} Earnings statistics
 */
function calculateEarningsStats(orders) {
  if (!orders || orders.length === 0) {
    return {
      totalEarnings: 0,
      availableForWithdrawal: 0,
      pendingClearance: 0,
      withdrawn: 0,
      totalOrders: 0,
      completedOrders: 0,
      activeOrders: 0,
      averageOrderValue: 0,
      completionRate: 0,
      topPerformingGigs: [],
      recentTransactions: []
    };
  }

  const completedOrders = orders.filter(order => order.status === 'completed');
  const activeOrders = orders.filter(order => 
    ['pending', 'in_progress', 'accepted'].includes(order.status?.toLowerCase())
  );
  const pendingOrders = orders.filter(order => 
    ['pending', 'accepted'].includes(order.status?.toLowerCase())
  );

  // Calculate total earnings from completed orders
  const totalEarnings = completedOrders.reduce((sum, order) => 
    sum + (parseFloat(order.price_at_purchase) || 0), 0
  );

  // Calculate pending clearance from recent completed orders (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentCompleted = completedOrders.filter(order => 
    new Date(order.completed_at || order.created_at) > weekAgo
  );
  
  const pendingClearance = recentCompleted.reduce((sum, order) => 
    sum + (parseFloat(order.price_at_purchase) || 0), 0
  );

  // Available for withdrawal (completed orders older than 7 days)
  const availableForWithdrawal = totalEarnings - pendingClearance;

  // Average order value
  const averageOrderValue = completedOrders.length > 0 
    ? totalEarnings / completedOrders.length 
    : 0;

  // Completion rate
  const totalOrdersWithStatus = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status?.toLowerCase())
  );
  const completionRate = totalOrdersWithStatus.length > 0 
    ? (completedOrders.length / totalOrdersWithStatus.length) * 100 
    : 0;

  // Top performing gigs (by total revenue)
  const gigPerformance = {};
  completedOrders.forEach(order => {
    const gigId = order.gig_id;
    const gigTitle = order.gig_title || 'Unknown Gig';
    const earnings = parseFloat(order.price_at_purchase) || 0;
    
    if (!gigPerformance[gigId]) {
      gigPerformance[gigId] = {
        gigId,
        title: gigTitle,
        totalEarnings: 0,
        orderCount: 0
      };
    }
    
    gigPerformance[gigId].totalEarnings += earnings;
    gigPerformance[gigId].orderCount += 1;
  });

  const topPerformingGigs = Object.values(gigPerformance)
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5);

  // Recent transactions (last 10 completed orders)
  const recentTransactions = completedOrders
    .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      type: 'earning',
      description: order.gig_title || 'Order completed',
      amount: parseFloat(order.price_at_purchase) || 0,
      date: order.completed_at || order.created_at,
      status: 'completed',
      orderId: order.id,
      clientName: order.client_name || 'Unknown Client'
    }));

  return {
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    availableForWithdrawal: Math.round(Math.max(0, availableForWithdrawal) * 100) / 100,
    pendingClearance: Math.round(pendingClearance * 100) / 100,
    withdrawn: 0, // Would need separate withdrawal tracking
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    activeOrders: activeOrders.length,
    pendingOrders: pendingOrders.length,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    topPerformingGigs,
    recentTransactions
  };
}

/**
 * Generate monthly earnings breakdown for charts
 * 
 * @param {Array} orders - Array of order objects
 * @param {number} monthsCount - Number of months to include
 * @returns {Array} Monthly data array
 */
function generateMonthlyBreakdown(orders, monthsCount) {
  const monthlyData = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthStart = monthDate;
    const monthEnd = nextMonthDate;

    // Filter orders for this month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.completed_at || order.created_at);
      return orderDate >= monthStart && orderDate < monthEnd && 
             order.status === 'completed';
    });

    // Calculate earnings for this month
    const monthEarnings = monthOrders.reduce((sum, order) => 
      sum + (parseFloat(order.price_at_purchase) || 0), 0
    );

    monthlyData.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      year: monthDate.getFullYear(),
      earnings: Math.round(monthEarnings * 100) / 100,
      orders: monthOrders.length,
      date: monthDate.toISOString()
    });
  }

  return monthlyData;
}

module.exports = EarningsController;
