// src/components/SellerNavbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate  } from 'react-router-dom';
import { Avatar, Badge, Dropdown, Menu } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/authContext';
import FreelandLogo from '../assets/logo.svg';

const SellerNavbar = () => {
    const { authUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Định nghĩa menu theo cách mới, dùng mảng items
    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile_buyer">My Profile</Link>,
        },
        {
            key: 'dashboard',
            label: <Link to="/dashboard">Dashboard</Link>,
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
            <Link to="/" className="flex items-center">
              <img src={FreelandLogo} alt="FREELAND Logo" className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center space-x-6 font-medium text-gray-600">
              <NavLink to="/seller/dashboard" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Dashboard
              </NavLink>
              <NavLink to="/seller/orders" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Orders
              </NavLink>
              <NavLink to="/seller/gigs" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Gigs
              </NavLink>
              <NavLink to="/seller/earnings" className={({ isActive }) => isActive ? "text-blue-600" : "hover:text-blue-600"}>
                Earnings
              </NavLink>
            </nav>
          </div>

          {/* Phần bên phải: Thông báo, Avatar, Ví tiền */}
          <div className="flex items-center space-x-6">
            <Badge count={3} size="small">
                <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 cursor-pointer" />
            </Badge>
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