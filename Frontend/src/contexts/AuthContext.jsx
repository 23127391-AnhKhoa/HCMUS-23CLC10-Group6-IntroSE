// src/contexts/AuthContext.js
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // sửa đường dẫn nếu khác

// Tạo Context
const AuthContext = createContext(null);

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi app load lần đầu, kiểm tra xem có thông tin đăng nhập trong localStorage không
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAuthUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      supabase.auth.setSession({ access_token: token, refresh_token: '' });
    }
  }, []);


  // Hàm để gọi khi đăng nhập thành công
  const login = (userData, userToken) => {
    setAuthUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const updateUser = (updatedUserData) => {
    setAuthUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Hàm để update user data và token (nếu có token mới)
  const updateUserWithToken = (updatedUserData, newToken = null) => {
    setAuthUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    
    // Chỉ update token nếu có token mới được trả về
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    }
  };

  // Hàm để gọi khi đăng xuất
  const logout = () => {
    setAuthUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    authUser,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    updateUserWithToken,
  };

  // Chỉ render children khi đã kiểm tra xong localStorage
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Export AuthContext để có thể import trực tiếp
export { AuthContext };