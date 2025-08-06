import React, { useState, useEffect, useCallback } from 'react';
import { FiHome, FiList, FiTrendingUp, FiUsers, FiSettings, FiHelpCircle, FiArrowUp, FiArrowDown, FiMoreVertical, FiShoppingCart, FiDollarSign, FiBarChart, FiFileText, FiAlertCircle, FiUser, FiLogOut, FiKey, FiChevronDown } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, message, Dropdown } from 'antd';

// Helper functions (đặt ở đầu file AdminDashboard.js)
const SettingsDropdown = () => {
  const { authUser, logout } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const settingsItems = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center px-3 py-2 hover:bg-gray-50 rounded transition-colors">
          <FiUser className="mr-3 text-gray-600" />
          <span>Admin Profile</span>
        </div>
      ),
      onClick: () => setProfileModalVisible(true)
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center px-3 py-2 hover:bg-red-50 rounded transition-colors text-red-600">
          <FiLogOut className="mr-3" />
          <span>Logout</span>
        </div>
      ),
      onClick: () => {
        logout();
        window.location.href = '/auth';
      }
    }
  ];

  return (
    <>
      <Dropdown
        menu={{ items: settingsItems }}
        trigger={['click']}
        placement="topLeft"
      >
        <button className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth w-full">
          <FiSettings className="mr-3" />
          <span className="flex-1 text-left">Settings</span>
          <FiChevronDown className="text-sm" />
        </button>
      </Dropdown>

      <AdminProfileModal 
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        admin={authUser}
      />
    </>
  );
};

const AdminProfileModal = ({ visible, onClose, admin }) => {
  if (!admin) return null;

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FiUser className="text-blue-600" />
          <span className="text-xl font-bold">Admin Profile</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{admin.fullname || admin.username}</h3>
            <p className="text-gray-600">{admin.email}</p>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
              Administrator
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Username:</p>
                <p className="font-medium">{admin.username}</p>
              </div>
              <div>
                <p className="text-gray-600">Role:</p>
                <p className="font-medium capitalize">{admin.role}</p>
              </div>
              <div>
                <p className="text-gray-600">User ID:</p>
                <p className="font-medium text-xs">{admin.uuid}</p>
              </div>
              <div>
                <p className="text-gray-600">Balance:</p>
                <p className="font-medium">${admin.balance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ChangePasswordModal = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { token } = useAuth();

  // Reset form khi modal đóng/mở
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra current password
    if (!currentPassword || currentPassword.trim() === '') {
      newErrors.currentPassword = 'Current password is required';
    }

    // Kiểm tra new password
    if (!newPassword || newPassword.trim() === '') {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Kiểm tra confirm password
    if (!confirmPassword || confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    // Validate form trước
    if (!validateForm()) {
      message.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      console.log('Sending password change request...');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      message.success('Password changed successfully! Please log in again with your new password.');
      resetForm();
      onClose();

    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi modal đóng
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FiKey className="text-orange-600" />
          <span className="text-xl font-bold">Change Password</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) {
                  setErrors(prev => ({ ...prev, currentPassword: null }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors(prev => ({ ...prev, newPassword: null }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: null }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Password Requirements:</strong>
              <br />• Minimum 6 characters
              <br />• Must be different from current password
              <br />• Use a strong, unique password
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Helper functions (đặt ở đầu file AdminDashboard.js)
const getMonthLabels = () => {
    const labels = [];
    const date = new Date();
    for (let i = 8; i >= 0; i--) {
        const d = new Date(date);
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        // Nếu tháng là Jan, Dec của năm trước sẽ được hiển thị
        if (i > 0 && d.getMonth() === 11) {
             labels.push(`${parseInt(year) -1 }/${month}`);
        } else if (d.getMonth() === 0 && labels.length > 0 && !labels[labels.length -1].includes(year) ) {
             labels.push(`${year}/${month}`);
        }
        else {
             labels.push(month);
        }
    }
    //Đoạn code trên hoạt động không đúng, đây là đoạn code đúng
    labels.length = 0;
    for (let i = 8; i >= 0; i--) {
        const d = new Date(date);
        d.setMonth(date.getMonth() - i);
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        
        let label = month;
        if (i === 8 || d.getMonth() === 0) { // Add year for the first month shown or for January
             label = `${year}/${month}`;
        }
        labels.push(label);
    }
    return labels;
};


const getDayLabels = () => {
  const labels = [];
  const date = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(date);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    // Hiển thị tháng nếu là ngày đầu tiên trong chuỗi hoặc ngày 1 của tháng
    if (i === 6 || day === 1) {
      labels.push(`${month}/${day}`);
    } else {
      labels.push(day.toString());
    }
  }
  return labels;
};

// Dữ liệu giả cho biểu đồ (như yêu cầu)
const salesOverviewDataMock = getMonthLabels().map(month => ({
  name: month,
  sales: Math.floor(Math.random() * 250) + 250, // Giữ hình dạng ngẫu nhiên
}));
const visitorsDataMock = getDayLabels().map(day => ({
  name: day,
  dark: Math.floor(Math.random() * 50) + 120,
  light: Math.floor(Math.random() * 40) + 80,
}));


const Sidebar = () => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center justify-center mb-10 p-2">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/admindashboard" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">
            <FiHome className="mr-3" /> Dashboard
          </a>
          <a href="/admin/manage-reported-gigs" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiAlertCircle className="mr-3" /> Report
          </a>
          <a href="/admin/servicemanagement" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiTrendingUp className="mr-3" /> Services Management
          </a>
          <a href="/admin/usermanagement" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiUsers className="mr-3" /> User Management
          </a>
          <a href="/admin/earnings" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiDollarSign className="mr-3" /> Earnings
          </a>
        </nav>
      </div>
      <div className="flex flex-col space-y-2">
        <SettingsDropdown />
      </div>
    </div>
);

const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-6 px-4">
    {/* Left: Title */}
    <h1 className="text-3xl font-bold ">Admin Dashboard</h1>

   
  </div>
);

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 font-semibold">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full text-white">
                {icon}
            </div>
        </div>
    );
};

const ChartCard = ({ title, subTitle, change, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{subTitle}</p>
            </div>
            <div className="flex items-center text-sm text-green-500 font-bold">
                <FiArrowUp className="mr-1"/>
                {change}
            </div>
        </div>
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

const TableCard = ({ title, headers, data, renderRow }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b">
                    {headers.map(h => <th key={h} className="text-left font-semibold text-gray-500 pb-3">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => renderRow(item, index))}
            </tbody>
        </table>
    </div>
);


// --- Component Chính ---
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        if (result.status === 'success') {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  const { statCards, chartData, topBuyers, topServices } = dashboardData;

  const statsDataReal = [
      { title: "Today's Revenue", value: `$${statCards.totalSales.toFixed(2)}`, icon: <FiShoppingCart /> },
      { title: "Today's Profit", value: `$${statCards.totalProfit.toFixed(2)}`, icon: <FiBarChart /> },
      { title: "Today Deposit", value: `$${statCards.totalDeposits.toFixed(2)}`, icon: <FiDollarSign /> },
      { title: "New Orders", value: statCards.totalNewOrders, icon: <FiFileText /> },
  ];
  
  // Format Y-axis tick cho biểu đồ Sales
  const dollarFormatter = (value) => `$${value}`;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <DashboardHeader />
        
        {/* Stat Cards với dữ liệu thật */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsDataReal.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>

        {/* Charts với doanh thu và lợi nhuận */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-3">
                <ChartCard title="Revenue & Profit Overview" subTitle="Daily revenue and profit analysis" change="Based on transactions">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={dollarFormatter}/>
                        <Tooltip 
                            formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Profit']}
                            labelFormatter={(label) => `Day: ${label}`}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stackId="1"
                            stroke="#0ea5e9" 
                            fill="url(#colorRevenue)" 
                            strokeWidth={2} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="profit" 
                            stackId="2"
                            stroke="#10b981" 
                            fill="url(#colorProfit)" 
                            strokeWidth={2} 
                        />
                    </AreaChart>
                </ChartCard>
            </div>
            <div className="lg:col-span-2">
                <ChartCard title="Daily Transactions" subTitle="Payment vs Received Payment" change="Real-time data">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={dollarFormatter}/>
                        <Tooltip 
                            formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'payments' ? 'Payments' : 'Received']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="payments" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="receivedPayments" 
                            stroke="#ef4444" 
                            strokeWidth={3} 
                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                </ChartCard>
            </div>
        </div>

        {/* Tables với dữ liệu thật từ transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableCard
                title="Top Buyers (Payment Transactions)"
                headers={['Customer', 'Orders', 'Total Spent']}
                data={topBuyers}
                renderRow={(item, index) => (
                    <tr key={index}>
                        <td className="py-3 flex items-center">
                            <img src={item.avatar || `https://i.pravatar.cc/150?u=${item.name}`} alt={item.name} className="w-8 h-8 rounded-full mr-3"/>
                            {item.name}
                        </td>
                        <td>{item.product}</td>
                        <td className="font-semibold text-green-600">{item.price}</td>
                    </tr>
                )}
            />
             <TableCard
                title="Top Earners (Received Payments)"
                headers={['Seller', 'Total Earned', 'Completed', 'Status']}
                data={topServices}
                renderRow={(item, index) => (
                    <tr key={index}>
                        <td className="py-3 flex items-center">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full mr-3"/>
                            {item.name}
                        </td>
                        <td className="font-semibold text-green-600">{item.price}</td>
                        <td>{item.discount}</td>
                        <td>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {item.sold}
                            </span>
                        </td>
                    </tr>
                )}
            />
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard;