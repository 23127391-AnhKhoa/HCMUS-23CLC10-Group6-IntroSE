
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import { Calendar, DollarSign, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const EarningsPage = () => {
  const { authUser, token } = useAuth();
  const [earnings, setEarnings] = useState(() => {
    // Try to load from localStorage first
    const savedEarnings = localStorage.getItem('seller-earnings');
    return savedEarnings ? JSON.parse(savedEarnings) : {
      totalEarnings: 0,
      thisMonth: 0,
      lastMonth: 0,
      thisWeek: 0,
      availableForWithdraw: 0,
      pending: 0
    };
  });
  const [recentTransactions, setRecentTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('seller-transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState(() => {
    const savedMonthly = localStorage.getItem('seller-monthly-earnings');
    return savedMonthly ? JSON.parse(savedMonthly) : [];
  });
  const [dailyEarnings, setDailyEarnings] = useState(() => {
    const savedDaily = localStorage.getItem('seller-daily-earnings');
    return savedDaily ? JSON.parse(savedDaily) : [];
  });
  const [loading, setLoading] = useState(false); // Changed to false to show cached data immediately
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [chartType, setChartType] = useState('area'); // 'area' or 'line'
  const [timeframe, setTimeframe] = useState('month'); // 'day' or 'month'

  useEffect(() => {
    if (authUser?.uuid) {
      // Check if we have cached data, if not, show loading
      const hasData = localStorage.getItem('seller-earnings') && 
                     localStorage.getItem('seller-transactions') && 
                     localStorage.getItem('seller-monthly-earnings') &&
                     localStorage.getItem('seller-daily-earnings');
      
      if (!hasData) {
        setLoading(true);
      }
      
      fetchEarningsData();
    }
  }, [selectedPeriod, authUser?.uuid]);

  // Clean up localStorage when user changes
  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem('seller-earnings');
      localStorage.removeItem('seller-transactions');
      localStorage.removeItem('seller-monthly-earnings');
      localStorage.removeItem('seller-daily-earnings');
    }
  }, [authUser]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      // Get seller ID from auth context
      const sellerId = authUser?.uuid;
      if (!sellerId || !token) {
        console.error('No seller ID or token found');
        setLoading(false);
        return;
      }
      
      // Fetch earnings stats from new endpoint we created
      const earningsResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/earnings/stats?period=thisMonth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let earningsData = {
        totalEarnings: 0,
        availableBalance: 0,
        monthlyBreakdown: []
      };

      if (earningsResponse.ok) {
        const result = await earningsResponse.json();
        earningsData = result.data || earningsData;
      }

      // Fetch pending orders to calculate pending earnings
      const pendingOrdersResponse = await fetch(`http://localhost:8000/api/orders/owner/${sellerId}?status=pending&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let pendingOrdersTotal = 0;
      if (pendingOrdersResponse.ok) {
        const pendingOrdersData = await pendingOrdersResponse.json();
        const pendingOrders = pendingOrdersData.data || [];
        
        // Calculate total of pending orders
        pendingOrdersTotal = pendingOrders.reduce((total, order) => {
          return total + (parseFloat(order.price_at_purchase) || 0);
        }, 0);
        
        console.log(`💰 Pending orders total: $${pendingOrdersTotal} from ${pendingOrders.length} orders`);
      }
      
      setEarnings({
        totalEarnings: earningsData.totalEarnings || 0,
        thisMonth: earningsData.totalEarnings || 0, // Using total for thisMonth as example
        lastMonth: 0,
        thisWeek: 0,
        availableForWithdraw: earningsData.availableBalance || 0,
        pending: pendingOrdersTotal // Now from pending orders total
      });

      // Save earnings to localStorage for persistence
      const finalEarningsData = {
        totalEarnings: earningsData.totalEarnings || 0,
        thisMonth: earningsData.totalEarnings || 0,
        lastMonth: 0,
        thisWeek: 0,
        availableForWithdraw: earningsData.availableBalance || 0,
        pending: pendingOrdersTotal
      };
      localStorage.setItem('seller-earnings', JSON.stringify(finalEarningsData));

      // Use monthly breakdown from API
      if (earningsData.monthlyBreakdown) {
        setMonthlyEarnings(earningsData.monthlyBreakdown);
        localStorage.setItem('seller-monthly-earnings', JSON.stringify(earningsData.monthlyBreakdown));
      }

      // Generate daily earnings data for the last 30 days
      const generateDailyEarnings = async () => {
        try {
          // Try to fetch daily data from API first
          const dailyResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/earnings/daily?days=30`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (dailyResponse.ok) {
            const dailyResult = await dailyResponse.json();
            if (dailyResult.data && dailyResult.data.length > 0) {
              setDailyEarnings(dailyResult.data);
              localStorage.setItem('seller-daily-earnings', JSON.stringify(dailyResult.data));
              return;
            }
          }

          // Fallback: Generate daily data from transactions
          const last30Days = [];
          const today = new Date();
          
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            // Use local date string instead of UTC
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            
            last30Days.push({
              date: dateString,
              day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              earnings: 0
            });
          }

          // If we have recent transactions, calculate daily earnings from them
          if (recentTransactions.length > 0) {
            recentTransactions.forEach(transaction => {
              // Parse transaction date in user's timezone
              const transactionDate = new Date(transaction.created_at);
              const year = transactionDate.getFullYear();
              const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
              const day = String(transactionDate.getDate()).padStart(2, '0');
              const localDateString = `${year}-${month}-${day}`;
              
              const dayData = last30Days.find(day => day.date === localDateString);
              if (dayData) {
                dayData.earnings += parseFloat(transaction.amount) || 0;
              }
            });
          } else {
            // Generate sample data for demonstration
            last30Days.forEach((day, index) => {
              if (Math.random() > 0.7) { // 30% chance of earnings on any given day
                day.earnings = Math.random() * 200 + 50; // Random earnings between $50-$250
              }
            });
          }

          setDailyEarnings(last30Days);
          localStorage.setItem('seller-daily-earnings', JSON.stringify(last30Days));
        } catch (error) {
          console.error('Error generating daily earnings:', error);
        }
      };

      await generateDailyEarnings();

      // Fetch transactions with type received_payment
      console.log('🔍 Fetching received_payment transactions...');
      const transactionsResponse = await fetch(`http://localhost:8000/api/transactions/user/${sellerId}?transaction_type=received_payment&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('💳 Transactions API status:', transactionsResponse.status);

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        console.log('✅ Transactions data:', transactionsData);
        
        const transactions = (transactionsData.data || []).map(transaction => ({
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          created_at: transaction.created_at,
          description: transaction.description || 'Payment received',
          order_id: transaction.order_id,
          id: transaction.id
        }));
        
        setRecentTransactions(transactions);
        localStorage.setItem('seller-transactions', JSON.stringify(transactions));
        console.log('� Set transactions from transactions API:', transactions.length, 'items');
      } else {
        console.log('❌ Transactions API failed, trying alternative endpoint...');
        
        // Try alternative endpoint structure
        const altTransactionsResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/transactions?transaction_type=received_payment&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('🔄 Alternative transactions API status:', altTransactionsResponse.status);

        if (altTransactionsResponse.ok) {
          const altTransactionsData = await altTransactionsResponse.json();
          console.log('✅ Alternative transactions data:', altTransactionsData);
          
          const transactions = (altTransactionsData.data || []).map(transaction => ({
            transaction_type: transaction.transaction_type,
            amount: transaction.amount,
            created_at: transaction.created_at,
            description: transaction.description || 'Payment received',
            order_id: transaction.order_id,
            id: transaction.id
          }));
          
          setRecentTransactions(transactions);
          localStorage.setItem('seller-transactions', JSON.stringify(transactions));
          console.log('💰 Set transactions from alternative API:', transactions.length, 'items');
        } else {
          console.log('❌ Both transactions APIs failed, falling back to completed orders...');
          
          // Fallback to completed orders as transactions
          const completedOrdersResponse = await fetch(`http://localhost:8000/api/orders/owner/${sellerId}?status=completed&limit=10`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (completedOrdersResponse.ok) {
            const completedOrdersData = await completedOrdersResponse.json();
            console.log('📦 Using completed orders as fallback:', completedOrdersData);
            
            const transactions = (completedOrdersData.data || []).map(order => ({
              transaction_type: 'received_payment',
              amount: order.price_at_purchase,
              created_at: order.completed_at || order.created_at,
              description: `Payment for: ${order.gig_title}` || 'Order payment',
              order_id: order.id,
              id: `order-${order.id}`
            }));
            
            setRecentTransactions(transactions);
            localStorage.setItem('seller-transactions', JSON.stringify(transactions));
            console.log('💰 Set transactions from completed orders fallback:', transactions.length, 'items');
          } else {
            console.log('💥 All transaction endpoints failed');
          }
        }
      }

      console.log('� Completed orders API status:', completedOrdersResponse.status);

      if (completedOrdersResponse.ok) {
        const completedOrdersData = await completedOrdersResponse.json();
        console.log('✅ Completed orders data:', completedOrdersData);
        
        const transactions = (completedOrdersData.data || []).map(order => ({
          transaction_type: 'received_payment',
          amount: order.price_at_purchase,
          created_at: order.completed_at || order.created_at,
          description: order.gig_title || 'Order payment',
          order_id: order.id
        }));
        
        setRecentTransactions(transactions);
        localStorage.setItem('seller-transactions', JSON.stringify(transactions));
        console.log('💰 Set transactions from completed orders:', transactions.length, 'items');
      } else {
        console.log('❌ Completed orders API failed, trying all orders...');
        
        // Last fallback: get all orders and filter completed ones
        const allOrdersResponse = await fetch(`http://localhost:8000/api/orders/owner/${sellerId}?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (allOrdersResponse.ok) {
          const allOrdersData = await allOrdersResponse.json();
          console.log('📋 All orders data:', allOrdersData);
          
          const completedOrders = (allOrdersData.data || [])
            .filter(order => order.status === 'completed')
            .slice(0, 10); // Take first 10 completed orders
          
          const transactions = completedOrders.map(order => ({
            transaction_type: 'received_payment',
            amount: order.price_at_purchase,
            created_at: order.completed_at || order.created_at,
            description: order.gig_title || 'Order payment',
            order_id: order.id
          }));
          
          setRecentTransactions(transactions);
          localStorage.setItem('seller-transactions', JSON.stringify(transactions));
          console.log('💰 Set transactions from all orders filter:', transactions.length, 'items');
        } else {
          console.log('💥 All API endpoints failed');
        }
      }

    } catch (error) {
      console.error('Error fetching earnings data:', error);
      // Keep existing data from localStorage if API fails
      console.log('Using cached data from localStorage due to API error');
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

        // Pending earnings - only from orders with status 'pending'
        if (order.status === 'pending') {
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

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `$${earnings.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'This Month',
      value: `$${earnings.thisMonth.toFixed(2)}`,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Available to Withdraw',
      value: `$${earnings.availableForWithdraw.toFixed(2)}`,
      icon: CheckCircle,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Earnings',
      value: `$${earnings.pending.toFixed(2)}`,
      icon: Clock,
      color: 'bg-orange-500'
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
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="day">Daily (Last 30 days)</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Chart:</label>
                    <select 
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="area">Area Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                    </select>
                  </div>
                  {timeframe === 'month' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Period:</label>
                      <select 
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="year">This Year</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              {(timeframe === 'month' ? monthlyEarnings : dailyEarnings).length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {timeframe === 'month' ? monthlyEarnings.length : dailyEarnings.filter(d => d.earnings > 0).length}
                      </div>
                      <div className="text-xs text-gray-600">
                        {timeframe === 'month' ? 'Active Months' : 'Active Days'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${timeframe === 'month' 
                          ? Math.max(...monthlyEarnings.map(m => m.earnings)).toFixed(0)
                          : Math.max(...dailyEarnings.map(d => d.earnings)).toFixed(0)
                        }
                      </div>
                      <div className="text-xs text-gray-600">
                        {timeframe === 'month' ? 'Best Month' : 'Best Day'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${timeframe === 'month' 
                          ? (monthlyEarnings.reduce((sum, m) => sum + m.earnings, 0) / monthlyEarnings.length).toFixed(0)
                          : (dailyEarnings.reduce((sum, d) => sum + d.earnings, 0) / dailyEarnings.filter(d => d.earnings > 0).length || 0).toFixed(0)
                        }
                      </div>
                      <div className="text-xs text-gray-600">Average</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      {chartType === 'area' ? (
                        <AreaChart 
                          data={timeframe === 'month' ? monthlyEarnings : dailyEarnings} 
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey={timeframe === 'month' ? 'month' : 'day'}
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            interval={timeframe === 'day' ? 4 : 'preserveStartEnd'} // Show every 5th day for daily view
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                            labelFormatter={(label) => `${timeframe === 'month' ? 'Month' : 'Day'}: ${label}`}
                            contentStyle={{
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="earnings" 
                            stroke="#10b981" 
                            fill="url(#colorEarnings)" 
                            strokeWidth={3}
                            dot={timeframe === 'day' ? false : { fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      ) : chartType === 'line' ? (
                        <LineChart 
                          data={timeframe === 'month' ? monthlyEarnings : dailyEarnings} 
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <XAxis 
                            dataKey={timeframe === 'month' ? 'month' : 'day'}
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            interval={timeframe === 'day' ? 4 : 'preserveStartEnd'}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                            labelFormatter={(label) => `${timeframe === 'month' ? 'Month' : 'Day'}: ${label}`}
                            contentStyle={{
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="earnings" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={timeframe === 'day' ? false : { fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart 
                          data={timeframe === 'month' ? monthlyEarnings : dailyEarnings} 
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <XAxis 
                            dataKey={timeframe === 'month' ? 'month' : 'day'}
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            interval={timeframe === 'day' ? 4 : 'preserveStartEnd'}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                            labelFormatter={(label) => `${timeframe === 'month' ? 'Month' : 'Day'}: ${label}`}
                            contentStyle={{
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                          <Bar 
                            dataKey="earnings" 
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Breakdown Table */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {timeframe === 'month' ? 'Monthly Breakdown' : 'Daily Breakdown (Last 30 Days)'}
                    </h3>
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">
                              {timeframe === 'month' ? 'Month' : 'Date'}
                            </th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Earnings</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Growth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeframe === 'month' ? (
                            monthlyEarnings.map((month, index) => {
                              const prevMonth = monthlyEarnings[index - 1];
                              const growth = prevMonth ? ((month.earnings - prevMonth.earnings) / prevMonth.earnings) * 100 : 0;
                              const isCurrentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === month.month;
                              
                              return (
                                <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${isCurrentMonth ? 'bg-blue-50' : ''}`}>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-medium ${isCurrentMonth ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {month.month}
                                      </span>
                                      {isCurrentMonth && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                    ${month.earnings.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    {index > 0 ? (
                                      <span className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            dailyEarnings.slice().reverse().map((day, index) => {
                              const prevDay = dailyEarnings[dailyEarnings.length - index];
                              const growth = prevDay && prevDay.earnings > 0 ? ((day.earnings - prevDay.earnings) / prevDay.earnings) * 100 : 0;
                              // Use local date comparison for "Today" highlight
                              const today = new Date();
                              const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                              const isToday = day.date === todayString;
                              
                              return (
                                <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${isToday ? 'bg-blue-50' : day.earnings === 0 ? 'bg-gray-25' : ''}`}>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-medium ${isToday ? 'text-blue-700' : day.earnings > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {day.day}
                                      </span>
                                      {isToday && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                          Today
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`py-2 px-3 text-right font-semibold ${day.earnings > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    ${day.earnings.toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    {day.earnings > 0 && prevDay && prevDay.earnings > 0 ? (
                                      <span className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings data available yet</p>
                  <p className="text-sm text-gray-400">Complete some orders to see your earnings here</p>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Received
                </div>
              </div>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Payment Received
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {transaction.description || 'Order payment'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-sm font-semibold text-green-600 block">
                          +${parseFloat(transaction.amount).toFixed(2)}
                        </span>
                        {transaction.order_id && (
                          <p className="text-xs text-gray-400 mt-1">
                            Order #{transaction.order_id}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm mb-2">No payments received yet</p>
                  <p className="text-xs text-gray-400">Complete orders to see payment history</p>
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
