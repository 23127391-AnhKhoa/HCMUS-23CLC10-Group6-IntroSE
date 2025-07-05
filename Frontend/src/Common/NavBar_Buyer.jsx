import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Avatar, Badge, Tooltip, Dropdown, Menu } from 'antd';
import { SearchOutlined, MessageOutlined, BellOutlined, HeartOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/authContext'; // Đảm bảo đường dẫn đúng

import FreelandLogo from '../assets/logo.svg'; // Import logo của bạn

// Dữ liệu tạm thời cho Categories
const categories = [
  'Graphics & Design',
  'Programming & Tech',
  'Video & Animation',
  'Data',
  'Business',
  'Lifestyle'
];

// Component con cho dropdown menu của categories
const CategoryMenu = ({ category }) => {
  const menu = (
    <Menu>
      <Menu.Item key="1">Sub-category 1</Menu.Item>
      <Menu.Item key="2">Sub-category 2</Menu.Item>
      <Menu.Item key="3">Sub-category 3</Menu.Item>
      <Menu.Item key="4">Sub-category 4</Menu.Item>
      <Menu.Item key="5">Sub-category 5</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['hover']}>
      <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors">
        {category}
      </a>
    </Dropdown>
  );
};

const Navbar = () => {
  const { authUser, logout } = useAuth(); // Lấy thông tin user và hàm logout từ context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu cho avatar người dùng
  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="dashboard">
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* Thanh Navbar chính */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Phần bên trái: Logo và Search */}
          <div className="flex items-center flex-grow">
            <Link to="/" className="flex items-center mr-6">
              <img src={FreelandLogo} alt="FREELAND Logo" className="h-8 w-auto" />
            </Link>
            <div className="w-full max-w-lg">
              <Input
                placeholder="Search for any service..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Phần bên phải: Các nút và thông tin user */}
          <nav className="flex items-center space-x-6 text-gray-600">
            {authUser ? (
              // Nếu đã đăng nhập
              <>
                <Tooltip title="Inbox">
                  <Badge count={5} size="small">
                    <MessageOutlined className="text-xl hover:text-blue-600 cursor-pointer" />
                  </Badge>
                </Tooltip>
                <Tooltip title="Notifications">
                  <BellOutlined className="text-xl hover:text-blue-600 cursor-pointer" />
                </Tooltip>
                <Tooltip title="Favorites">
                  <HeartOutlined className="text-xl hover:text-blue-600 cursor-pointer" />
                </Tooltip>
                
                <Link to="/orders" className="hover:text-blue-600 font-medium">
                  Orders
                </Link>

                {authUser.is_seller ? (
                    <button 
                    onClick={() => navigate('/Profile_Seller')}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            Switch to Selling
                    </button>
                    ) : (
                    // Nếu chưa là seller, nút này sẽ dẫn đến trang đăng ký
                    <Link to="/become-a-seller">
                        <button className="px-4 py-2 font-medium hover:text-blue-600 transition-colors">
                        Become a Seller
                        </button>
                    </Link>
                )}

                <Dropdown overlay={userMenu} trigger={['click']}>
                  <div className="flex items-center cursor-pointer">
                    <Avatar 
                      src={authUser.avatar_url} 
                      icon={!authUser.avatar_url && <UserOutlined />}
                      className="bg-gray-300"
                    />
                    <div className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                      {authUser.balance ? `$${authUser.balance.toFixed(2)}` : '$0.00'}
                    </div>
                  </div>
                </Dropdown>
              </>
            ) : (
              // Nếu chưa đăng nhập
              <>
                <Link to="/login" className="font-medium hover:text-blue-600">Log In</Link>
                <Link to="/signup">
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      
      {/* Thanh Categories */}
      <div className="border-t border-gray-200">
          <div className="container mx-auto px-4 flex items-center justify-between h-10">
            <div className="flex items-center space-x-4">
                {categories.map(cat => <CategoryMenu key={cat} category={cat} />)}
            </div>
            <button className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
          </div>
      </div>
    </header>
  );
};

export default Navbar;