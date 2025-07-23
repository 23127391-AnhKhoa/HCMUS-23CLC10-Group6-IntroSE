import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Common/Navbar_LD';
import LoginForm from '../components/AuthPage/LoginForm'; // tách riêng login
import SignupForm from '../components/AuthPage/SignupForm'; // có onRegister prop
import OTPForm from '../components/AuthPage/OTPForm'; // có onVerify prop

function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Phát chậm lại
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="fixed top-0 left-0 w-full h-full object-cover z-0"
    >
      <source src="/background_gradient.webm" type="video/webm" />
    </video>
  );
}

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState('register'); // chỉ dùng cho signup
  const [emailForVerification, setEmailForVerification] = useState('');

  const handleRegister = async (formData) => {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    setEmailForVerification(formData.email);
    setStep('verify');
  };

  const handleVerify = async (otp) => {
    const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailForVerification, otp }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    alert('Sign up successful! Please log in.');
    setActiveTab('login'); // quay lại login
    setStep('register');
  };
  return (
    <div className="relative w-full h-screen">
      <BackgroundVideo />
        
        <div className="relative pt-16 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20">
          {/* Header with logo/title */}
          <div className="text-center mb-8">
            <div className="w-full flex justify-center mb-4 space-x-2">
              <img
                src="/icon.svg"
                alt="Freeland Logo"
                className="h-5"
              />
              <img
                src="/logo.svg"
                alt="Freeland Logo"
                className="h-5"
              />
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account or create a new one</p>
          </div>

          {/* Tab buttons with improved design */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'login' 
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setStep('register');
              }}
              className={`flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'signup' 
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Content with animation */}
          <div className="transition-all duration-500 ease-in-out">
            {activeTab === 'login' && <LoginForm />}
            {activeTab === 'signup' && (
              step === 'register'
                ? <SignupForm onRegister={handleRegister} />
                : <OTPForm email={emailForVerification} onVerify={handleVerify} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
