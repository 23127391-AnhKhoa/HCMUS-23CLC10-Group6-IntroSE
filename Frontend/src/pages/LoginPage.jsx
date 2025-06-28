import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook để điều hướng
import Navbar from '../components/LandingPage/Navbar_LD';
import '../index.css';

const LoginPage = () => {
  // 2. Tạo các state để lưu dữ liệu từ form, lỗi và trạng thái loading
  const [username, setUsername] = useState(''); // State cho username
  const [password, setPassword] = useState(''); // State cho password
  const [error, setError] = useState(null); // State để hiển thị thông báo lỗi
  const [loading, setLoading] = useState(false); // State để vô hiệu hóa nút bấm khi đang gửi request

  const navigate = useNavigate(); // 3. Khởi tạo hook navigate

  // 4. Hàm xử lý khi người dùng nhấn nút submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang
    setError(null); // Xóa lỗi cũ
    setLoading(true); // Bắt đầu loading

    try {
      // 5. Gửi request tới backend
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Đóng gói dữ liệu từ state thành JSON để gửi đi
        body: JSON.stringify({ username: username, password: password }),
      });

      // 6. Nhận và xử lý phản hồi từ backend
      const data = await response.json();

      if (!response.ok) {
        // Nếu response status không phải là 2xx (lỗi từ server)
        // Ném ra một lỗi với message từ backend
        throw new Error(data.message || 'Đăng nhập không thành công.');
      }

      // 7. Xử lý khi đăng nhập thành công
      console.log('Đăng nhập thành công:', data);
      // Có thể lưu token hoặc thông tin user vào localStorage ở đây
      // localStorage.setItem('user', JSON.stringify(data.data));

      // Chuyển hướng tới trang Profile
      navigate('/admin');

    } catch (err) {
      // 8. Bắt lỗi (từ server hoặc lỗi mạng) và hiển thị
      setError(err.message);
    } finally {
      setLoading(false); // Dừng loading dù thành công hay thất bại
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Log In</h2>
          
          {/* Hiển thị thông báo lỗi chung ở đây */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* 9. Kết nối form với hàm handleSubmit */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              {/* Lưu ý: Backend đang dùng 'Username', nên chúng ta sẽ gửi 'username' */}
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text" // Đổi từ email sang text để khớp với 'Username'
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-smooth"
                placeholder="Enter your username"
                // 10. Kết nối input với state
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-smooth"
                placeholder="Enter your password"
                // 10. Kết nối input với state
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              // Vô hiệu hóa nút khi đang loading
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth hover-scale disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;