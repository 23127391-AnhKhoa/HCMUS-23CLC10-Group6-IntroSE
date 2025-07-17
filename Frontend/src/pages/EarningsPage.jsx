import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import { Calendar, DollarSign, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';

const EarningsPage = () => {
  const { authUser, token } = useAuth();
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisWeek: 0,
    availableForWithdraw: 0,
    pending: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      // Get seller ID from auth context
      const sellerId = authUser?.uuid;
      if (!sellerId) {
        console.error('No seller ID found');
        return;
      }
      
      // Fetch earnings stats from new endpoint we created
      const earningsResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/earnings/stats?period=thisMonth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json();
        const stats = earningsData.data;
        
        setEarnings({
          totalEarnings: stats.totalEarnings || 0,
          thisMonth: stats.totalEarnings || 0, // Using total for thisMonth as example
          lastMonth: 0,
          thisWeek: 0,
          availableForWithdraw: stats.availableBalance || 0,
          pending: stats.pendingEarnings || 0
        });

        // Use monthly breakdown from API
        if (stats.monthlyBreakdown) {
          setMonthlyEarnings(stats.monthlyBreakdown);
        }
      }

      // Fetch recent orders for transactions
      const recentOrdersResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/earnings/recent-orders?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (recentOrdersResponse.ok) {
        const ordersData = await recentOrdersResponse.json();
        // Convert orders to transaction format
        const transactions = (ordersData.data || []).map(order => ({
          transaction_type: 'payment',
          amount: order.price_at_purchase,
          created_at: order.completed_at || order.created_at,
          description: order.gig_title
        }));
        setRecentTransactions(transactions);
      }

    } catch (error) {
      console.error('Error fetching earnings data:', error);
      // Set empty data instead of trying fallback orders API
      setEarnings({
        totalEarnings: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisWeek: 0,
        availableForWithdraw: 0,
        pending: 0
      });
      setMonthlyEarnings([]);
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = (orders) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    let totalEarnings = 0;
    let thisMonthEarnings = 0;
    let lastMonthEarnings = 0;
    let thisWeekEarnings = 0;
    let availableForWithdraw = 0;
    let pendingEarnings = 0;

    // Calculate monthly earnings for chart
    const monthlyData = {};
    
    orders.forEach(order => {
      if (order.seller_id === authUser?.id) {
        const orderDate = new Date(order.created_at);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();
        const price = parseFloat(order.price_at_purchase) || 0;

        // Monthly data for chart
        const monthKey = `${orderYear}-${orderMonth}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + price;

        // Total earnings (all completed orders)
        if (order.status === 'completed') {
          totalEarnings += price;
          availableForWithdraw += price * 0.9; // Assuming 10% platform fee
        }

        // Pending earnings
        if (order.status === 'in_progress' || order.status === 'pending') {
          pendingEarnings += price;
        }

        // This month
        if (orderMonth === thisMonth && orderYear === thisYear && order.status === 'completed') {
          thisMonthEarnings += price;
        }

        // Last month
        if (orderMonth === lastMonth && orderYear === lastMonthYear && order.status === 'completed') {
          lastMonthEarnings += price;
        }

        // This week
        if (orderDate >= startOfWeek && order.status === 'completed') {
          thisWeekEarnings += price;
        }
      }
    });

    // Convert monthly data to array for chart
    const monthlyArray = Object.entries(monthlyData)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          month: new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          earnings: value
        };
      })
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-12); // Last 12 months

    setEarnings({
      totalEarnings,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      thisWeek: thisWeekEarnings,
      availableForWithdraw,
      pending: pendingEarnings
    });

    setMonthlyEarnings(monthlyArray);
  };

  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `$${earnings.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      positive: true
    },
    {
      title: 'This Month',
      value: `$${earnings.thisMonth.toFixed(2)}`,
      icon: Calendar,
      color: 'bg-blue-500',
      change: `${getGrowthPercentage(earnings.thisMonth, earnings.lastMonth) >= 0 ? '+' : ''}${getGrowthPercentage(earnings.thisMonth, earnings.lastMonth)}%`,
      positive: getGrowthPercentage(earnings.thisMonth, earnings.lastMonth) >= 0
    },
    {
      title: 'Available to Withdraw',
      value: `$${earnings.availableForWithdraw.toFixed(2)}`,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '',
      positive: true
    },
    {
      title: 'Pending Earnings',
      value: `$${earnings.pending.toFixed(2)}`,
      icon: Clock,
      color: 'bg-orange-500',
      change: '',
      positive: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarSeller />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarSeller />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your income and financial performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="year">This Year</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              {monthlyEarnings.length > 0 ? (
                <div className="space-y-4">
                  {monthlyEarnings.map((month, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 rounded-full h-2 flex-1 max-w-32">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((month.earnings / Math.max(...monthlyEarnings.map(m => m.earnings))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-16">
                          ${month.earnings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings data available yet</p>
                  <p className="text-sm text-gray-400">Complete some orders to see your earnings here</p>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.transaction_type === 'payment' ? 'Order Payment' : 
                           transaction.transaction_type === 'withdrawal' ? 'Withdrawal' : 
                           'Deposit'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${
                        transaction.transaction_type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.transaction_type === 'withdrawal' ? '-' : '+'}${transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="/withdraw"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Withdraw Earnings
            </a>
            <a
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Target className="h-5 w-5 mr-2" />
              View All Orders
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EarningsPage;
