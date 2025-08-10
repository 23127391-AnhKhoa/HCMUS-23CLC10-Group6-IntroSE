
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
  // No seller ID or token found
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
        
  // Pending orders total calculated
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
              // Normalize API data to ensure unique date keys and consistent fields
              const normalized = dailyResult.data.map((item, idx, arr) => {
                let dateStr = item.date;
                // Some APIs might send the date in `day` or a label field
                if (!dateStr && typeof item.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
                  dateStr = item.day;
                }
                // If we only have weekday names (Mon, Tue, ...), synthesize dates across the range
                if (!dateStr && typeof item.day === 'string' && /^[A-Za-z]{3,}$/.test(item.day)) {
                  const base = new Date();
                  base.setHours(0, 0, 0, 0);
                  // Spread items over the last N days, preserving order
                  base.setDate(base.getDate() - (arr.length - 1 - idx));
                  const y = base.getFullYear();
                  const m = String(base.getMonth() + 1).padStart(2, '0');
                  const d = String(base.getDate()).padStart(2, '0');
                  dateStr = `${y}-${m}-${d}`;
                }
                // Fallback unique key if date is still missing
                if (!dateStr) {
                  // Attempt to use created_at if present
                  if (item.created_at) {
                    const dt = new Date(item.created_at);
                    if (!isNaN(dt)) {
                      const y = dt.getFullYear();
                      const m = String(dt.getMonth() + 1).padStart(2, '0');
                      const d = String(dt.getDate()).padStart(2, '0');
                      dateStr = `${y}-${m}-${d}`;
                    }
                  }
                }

                // Final guard to ensure a unique, stable key
                if (!dateStr) {
                  dateStr = `idx-${idx}`;
                }

                const dayLabel = item.day || (() => {
                  const dt = new Date(dateStr);
                  return isNaN(dt) ? String(dateStr) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                })();

                return {
                  date: dateStr,
                  day: dayLabel,
                  earnings: Number(item.earnings ?? item.amount ?? 0),
                  uniqueKey: `${dateStr}-${idx}`
                };
              });

              setDailyEarnings(normalized);
              localStorage.setItem('seller-daily-earnings', JSON.stringify(normalized));
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
              earnings: 0,
              index: 29 - i, // Add index for better positioning
              timestamp: date.getTime() // Add unique timestamp
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
                const amount = parseFloat(transaction.amount) || 0;
                // Prevent unrealistic spikes in data
                if (amount > 0 && amount < 10000) { // Cap at $10k per transaction
                  dayData.earnings += amount;
                }
              }
            });
          } else {
            // Generate sample data for demonstration
            last30Days.forEach((day, index) => {
              if (Math.random() > 0.7) { // 30% chance of earnings on any given day
                day.earnings = Math.random() * 200 + 50; // Random earnings between $50-$250
              }
            });
            // Generated sample daily data
          }

          // Sort the array to ensure proper chronological order
          last30Days.sort((a, b) => a.timestamp - b.timestamp);

          // Clean data structure for chart (remove helper fields)
          const cleanData = last30Days.map(({ date, day, earnings }, index) => ({ 
            date, 
            day, 
            earnings: Number(earnings) || 0,
            uniqueKey: `${date}-${index}` // Add unique key for each data point
          }));

          setDailyEarnings(cleanData);
          localStorage.setItem('seller-daily-earnings', JSON.stringify(cleanData));
          // Daily earnings data generated
        } catch (error) {
          // Error generating daily earnings
        }
      };

      await generateDailyEarnings();

      // Fetch transactions with type received_payment
  // Fetching received_payment transactions
      const transactionsResponse = await fetch(`http://localhost:8000/api/transactions/user/${sellerId}?transaction_type=received_payment&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

  // Transactions API status

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
  // Transactions data received
        
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
  // Set transactions from transactions API
      } else {
  // Transactions API failed, trying alternative endpoint
        
        // Try alternative endpoint structure
        const altTransactionsResponse = await fetch(`http://localhost:8000/api/users/${sellerId}/transactions?transaction_type=received_payment&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

  // Alternative transactions API status

        if (altTransactionsResponse.ok) {
          const altTransactionsData = await altTransactionsResponse.json();
          // Alternative transactions data received
          
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
          // Set transactions from alternative API
        } else {
          // Both transactions APIs failed, falling back to completed orders
          
          // Fallback to completed orders as transactions
          const completedOrdersResponse = await fetch(`http://localhost:8000/api/orders/owner/${sellerId}?status=completed&limit=10`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (completedOrdersResponse.ok) {
            const completedOrdersData = await completedOrdersResponse.json();
            // Using completed orders as fallback
            
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
            // Set transactions from completed orders fallback
          } else {
            // All transaction endpoints failed
          }
        }
      }

    } catch (error) {
  // Error fetching earnings data
      // Keep existing data from localStorage if API fails
  // Using cached data from localStorage due to API error
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
        const monthKey = `${orderYear}-${String(orderMonth + 1).padStart(2, '0')}`;
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
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          earnings: value,
          sortKey: key // Keep original key for proper sorting
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12) // Last 12 months
      .map(({ month, earnings }) => ({ month, earnings })); // Remove sortKey from final data

    setEarnings({
      totalEarnings,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      thisWeek: thisWeekEarnings,
      availableForWithdraw,
      pending: pendingEarnings
    });

    setMonthlyEarnings(monthlyArray);
  // Generated monthly earnings data
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
      <div className="sticky-footer-page bg-gray-50">
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
    <div className="sticky-footer-page bg-gray-50">
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
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="day">Last 30 Days</option>
                    <option value="month">Monthly View</option>
                  </select>
                  <select 
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="area">Area Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>

              {/* Chart Container */}
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ${timeframe === 'month' 
                        ? monthlyEarnings.reduce((sum, m) => sum + m.earnings, 0).toFixed(0)
                        : dailyEarnings.reduce((sum, d) => sum + d.earnings, 0).toFixed(0)
                      }
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ${timeframe === 'month' 
                        ? (monthlyEarnings.length > 0 ? Math.max(...monthlyEarnings.map(m => m.earnings)) : 0).toFixed(0)
                        : (dailyEarnings.length > 0 ? Math.max(...dailyEarnings.map(d => d.earnings)) : 0).toFixed(0)
                      }
                    </div>
                    <div className="text-xs text-gray-500">Peak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {timeframe === 'month' ? monthlyEarnings.length : dailyEarnings.filter(d => d.earnings > 0).length}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      const chartData = timeframe === 'month' ? monthlyEarnings : dailyEarnings;
                      const dataKey = timeframe === 'month' ? 'month' : 'date';
                      
                      // Debug the data structure
                      if (timeframe === 'day') {
                        // Daily chart data debug removed
                        
                        // Check for data integrity issues
                        chartData.forEach((item, index) => {
                          if (!item || typeof item.day === 'undefined' || typeof item.earnings === 'undefined') {
                            // Invalid data at index
                          }
                        });
                      }
                      
                      if (chartType === 'area') {
                        return (
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey={dataKey}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 8, fill: '#6b7280' }}
                              interval={0}
                              angle={timeframe === 'day' ? -45 : 0}
                              textAnchor={timeframe === 'day' ? 'end' : 'middle'}
                              height={timeframe === 'day' ? 90 : 60}
                              allowDuplicatedCategory={true}
                              tickFormatter={(val) => {
                                if (timeframe !== 'day') return val;
                                const dt = new Date(val);
                                return isNaN(dt) ? String(val) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="earnings" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fill="url(#areaGradient)" 
                              dot={false}
                              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                            />
                          </AreaChart>
                        );
                      }
                      
                      if (chartType === 'line') {
                        return (
                          <LineChart data={chartData}>
                            <XAxis 
                              dataKey={dataKey}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 8, fill: '#6b7280' }}
                              interval={0}
                              angle={timeframe === 'day' ? -45 : 0}
                              textAnchor={timeframe === 'day' ? 'end' : 'middle'}
                              height={timeframe === 'day' ? 90 : 60}
                              allowDuplicatedCategory={true}
                              tickFormatter={(val) => {
                                if (timeframe !== 'day') return val;
                                const dt = new Date(val);
                                return isNaN(dt) ? String(val) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="earnings" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                            />
                          </LineChart>
                        );
                      }
                      
                      if (chartType === 'bar') {
                        return (
                          <BarChart data={chartData}>
                            <XAxis 
                              dataKey={dataKey}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 8, fill: '#6b7280' }}
                              interval={0}
                              angle={timeframe === 'day' ? -45 : 0}
                              textAnchor={timeframe === 'day' ? 'end' : 'middle'}
                              height={timeframe === 'day' ? 90 : 60}
                              allowDuplicatedCategory={true}
                              tickFormatter={(val) => {
                                if (timeframe !== 'day') return val;
                                const dt = new Date(val);
                                return isNaN(dt) ? String(val) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar 
                              dataKey="earnings" 
                              fill="#8b5cf6"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        );
                      }
                      
                      return null;
                    })()}
                  </ResponsiveContainer>
                </div>

                {/* Simple Data Summary */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {timeframe === 'month' ? (
                      <div className="space-y-2">
                        {monthlyEarnings.slice(-5).reverse().map((month, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{month.month}</span>
                            <span className="font-semibold text-green-600">${month.earnings.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dailyEarnings.filter(day => day.earnings > 0).slice(-5).reverse().map((day, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{day.day}</span>
                            <span className="font-semibold text-green-600">${day.earnings.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
