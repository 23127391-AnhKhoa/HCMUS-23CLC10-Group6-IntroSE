import React, { useState, useEffect, useCallback } from 'react'; 
import { FiHome, FiList, FiTrendingUp, FiUsers, FiSettings, FiHelpCircle, FiBell, FiSearch, FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

// --- Components ---

const Sidebar = () => (
  <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
    <div>
      <div className="flex items-center space-x-2 mb-10 p-2">
        <img src="https://i.pravatar.cc/150?u=freeland" alt="Logo" className="w-10 h-10 rounded-full" />
        <span className="font-bold text-xl text-gray-800">FREELAND</span>
      </div>
      <nav className="flex flex-col space-y-2">
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiHome className="mr-3" /> Dashboard
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiList className="mr-3" /> Orders
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiTrendingUp className="mr-3" /> Services Management
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiUsers className="mr-3" /> Earnings
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiUsers className="mr-3" /> Community
        </a>
        <a href="#" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">
          <FiUsers className="mr-3" /> User Management
        </a>
      </nav>
    </div>
    <div className="flex flex-col space-y-2">
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiHelpCircle className="mr-3" /> Help
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiSettings className="mr-3" /> Settings
        </a>
    </div>
  </div>
);

const Header = ({ searchTerm, onSearchChange }) => {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/adminDashboard">Admin Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="userManagement">
        <Link to="/admin/Usermanagement">User Management</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="settings">
        <Link to="/admin/settings">⚙️ Settings</Link>
      </Menu.Item>
      <Menu.Item key="reports">
        <Link to="/admin/reports">📊 Reports</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        🚪 Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
      <div className="flex items-center space-x-4">
        <div className="relative w-72">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full bg-gray-100 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <button className="bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Add User
        </button>
        <FiBell className="text-gray-500 w-6 h-6 cursor-pointer hover:text-blue-500 transition-colors"/>
        <Dropdown overlay={userMenu} trigger={['click']}>
          <div className="flex items-center cursor-pointer space-x-2">
            <Avatar 
              src={authUser?.avatar_url} 
              icon={!authUser?.avatar_url && <UserOutlined />}
              className="bg-gray-300"
            />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};


const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex-1 hover-scale">
    <h3 className="text-gray-500 text-md mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

// Sửa UserRow để nhận các hàm xử lý sự kiện
const UserRow = ({ user, onDelete, onUpdateRole, onReactivate }) => { // Thêm prop onReactivate
  const isUserActive = user.status && user.status.toLowerCase() === 'active';
  const statusClass = isUserActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600';
  
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    onUpdateRole(user.uuid, newRole);
  };
  
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* ... các thẻ <td> cho User, Role không đổi ... */}
      <td className="py-4 px-6">
        <div className="flex items-center space-x-4">
          <img src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.uuid}`} alt={user.username} className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-medium text-gray-800">{user.username}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <select value={user.role} onChange={handleRoleChange} className="px-7 border border-gray-300 rounded-md bg-white">
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
        </select>
      </td>
      <td className="py-4 px-6">
        <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${statusClass}`}>
          {user.status}
        </span>
      </td>
      <td className="py-4 px-6 text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-4 text-gray-500">
          <FiEye onClick={() => alert(JSON.stringify(user, null, 2))} className="cursor-pointer hover:text-blue-500 transition-smooth" size={20} />
          
          {/* --- LOGIC HIỂN THỊ NÚT ĐỘNG --- */}
          {isUserActive ? (
            // Nếu active, hiển thị nút xóa/vô hiệu hóa
            <FiTrash2 
              onClick={() => onDelete(user.uuid, user.username)} 
              className="cursor-pointer hover:text-red-500 transition-smooth" 
              size={20} 
              title="Deactivate User"
            />
          ) : (
            // Nếu inactive, hiển thị nút kích hoạt lại
            <FiRefreshCw 
              onClick={() => onReactivate(user.uuid, user.username)} 
              className="cursor-pointer hover:text-green-500 transition-smooth" 
              size={20}
              title="Reactivate User"
            />
          )}
        </div>
      </td>
    </tr>
  );
}; 


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center mt-6">
        <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <FiChevronLeft className="mr-2"/>
            Previous
        </button>
        <div className="flex items-center space-x-2">
            {pages.map(page => (
                <button 
                    key={page} 
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    {page}
                </button>
            ))}
        </div>
        <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Next
            <FiChevronRight className="ml-2"/>
        </button>
    </div>
  );
};

// --- Main Component (Thay đổi nhiều nhất) ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 8;

  // Sử dụng useCallback để không tạo lại hàm trên mỗi lần render
  const fetchUsers = useCallback(async (searchQuery = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API backend
      const response = await fetch(`http://localhost:8000/api/users?search=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      // Logic phân trang có thể cần điều chỉnh nếu API hỗ trợ
      // setTotalPages(Math.ceil(data.length / usersPerPage)); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Thêm các dependencies nếu cần

  // Effect để fetch dữ liệu lần đầu và khi search
  useEffect(() => {
    // Debounce: Chờ người dùng ngừng gõ 500ms rồi mới tìm kiếm
    const timerId = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId); // Dọn dẹp timer khi component unmount hoặc searchTerm thay đổi
    };
  }, [searchTerm, fetchUsers]);


  // --- Action Handlers ---

  const handleDeleteUser = async (uuid, name) => {
    // Tên hàm vẫn là handleDeleteUser vì về mặt ngữ nghĩa đối với người quản trị, đây là hành động "xóa".
    if (window.confirm(`Are you sure you want to deactivate user ${name}? This will set their status to Inactive.`)) {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${uuid}`, {
                method: 'DELETE', // Method vẫn là DELETE để khớp với API route
            });

            if (!response.ok) {
                // Phân tích lỗi từ server nếu có
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to deactivate user.');
            }

            // === THAY ĐỔI QUAN TRỌNG Ở ĐÂY ===
            // Thay vì lọc bỏ (filter), chúng ta dùng map để cập nhật lại status của user.
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.uuid === uuid
                        ? { ...user, status: 'inactive' } // Tìm đúng user và đổi status
                        : user // Giữ nguyên các user khác
                )
            );

        } catch (err) {
            alert(err.message);
        }
    }
};

  
  const handleUpdateUserRole = async (uuid, newRole) => {
    // Cập nhật UI tạm thời để có trải nghiệm tốt hơn
    setUsers(prevUsers => 
      prevUsers.map(user => user.uuid === uuid ? { ...user, role: newRole } : user)
    );

    try {
      const response = await fetch(`http://localhost:8000/api/users/${uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        throw new Error('Failed to update role.');
      }
      // Dữ liệu đã được cập nhật thành công, có thể fetch lại hoặc tin vào UI tạm thời
      console.log(`User ${uuid} role updated to ${newRole}`);
    } catch (err) {
      alert(err.message);
      // Nếu lỗi, fetch lại dữ liệu để khôi phục trạng thái đúng
      fetchUsers(searchTerm);
    }
  };

  const handleReactivateUser = async (uuid, name) => {
    if (window.confirm(`Are you sure you want to reactivate user ${name}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${uuid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }), // Gửi yêu cầu đổi status thành 'active'
        });

        if (!response.ok) {
          throw new Error('Failed to reactivate user.');
        }

        // Cập nhật UI ngay lập tức
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.uuid === uuid
              ? { ...user, status: 'active' } // Đổi status thành active
              : user
          )
        );
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const currentUsers = users; // Nếu phân trang ở client side: .slice(indexOfFirstUser, indexOfLastUser)

  const activeUsers = users.filter(user => user.status && user.status.toLowerCase() === 'active').length;
  const inactiveUsers = users.filter(user => user.status && user.status.toLowerCase() === 'inactive').length;


  return (
    <div className="flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
        
        <div className="flex space-x-6 mb-8">
          <StatCard title="Total Users" value={users.length.toLocaleString()} />
          <StatCard title="Active Users" value={activeUsers.toLocaleString()} />
          <StatCard title="Inactive Users" value={inactiveUsers.toLocaleString()} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                          <th className="py-4 px-6 text-sm font-semibold text-gray-500">User</th>
                          <th className="py-4 px-6 text-sm font-semibold text-gray-500">Role</th>
                          <th className="py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
                          <th className="py-4 px-6 text-sm font-semibold text-gray-500">Joined Date</th>
                          <th className="py-4 px-6 text-sm font-semibold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                      ) : error ? (
                        <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
                      ) : (
                        currentUsers.map(user => (
                        <UserRow 
                             key={user.uuid} 
                             user={user} 
                             onDelete={handleDeleteUser}
                              onUpdateRole={handleUpdateUserRole}
                              onReactivate={handleReactivateUser} // <-- TRUYỀN PROP MỚI XUỐNG
                        />
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* <Pagination ... /> */}

      </main>
      <div className="fixed bottom-10 right-10">
            <img src="https://i.pravatar.cc/150?u=bottom-admin" alt="Admin" className="w-16 h-16 rounded-full cursor-pointer shadow-lg border-4 border-white hover-scale"/>
      </div>
    </div>
  );
};

export default UserManagement;