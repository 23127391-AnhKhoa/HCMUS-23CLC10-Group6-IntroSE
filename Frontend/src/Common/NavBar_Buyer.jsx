import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Avatar, Badge, Tooltip, Dropdown, Menu } from 'antd';
import { SearchOutlined, MessageOutlined, BellOutlined, HeartOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext'; // Đảm bảo đường dẫn đúng
import NotificationBell from '../components/NotificationBell/NotificationBell';

// Component con cho dropdown menu của categories
const CategoryMenu = ({ category }) => {
  const navigate = useNavigate();
  
  const handleCategoryClick = () => {
    // Navigate to search page with category filter
    navigate(`/search?category=${category.id}`);
  };
  
  // If category has subcategories (children), show dropdown
  if (category.children && category.children.length > 0) {
    const menu = (
      <Menu>
        <Menu.Item key="all" onClick={handleCategoryClick}>
          <div className="flex items-center">
            <span className="font-medium">All {category.name}</span>
          </div>
        </Menu.Item>
        <Menu.Divider />
        {category.children.map(child => (
          <Menu.Item 
            key={child.id} 
            onClick={() => navigate(`/search?category=${child.id}`)}
          >
            <div className="flex items-center">
              <span>{child.name}</span>
            </div>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown 
        overlay={menu} 
        trigger={['hover']} 
        placement="bottomLeft"
        overlayClassName="category-dropdown"
      >
        <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors flex items-center">
          {category.name}
          <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </Dropdown>
    );
  }
  
  // If no subcategories, just navigate directly
  return (
    <a 
      href="#!" 
      onClick={(e) => {
        e.preventDefault();
        handleCategoryClick();
      }} 
      className="text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors"
    >
      {category.name}
    </a>
  );
};

const Navbar = () => {
  const { authUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  // Tính toán is_seller dựa trên role để đảm bảo luôn chính xác
  const isSeller = authUser?.is_seller || authUser?.role === 'seller';
  
  // Kiểm tra user đã từng là seller hay chưa (để hiển thị đúng button)
  const hasBeenSeller = authUser?.seller_since || authUser?.role === 'seller';

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('[NavBar] Fetching categories...');
      const response = await fetch('http://localhost:8000/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCategories(data.data || []);
          console.log('[NavBar] Categories loaded:', data.data?.length || 0);
        } else {
          console.warn('[NavBar] Categories API returned non-success status:', data.status);
        }
      } else {
        console.warn('[NavBar] Categories API response not ok:', response.status);
      }
    } catch (err) {
      console.error('[NavBar] Error fetching categories:', err);
      // Set fallback categories if API fails
      setCategories([
        { id: 1, name: 'Graphics & Design', slug: 'graphics-design' },
        { id: 2, name: 'Programming & Tech', slug: 'programming-tech' },
        { id: 3, name: 'Video & Animation', slug: 'video-animation' },
        { id: 4, name: 'Data', slug: 'data' },
        { id: 5, name: 'Business', slug: 'business' },
        { id: 6, name: 'Lifestyle', slug: 'lifestyle' }
      ]);
    }
  };

  const handleSearch = (value) => {
    // Always navigate to search page - if no value, show most relevant results
    const searchValue = value?.trim() || '';
    if (searchValue) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    } else {
      // Navigate to search page without query to show all gigs with most relevant sorting
      navigate('/search');
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleReactivateSeller = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('http://localhost:8000/api/users/reactivate-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reactivate seller');
      }

      // Cập nhật user info
      const { user: updatedUser, token: newToken } = data;
      
      if (!updatedUser || !newToken) {
        throw new Error('Invalid response format');
      }
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(updatedUser);

      // Chuyển đến trang seller
      navigate('/profile_seller');
    } catch (error) {
      console.error('Error reactivating seller:', error);
      // Fallback về trang become-seller nếu có lỗi
      navigate('/become-seller');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Menu cho avatar người dùng
  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile_buyer">Profile</Link>
      </Menu.Item>
      <Menu.Item key="dashboard">
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="deposit">
        <Link to="/deposit">💰 Deposit</Link>
      </Menu.Item>
      <Menu.Item key="withdraw">
        <Link to="/withdraw">💸 Withdraw</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {/* Custom CSS for category dropdown */}
      <style jsx global>{`
        .category-dropdown .ant-dropdown-menu {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .category-dropdown .ant-dropdown-menu-item {
          padding: 8px 16px;
          transition: all 0.2s ease;
        }
        .category-dropdown .ant-dropdown-menu-item:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .category-dropdown .ant-dropdown-menu-divider {
          margin: 4px 0;
          background: #e2e8f0;
        }
      `}</style>
      
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* Thanh Navbar chính */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Phần bên trái: Logo và Search */}
          <div className="flex items-center flex-grow">
            <Link to="/explore" className="flex items-center mr-6">
              <img src="/logo.svg" alt="FREELAND Logo" className="h-4 w-auto" />
            </Link>
            <div className="w-full max-w-lg">
              <Input
                placeholder="Search for any service..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                onPressEnter={() => handleSearch(searchQuery)}
                className="rounded-lg"
                allowClear
                size="large"
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
                    <Link to="/inbox">
                      <MessageOutlined className="text-xl hover:text-blue-600 cursor-pointer" />
                    </Link>
                  </Badge>
                </Tooltip>
                <Tooltip title="Notifications">
                  <NotificationBell />
                </Tooltip>
                <Tooltip title="Favorites">
                  <Link to="/favorites">
                    <HeartOutlined className="text-xl hover:text-blue-600 cursor-pointer" />
                  </Link>
                </Tooltip>
                
                <Link to="/orders" className="hover:text-blue-600 font-medium">
                  Orders
                </Link>

                {isSeller ? (
                    <button 
                    onClick={() => navigate('/profile_seller')}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            Switch to Selling
                    </button>
                    ) : hasBeenSeller ? (
                    // Nếu đã từng là seller nhưng hiện tại role là buyer
                    <button 
                    onClick={handleReactivateSeller}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Switch to Selling
                    </button>
                    ) : (
                    // Nếu chưa từng là seller, nút này sẽ dẫn đến trang đăng ký
                    <Link to="/become-seller">
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
                <Link to="/auth" className="font-medium hover:text-blue-600">Log In</Link>
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
                {categories.map(cat => <CategoryMenu key={cat.id || cat.name} category={cat} />)}
            </div>
            <button className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
          </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;