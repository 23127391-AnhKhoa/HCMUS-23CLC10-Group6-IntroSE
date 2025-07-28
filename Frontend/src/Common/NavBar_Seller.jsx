// src/components/SellerNavbar.jsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate  } from 'react-router-dom';
import { Avatar, Badge, Dropdown, Menu, message } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell/NotificationBell';

const SellerNavbar = () => {
    const { authUser, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleSwitchToBuying = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('You must be logged in');
                navigate('/auth');
                return;
            }

            const response = await fetch('http://localhost:8000/api/users/switch-to-buying', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to switch to buying');
            }

            // Cập nhật user info trong context và localStorage
            const { user: updatedUser, token: newToken } = data;
            
            // Cập nhật localStorage với token mới
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Cập nhật context với user mới
            updateUser(updatedUser);

            message.success('Successfully switched to buying!');
            
            // Chuyển hướng về trang chính hoặc profile buyer
            navigate('/explore');
            
        } catch (error) {
            console.error('Error switching to buying:', error);
            message.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Định nghĩa menu theo cách mới, dùng mảng items
    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile_seller">My Profile</Link>,
        },
        {
            key: 'dashboard',
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'deposit',
            label: <Link to="/deposit">💰 Deposit</Link>,
        },
        {
            key: 'withdraw',
            label: <Link to="/withdraw">💸 Withdraw</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Log Out',
            onClick: handleLogout,
            danger: true,
        },
    ];


  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Phần bên trái: Logo và Menu Seller */}
          <div className="flex items-center space-x-8">
            <Link to="/profile_seller" className="flex items-center">
              <img src="/logo.svg" alt="FREELAND Logo" className="h-4 w-auto" />
            </Link>
            <nav className="flex items-center space-x-6 font-medium text-gray-600">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Dashboard
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Orders
              </NavLink>
              <NavLink to="/manage-gigs" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Manage Gigs
              </NavLink>
              <NavLink to="/earnings" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Earnings
              </NavLink>
            </nav>
          </div>

          {/* Phần bên phải: Thông báo, Avatar, Ví tiền */}
          <div className="flex items-center space-x-6">
            {/* Nút Switch to Buying */}
            <button 
              onClick={handleSwitchToBuying}
              disabled={loading}
              className="px-4 py-2 border border-green-600 text-green-600 rounded-md font-medium hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Switching...' : 'Switch to Buying'}
            </button>
            
            <NotificationBell />
            <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                {authUser?.balance ? `$${authUser.balance.toFixed(2)}` : '$0.00'}
            </div>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Avatar 
                src={authUser?.avatar_url} 
                icon={!authUser?.avatar_url && <UserOutlined />}
                className="bg-gray-300 cursor-pointer"
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerNavbar;