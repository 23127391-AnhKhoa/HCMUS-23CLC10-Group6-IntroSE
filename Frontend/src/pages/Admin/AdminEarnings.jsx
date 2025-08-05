import React, { useState, useEffect } from 'react';
import { FiHome, FiAlertCircle, FiTrendingUp, FiUsers, FiSettings, FiDollarSign, FiArrowDown, FiClock, FiCheck, FiX, FiEye, FiUser, FiLogOut, FiKey, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, message, Dropdown } from 'antd';

const SettingsDropdown = () => {
  const { authUser, logout } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

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

      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
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

const Sidebar = ({ currentPage = 'earnings' }) => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center justify-center mb-10 p-2">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/admindashboard" className={`flex items-center p-3 rounded-lg transition-smooth ${currentPage === 'dashboard' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FiHome className="mr-3" /> Dashboard
          </a>
          <a href="/admin/manage-reported-gigs" className={`flex items-center p-3 rounded-lg transition-smooth ${currentPage === 'reports' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FiAlertCircle className="mr-3" /> Report
          </a>
          <a href="/admin/servicemanagement" className={`flex items-center p-3 rounded-lg transition-smooth ${currentPage === 'services' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FiTrendingUp className="mr-3" /> Services Management
          </a>
          <a href="/admin/usermanagement" className={`flex items-center p-3 rounded-lg transition-smooth ${currentPage === 'users' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FiUsers className="mr-3" /> User Management
          </a>
          <a href="/admin/earnings" className={`flex items-center p-3 rounded-lg transition-smooth ${currentPage === 'earnings' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FiDollarSign className="mr-3" /> Earnings
          </a>
        </nav>
      </div>
      <div className="flex flex-col space-y-2">
        <SettingsDropdown />
      </div>
    </div>
);

const AdminHeader = () => (
  <div className="flex justify-between items-center mb-6 px-4">
    <h1 className="text-3xl font-bold text-gray-800">Admin Earnings</h1>
    
  </div>
);

const BalanceCard = ({ balance, earningsData }) => (
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl mb-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-green-100 text-sm font-medium mb-2">Admin Available Balance</p>
        <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
        <p className="text-green-100 text-sm mt-2">Website profit available for withdrawal</p>
        {earningsData && (
          <div className="mt-4 text-sm text-green-100">
            <p>Total Revenue: ${earningsData.totalRevenue.toFixed(2)}</p>
            <p>Paid to Sellers: ${earningsData.totalPaidToSellers.toFixed(2)}</p>
            <p>Total Website Profit: ${earningsData.totalProfit.toFixed(2)}</p>
            <p>Already Withdrawn: ${earningsData.totalAdminWithdraws.toFixed(2)}</p>
          </div>
        )}
      </div>
      <div className="bg-white bg-opacity-20 p-4 rounded-full">
        <FiDollarSign className="text-3xl" />
      </div>
    </div>
  </div>
);

const TransactionCard = ({ transaction, index }) => {
  const getStatusColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-green-600 bg-green-100';
      case 'withdraw': 
      case 'admin_withdraw': return 'text-red-600 bg-red-100';
      case 'payment': return 'text-blue-600 bg-blue-100';
      case 'received_payment': return 'text-purple-600 bg-purple-100';
      case 'profit': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deposit': return <FiArrowDown className="rotate-180" />;
      case 'withdraw': 
      case 'admin_withdraw': return <FiArrowDown />;
      case 'payment': return <FiDollarSign />;
      case 'received_payment': return <FiCheck />;
      case 'profit': return <FiDollarSign className="text-emerald-600" />;
      default: return <FiClock />;
    }
  };

  const getDisplayName = (type) => {
    switch (type) {
      case 'admin_withdraw': return 'Admin Withdrawal';
      case 'profit': return 'Daily Profit';
      case 'payment': return 'Payment';
      case 'received_payment': return 'Received Payment';
      default: return type.replace('_', ' ');
    }
  };

  const isIncome = transaction.type === 'profit' || transaction.type === 'deposit';
  const isWithdraw = transaction.type === 'withdraw' || transaction.type === 'admin_withdraw';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor(transaction.type)}`}>
            {getIcon(transaction.type)}
          </div>
          <div>
            <p className="font-semibold text-gray-800 capitalize">{getDisplayName(transaction.type)}</p>
            <p className="text-sm text-gray-500">
              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {transaction.description && (
              <p className="text-xs text-gray-400 mt-1">{transaction.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-lg ${isWithdraw ? 'text-red-600' : 'text-green-600'}`}>
            {isWithdraw ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">ID: {transaction.id}</p>
        </div>
      </div>
    </div>
  );
};

const WithdrawModal = ({ visible, onClose, currentBalance, onWithdrawSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, authUser, updateUser } = useAuth();

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    
    if (amount > currentBalance) {
      message.error('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      
      // Use regular withdraw API - it will create a transaction record
      // The admin balance will be recalculated on next refresh
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to withdraw');
      }

      message.success(`Successfully withdrew $${amount.toFixed(2)} from admin earnings`);
      setWithdrawAmount('');
      onClose();
      onWithdrawSuccess();
      
    } catch (error) {
      console.error('Error withdrawing:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FiArrowDown className="text-red-600" />
          <span className="text-xl font-bold">Withdraw Funds</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      className="withdraw-modal"
    >
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-gray-800">${currentBalance.toFixed(2)}</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              step="0.01"
              min="0.01"
              max={currentBalance}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum withdrawal amount: $0.01
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AdminEarnings = () => {
  const { authUser, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [adminBalance, setAdminBalance] = useState(0);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAdminEarnings = async () => {
    try {
      const response = await fetch('/api/admin/earnings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin earnings');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setEarningsData(result.data);
        setAdminBalance(result.data.availableBalance);
      }
    } catch (error) {
      console.error('Error fetching admin earnings:', error);
      message.error('Failed to load admin earnings');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transaction-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      message.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && authUser?.role === 'admin') {
      fetchAdminEarnings();
      fetchTransactions();
    }
  }, [token, authUser, refreshTrigger]);

  const handleWithdrawSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Please log in to access admin earnings</p>
      </div>
    );
  }

  if (authUser.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar currentPage="earnings" />
      <main className="flex-1 p-6">
        <AdminHeader />
        
        {/* Balance Card with Withdraw Button */}
        <div className="relative">
          <BalanceCard balance={adminBalance} earningsData={earningsData} />
          <button
            onClick={() => setWithdrawModalVisible(true)}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg"
          >
            <FiArrowDown />
            <span className="font-semibold">Withdraw</span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiEye />
              <span>Refresh</span>
            </button>
          </div>

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Profit Earned</p>
                    <p className="text-xl font-bold text-green-700">
                      ${transactions
                        .filter(t => t.type === 'profit')
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <FiDollarSign className="text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Total Withdrawn</p>
                    <p className="text-xl font-bold text-red-700">
                      ${transactions
                        .filter(t => t.type === 'admin_withdraw')
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-full">
                    <FiArrowDown className="text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Net Profit</p>
                    <p className="text-xl font-bold text-blue-700">
                      ${(
                        transactions.filter(t => t.type === 'profit').reduce((sum, t) => sum + parseFloat(t.amount), 0) -
                        transactions.filter(t => t.type === 'admin_withdraw').reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FiCheck className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FiClock className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <TransactionCard key={transaction.id} transaction={transaction} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Withdraw Modal */}
        <WithdrawModal
          visible={withdrawModalVisible}
          onClose={() => setWithdrawModalVisible(false)}
          currentBalance={adminBalance}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      </main>
    </div>
  );
};

export default AdminEarnings;
