import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';

const EarningPage = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // Mock data for demonstration
  const earningsData = {
    thisMonth: {
      totalEarnings: 2850,
      availableForWithdrawal: 2650,
      pendingClearance: 200,
      withdrawn: 1200,
      averageOrderValue: 95,
      totalOrders: 30,
      completionRate: 94
    },
    lastMonth: {
      totalEarnings: 3200,
      availableForWithdrawal: 3200,
      pendingClearance: 0,
      withdrawn: 2800,
      averageOrderValue: 106,
      totalOrders: 32,
      completionRate: 97
    },
    thisYear: {
      totalEarnings: 28500,
      availableForWithdrawal: 26500,
      pendingClearance: 2000,
      withdrawn: 18000,
      averageOrderValue: 98,
      totalOrders: 290,
      completionRate: 95
    }
  };

  const transactionData = {
    thisMonth: [
      { id: 1, type: 'earning', description: 'Logo Design for Tech Startup', amount: 150, date: '2024-01-15', status: 'completed' },
      { id: 2, type: 'earning', description: 'Website Development', amount: 500, date: '2024-01-14', status: 'completed' },
      { id: 3, type: 'withdrawal', description: 'Withdrawal to Bank Account', amount: -200, date: '2024-01-13', status: 'completed' },
      { id: 4, type: 'earning', description: 'Social Media Graphics', amount: 75, date: '2024-01-12', status: 'pending' },
      { id: 5, type: 'earning', description: 'Business Card Design', amount: 45, date: '2024-01-11', status: 'completed' },
      { id: 6, type: 'earning', description: 'E-commerce Website', amount: 800, date: '2024-01-10', status: 'completed' },
      { id: 7, type: 'fee', description: 'Service Fee', amount: -25, date: '2024-01-09', status: 'completed' },
      { id: 8, type: 'earning', description: 'Mobile App UI Design', amount: 350, date: '2024-01-08', status: 'completed' }
    ],
    lastMonth: [
      { id: 9, type: 'earning', description: 'Corporate Website', amount: 1200, date: '2023-12-28', status: 'completed' },
      { id: 10, type: 'earning', description: 'Brand Identity Package', amount: 600, date: '2023-12-25', status: 'completed' },
      { id: 11, type: 'withdrawal', description: 'Withdrawal to PayPal', amount: -500, date: '2023-12-20', status: 'completed' },
      { id: 12, type: 'earning', description: 'Landing Page Design', amount: 300, date: '2023-12-18', status: 'completed' }
    ],
    thisYear: [
      { id: 13, type: 'earning', description: 'Year-end Summary - Multiple Projects', amount: 28500, date: '2024-01-01', status: 'completed' },
      { id: 14, type: 'withdrawal', description: 'Total Withdrawals This Year', amount: -18000, date: '2024-01-01', status: 'completed' }
    ]
  };

  const monthlyData = [
    { month: 'Jan', earnings: 2850, orders: 30 },
    { month: 'Feb', earnings: 3200, orders: 32 },
    { month: 'Mar', earnings: 2950, orders: 28 },
    { month: 'Apr', earnings: 3100, orders: 31 },
    { month: 'May', earnings: 2800, orders: 26 },
    { month: 'Jun', earnings: 3400, orders: 35 },
    { month: 'Jul', earnings: 3600, orders: 38 },
    { month: 'Aug', earnings: 3300, orders: 34 },
    { month: 'Sep', earnings: 3150, orders: 32 },
    { month: 'Oct', earnings: 3250, orders: 33 },
    { month: 'Nov', earnings: 3100, orders: 31 },
    { month: 'Dec', earnings: 2850, orders: 30 }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchEarnings = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEarnings(earningsData[selectedPeriod]);
      setTransactions(transactionData[selectedPeriod]);
      setLoading(false);
    };

    fetchEarnings();
  }, [selectedPeriod]);

  const handleWithdrawal = () => {
    alert('Withdrawal feature coming soon!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning':
        return '💰';
      case 'withdrawal':
        return '🏦';
      case 'fee':
        return '💳';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarSeller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarSeller />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Earnings Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your income and manage withdrawals</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <button
              onClick={() => navigate('/profile_seller')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">${earnings?.totalEarnings || 0}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available for Withdrawal</p>
                <p className="text-2xl font-bold text-blue-600">${earnings?.availableForWithdrawal || 0}</p>
              </div>
              <div className="text-3xl">🏦</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Clearance</p>
                <p className="text-2xl font-bold text-orange-600">${earnings?.pendingClearance || 0}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-purple-600">${earnings?.withdrawn || 0}</p>
              </div>
              <div className="text-3xl">💸</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Earnings Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Earnings Trend</h2>
              <div className="h-64 flex items-end justify-between space-x-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg min-h-[20px] flex items-end justify-center"
                      style={{ height: `${(data.earnings / 4000) * 200}px` }}
                    >
                      <span className="text-white text-xs font-medium mb-1">${data.earnings}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Transactions</h2>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Withdrawal Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdrawal</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-600">${earnings?.availableForWithdrawal || 0}</p>
                </div>
                <button
                  onClick={handleWithdrawal}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={!earnings?.availableForWithdrawal}
                >
                  Withdraw Funds
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Minimum withdrawal: $50
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-green-600">${earnings?.averageOrderValue || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold text-blue-600">{earnings?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-purple-600">{earnings?.completionRate || 0}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-gig')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Gig
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  View All Orders
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="text-2xl">🏦</div>
                  <div>
                    <p className="font-medium">Bank Account</p>
                    <p className="text-sm text-gray-500">****1234</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="text-2xl">💳</div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-gray-500">user@example.com</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EarningPage;
