// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
  console.log('🚀 AuthProvider is mounting...');
  
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi app load lần đầu, kiểm tra xem có thông tin đăng nhập trong localStorage không
  useEffect(() => {
    console.log('⚡ useEffect in AuthProvider is running!');
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 AuthContext: Checking stored credentials...');
    console.log('🔍 Token:', storedToken ? 'exists' : 'not found');
    console.log('🔍 User:', storedUser ? 'exists' : 'not found');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ AuthContext: Restoring session for user:', userData.uuid);
        setToken(storedToken);
        setAuthUser(userData);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
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

  // Hàm để refresh user data từ server (dùng khi cần cập nhật balance mới nhất)
  const refreshUserData = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || !authUser?.uuid) return;

      const response = await fetch(`http://localhost:8000/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          console.log('🔄 AuthContext: Refreshed user data from server:', data.data);
          updateUser(data.data);
          return data.data;
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
    return null;
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
    refreshUserData,
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