import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiHome, FiAlertCircle, FiTrendingUp, FiUsers, FiHelpCircle, FiSettings, FiEye, FiEdit2, FiTrash2, FiLock, FiDollarSign, FiUser, FiLogOut, FiKey, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext'; // QUAN TRỌNG: Hãy chắc chắn đường dẫn này đúng
import { Modal, message, Dropdown } from 'antd';

// --- Settings Dropdown Component ---
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

// --- Component Sidebar ---
const Sidebar = () => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center justify-center mb-10 p-2">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col space-y-2">          <a href="/admin/admindashboard" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">

            <FiHome className="mr-3" /> Dashboard

          </a>

          <a href="/admin/manage-reported-gigs" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">

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

        </nav>      </div>

       <div className="flex flex-col space-y-2">
        <SettingsDropdown />
      </div>

    </div>

);// --- Component Bảng ---
const ReportsTable = ({ title, headers, data, renderRow }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-700 mb-4">{title}</h2>
        <div className="bg-white rounded-lg shadow-md">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        {headers.map(h => <th key={h} className="p-4 text-sm font-semibold text-gray-500">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0
                        ? data.map((item, index) => renderRow(item, index))
                        : <tr><td colSpan={headers.length} className="text-center p-6 text-gray-500">No data available.</td></tr>
                    }
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Modal để Ban ---
const BanModal = ({ target, targetType, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('1_minute');

    const isEditMode = target?.status === 'denied' || target?.status === 'inactive';
    const targetTitle = target?.title || target?.username || 'N/A';

    useEffect(() => {
        if (isEditMode && target) {
            // Lấy ban_reason từ target cho cả gig và user
            setReason(target.ban_reason || '');
        }
    }, [isEditMode, target]);

    if (!target) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            return alert('Please provide a reason for banning.');
        }
        onConfirm(target.id || target.uuid, reason, duration);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? `Edit Ban (${targetType})` : `Ban ${targetType}`}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                    <input type="text" value={targetTitle} disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                </div>

                <div className="mb-4">
                    <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 mb-1">Ban Reason</label>
                    <textarea id="banReason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md h-20" />
                </div>

                <div className="mb-6">
                    <label htmlFor="banDuration" className="block text-sm font-medium text-gray-700 mb-1">Ban Duration</label>
                    <select id="banDuration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="1_minute">1 Minute (Test)</option>
                        <option value="1_day">1 Day</option>
                        <option value="1_week">1 Week</option>
                        <option value="1_month">1 Month</option>
                        <option value="forever">Forever</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">{isEditMode ? 'Update Ban' : 'Confirm Ban'}</button>
                </div>
            </div>
        </div>
    );
};

// --- Hàm tiện ích ---
const parseReason = (description) => {
    if (!description || typeof description !== 'string') return 'N/A';
    return description.split('Additional details:')[0].replace('Report reason:', '').trim();
};

// --- Component Chính ---
const ReportsManagement = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState({ mostReported: [], allReports: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('gigs');
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [targetToBan, setTargetToBan] = useState(null);

    const fetchReports = useCallback(async (searchQuery = '', tab = 'gigs') => {
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = tab === 'gigs' ? '/api/admin/reports/gigs' : '/api/admin/reports/users';
            const response = await fetch(`${endpoint}?search=${searchQuery}`);
            if (!response.ok) throw new Error(`Failed to fetch ${tab} reports.`);
            const result = await response.json();
            if (result.status === 'success') {
                setReports(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            setError(err.message);
            setReports({ mostReported: [], allReports: [] });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchReports(searchTerm, activeTab);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, activeTab, fetchReports]);

    const openBanModal = (target) => {
        setTargetToBan(target);
        setIsBanModalOpen(true);
    };

    const handleConfirmBan = async (targetId, reason, duration) => {
        const targetType = activeTab === 'gigs' ? 'gig' : 'user';
        if (!window.confirm(`Are you sure you want to ban this ${targetType}?`)) return;
        if (!token) return alert('Access token is required');

        const endpoint = targetType === 'gig' ? `/api/gigs/${targetId}` : `/api/users/${targetId}`;
        
        try {
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ban_reason: reason,
                    ban_duration: duration
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ban ${targetType}.`);
            }

            const result = await response.json();
            console.log('Ban result:', result);
            
            setIsBanModalOpen(false);
            setTargetToBan(null);
            
            // Force refresh data after ban
            await fetchReports(searchTerm, activeTab);
            
            alert(result.message || `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} has been banned successfully.`);
        } catch (err) {
            console.error('Ban error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDismissReport = async (logId) => {
        if (!window.confirm("Are you sure you want to dismiss this report?")) return;
        if (!token) return alert('Access token is required');

        try {
            const response = await fetch(`/api/admin/reports/logs/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to dismiss report.");

            setReports(prev => ({
                ...prev,
                allReports: prev.allReports.filter(report => report.id !== logId)
            }));
        } catch (err) {
            alert(err.message);
        }
    };

    const renderAllReportsRow = (item) => {
        const target = activeTab === 'gigs' ? item.gig : item.user;
        const targetTitle = target?.title || target?.username || 'Deleted/Invalid Target';
        
        // Cải thiện logic kiểm tra banned - kiểm tra cả status và ban_reason
        const isBanned = target?.status === 'denied' || 
                         target?.status === 'inactive' || 
                         target?.ban_reason || 
                         target?.banned_until;

        return (
            <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-4 font-medium">{targetTitle}</td>
                <td className="p-4 text-gray-600">{item.reporter?.username || 'N/A'}</td>
                <td className="p-4 text-gray-600">{parseReason(item.description)}</td>
                <td className="p-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.open(activeTab === 'gigs' ? `/gig/${target?.id}` : `/profile/${target?.uuid}`, '_blank')}
                            disabled={!target}
                            className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50"
                            title="View Details"
                        ><FiEye size={18}/></button>
                        
                        <button 
                            onClick={() => openBanModal(target)}
                            disabled={!target}
                            className={`p-2 rounded-md ${isBanned ? 'bg-yellow-200 text-yellow-700 hover:bg-yellow-300' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'} disabled:opacity-50`}
                            title={isBanned ? "Edit Ban Settings" : "Ban this item"}
                        >
                            {isBanned ? <FiLock size={18} /> : <FiEdit2 size={18} />}
                        </button>
                        
                        <button
                            onClick={() => handleDismissReport(item.id)}
                            className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                            title="Dismiss Report"
                        ><FiTrash2 size={18} /></button>
                    </div>
                </td>
            </tr>
        );
    };
    
    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Reports</h1>
                        <p className="text-gray-500 mt-1">Review and manage all reported gigs and users</p>
                    </div>
                    <div className="relative w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={`Search reported ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white rounded-lg py-3 pl-12 pr-4 border"/>
                    </div>
                </div>

                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('gigs')} className={`px-4 py-2 font-semibold ${activeTab === 'gigs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Report Gigs</button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Report Users</button>
                </div>

                {isLoading ? ( <div className="text-center p-8">Loading...</div> ) 
                : error ? ( <div className="text-center p-8 text-red-500">Error: {error}</div> ) 
                : (
                    <>
                        <ReportsTable
                            title={activeTab === 'gigs' ? "Most Reported Gigs" : "Most Reported Users"}
                            headers={[activeTab === 'gigs' ? 'Gig' : 'User', 'Report Count', 'Actions']}
                            data={reports.mostReported}
                            renderRow={(item) => (
                                <tr key={item.gig_id || item.user_id} className="border-b last:border-b-0">
                                    <td className="p-4 font-medium">{item.gig_title || item.username}</td>
                                    <td className="p-4 text-gray-600 font-semibold">{item.report_count}</td>
                                    <td className="p-4">
                                      <button onClick={() => window.open(activeTab === 'gigs' ? `/gig/${item.gig_id}` : `/profile/${item.user_id}`, '_blank')} className="font-semibold text-blue-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            )}
                        />
                        <ReportsTable
                            title={activeTab === 'gigs' ? "All Reported Gigs" : "All Reported Users"}
                            headers={[activeTab === 'gigs' ? 'Gig' : 'User', 'Reported By', 'Reason', 'Actions']}
                            data={reports.allReports}
                            renderRow={renderAllReportsRow}
                        />
                    </>
                )}
            </main>
            {isBanModalOpen && <BanModal target={targetToBan} targetType={activeTab.slice(0, -1)} onClose={() => setIsBanModalOpen(false)} onConfirm={handleConfirmBan} />}
        </div>
    );
};

export default ReportsManagement;