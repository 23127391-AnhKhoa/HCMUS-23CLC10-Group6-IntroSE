import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar_LD'; // Đảm bảo đường dẫn đúng
import '../index.css';

// Component con cho form đăng ký ban đầu
const SignupForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Username validation: only allow letters, numbers, and dots
    if (id === 'username') {
      const usernameRegex = /^[a-zA-Z0-9.]*$/;
      if (!usernameRegex.test(value)) {
        return; // Don't update state if invalid characters
      }
    }
    
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Additional username validation
    const usernameRegex = /^[a-zA-Z0-9.]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain letters, numbers, and dots.');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    try {
      // Gọi hàm prop `onRegister` được truyền từ component cha
      await onRegister(formData);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input id="fullname" type="text" value={formData.fullname} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your full name" />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          id="username" 
          type="text" 
          value={formData.username} 
          onChange={handleChange} 
          required 
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Enter a unique username" 
          pattern="[a-zA-Z0-9.]+"
          title="Username can only contain letters, numbers, and dots"
          minLength="3"
        />
        <p className="mt-1 text-xs text-gray-500">Only letters, numbers, and dots allowed. Minimum 3 characters.</p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input id="password" type="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Confirm your password" />
      </div>
      <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth hover-scale">
        Register & Get OTP
      </button>
    </form>
  );
};

// Component con cho form nhập OTP
const OTPForm = ({ email, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
       <p className="text-center text-gray-600">An OTP has been sent to <strong>{email}</strong>. Please check your inbox.</p>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter 6-digit OTP"
        />
      </div>
      <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth hover-scale">
        Verify & Sign Up
      </button>
    </form>
  );
};


// Component cha chính
const SignupPage = () => {
  // State để quản lý đang ở bước nào: 'register' hoặc 'verify'
  const [step, setStep] = useState('register'); 
  // State để lưu email sau khi đăng ký thành công, để dùng cho bước verify
  const [emailForVerification, setEmailForVerification] = useState('');
  
  const navigate = useNavigate();

  // Hàm xử lý logic khi form đăng ký được submit
  const handleRegister = async (formData) => {
    // Gọi API bước 1
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    // Nếu thành công, lưu lại email và chuyển sang bước verify
    setEmailForVerification(formData.email);
    setStep('verify');
  };

  // Hàm xử lý logic khi form OTP được submit
  const handleVerify = async (otp) => {
    // Gọi API bước 2
    const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailForVerification, otp }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    // Nếu verify thành công, chuyển hướng đến trang đăng nhập
    alert('Sign up successful! Please log in.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {step === 'register' ? 'Sign Up' : 'Verify Your Email'}
          </h2>
          
          {/* Dựa vào state `step` để hiển thị form tương ứng */}
          {step === 'register' ? (
            <SignupForm onRegister={handleRegister} />
          ) : (
            <OTPForm email={emailForVerification} onVerify={handleVerify} />
          )}

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;