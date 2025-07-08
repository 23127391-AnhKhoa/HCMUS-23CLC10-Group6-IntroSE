import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar_LD'; // Đảm bảo đường dẫn đúng
import { useAuth } from '../contexts/authContext'; // 1. Import hook useAuth
import '../index.css';

const LoginPage = () => {
  // 2. State cho form, đổi username thành email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // 3. Lấy hàm login từ AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 4. Gửi email và password
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // 5. Xử lý khi đăng nhập thành công
      // Gọi hàm login từ context để lưu thông tin vào state toàn cục và localStorage
      login(data.user, data.token);

      // 6. Điều hướng dựa trên role
      if (data.user.role === 'admin') {
        navigate('/adminDashboard'); // Chuyển đến trang dashboard của admin
      } else {
        navigate('/explore'); // Chuyển đến trang chính cho user
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Log In</h2>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              {/* 7. Đổi input từ username thành email */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
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