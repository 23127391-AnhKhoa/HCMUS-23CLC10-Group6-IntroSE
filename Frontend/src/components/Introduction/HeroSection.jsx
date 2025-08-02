import React, { useState, useEffect } from 'react';
import { FiPlay, FiArrowRight, FiStar, FiUsers, FiTrendingUp, FiShield, FiGlobe, FiZap } from 'react-icons/fi';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGigs: 0,
    completedOrders: 0,
    totalCategories: 0
  });

  const features = [
    { icon: <FiStar className="w-5 h-5" />, text: "Premium Quality Services" },
    { icon: <FiUsers className="w-5 h-5" />, text: "Global Talent Community" },
    { icon: <FiTrendingUp className="w-5 h-5" />, text: "Growing Success Stories" },
    { icon: <FiShield className="w-5 h-5" />, text: "Secure & Trusted Platform" },
    { icon: <FiGlobe className="w-5 h-5" />, text: "Worldwide Accessibility" },
    { icon: <FiZap className="w-5 h-5" />, text: "Fast & Reliable Delivery" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Sửa đổi ở đây: Gọi đến endpoint mới và duy nhất
        const response = await fetch('/api/gigs/public-stats');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
          setStats(result.data);
        } else {
          throw new Error(result.message || 'Failed to parse stats');
        }

      } catch (error) {
        console.error('Error fetching hero stats:', error);
        // Dữ liệu dự phòng nếu API lỗi
        setStats({
          totalUsers: 1250,
          totalGigs: 850,
          completedOrders: 2100,
          totalCategories: 12
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Floating particles */}
        
      </div>

      {/* Main Content */}
      <div className={`relative z-20 text-center px-4 max-w-6xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Logo & Brand */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              FREELAND
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-purple-200 mt-2 font-light">
            Your Gateway to Global Talent
          </p>
        </div>

        {/* Main Heading */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Connect. Create. <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Collaborate.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of talented freelancers and ambitious clients building the future together. 
            Turn your ideas into reality with our premium platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center">
            Get Started Now
            <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group border-2 border-white/30 hover:border-white/60 px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center">
            <FiPlay className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Watch Demo
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center justify-center p-4 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                currentFeature === index 
                  ? 'bg-white/20 scale-105 shadow-lg' 
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className={`mr-3 p-2 rounded-lg transition-colors duration-300 ${
                currentFeature === index ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'
              }`}>
                {feature.icon}
              </div>
              <span className="text-sm md:text-base font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { 
              number: `${stats.totalUsers.toLocaleString()}+`, 
              label: "Active Users" 
            },
            { 
              number: `${stats.totalGigs.toLocaleString()}+`, 
              label: "Available Gigs" 
            },
            { 
              number: `${stats.completedOrders.toLocaleString()}+`, 
              label: "Projects Done" 
            },
            { 
              number: `${stats.totalCategories}+`, 
              label: "Categories" 
            }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-sm text-purple-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;