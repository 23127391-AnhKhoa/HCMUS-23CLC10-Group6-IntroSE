import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const letters = ['F', 'R', 'E', 'E', 'L', 'A', 'N', 'D'];

  useEffect(() => {
    // Hiệu ứng hiện từng chữ nhanh, không có delay lớn
    if (currentLetterIndex < letters.length) {
      const timer = setTimeout(() => {
        setCurrentLetterIndex(prev => prev + 1);
      }, 120); // 120ms mỗi chữ - nhanh và mượt
      
      return () => clearTimeout(timer);
    } else {
      // Khi tất cả chữ cái đã hiện, giữ 1.5 giây
      const holdTimer = setTimeout(() => {
        setShowComplete(true);
        
        // Bắt đầu hiệu ứng transition "mở ra" để khám phá thế giới FREELAND
        const transitionTimer = setTimeout(() => {
          setStartTransition(true);
          
          // Sau 1.2 giây transition thì gọi onComplete
          const completeTimer = setTimeout(() => {
            onComplete();
          }, 1200);
          
          return () => clearTimeout(completeTimer);
        }, 200);
        
        return () => clearTimeout(transitionTimer);
      }, 1500); // Giữ text 1.5 giây
      
      return () => clearTimeout(holdTimer);
    }
  }, [currentLetterIndex, letters.length, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1200 ease-out ${
      startTransition 
        ? 'scale-110 opacity-0' 
        : 'scale-100 opacity-100'
    }`} style={{
      animation: startTransition ? 'gentleZoomOut 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none'
    }}>
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background_gradient.webm" type="video/webm" />
        <source src="/background.webm" type="video/webm" />
      </video>
      
      {/* Overlay sáng để chữ nổi bật */}
      <div className="absolute inset-0 bg-white/20" />
      
      
      
      <div className={`relative text-center transition-all duration-1200 z-10 ${
        startTransition ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
      }`} style={{
        animation: startTransition ? 'gentleTextOut 1.2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards' : 'none'
      }}>
        {/* Logo container với hiệu ứng hiện từng chữ mượt */}
        <div className="mb-8 relative">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black tracking-wider text-white relative"
                style={{
                  fontFamily: '"Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.7), 0 0 30px rgba(255,255,255,0.4)'
                }}>
              {letters.map((letter, index) => (
                <span 
                  key={index}
                  className={`inline-block transition-all duration-700 ease-out ${
                    index < currentLetterIndex 
                      ? 'opacity-100 scale-100 translate-y-0 rotate-0' 
                      : 'opacity-0 scale-50 translate-y-12 rotate-12'
                  }`}
                  style={{
                    transitionDelay: `${index * 60}ms` // 60ms delay để tạo hiệu ứng overlap mượt
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
          </div>
        </div>

        {/* Subtitle xuất hiện khi tất cả chữ đã hiện */}
        <div className={`text-xl md:text-3xl font-semibold transition-all duration-1000 ${
          currentLetterIndex >= letters.length 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-3 text-white" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.6)'
          }}>
            ✨Unlocking Freedom for Digital Talents✨
          </div>
        </div>
      </div>

      {/* Background decorative elements cho hiệu ứng "khám phá" */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs với hiệu ứng pulse */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-3xl transition-all duration-2000 ${
          startTransition ? 'scale-300 opacity-0' : 'scale-100 opacity-100'
        }`} style={{
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300/40 to-pink-400/40 rounded-full blur-3xl transition-all duration-2000 ${
          startTransition ? 'scale-300 opacity-0' : 'scale-100 opacity-100'
        }`} style={{
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: '2s'
        }} />
        
        {/* Sparkles effect khi transition - hiệu ứng "khám phá" */}
        {startTransition && (
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1200}ms`,
                  animationDuration: `${800 + Math.random() * 1200}ms`,
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Radial gradient cho hiệu ứng "mở ra" nhẹ nhàng */}
      <div className={`absolute inset-0 transition-all duration-1200 ${
        startTransition 
          ? 'bg-gradient-radial from-white/50 via-cyan-200/70 to-white opacity-100' 
          : 'opacity-0'
      }`} style={{
        animation: startTransition ? 'gentleRadialExpand 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards' : 'none'
      }} />

      {/* Custom CSS cho các animation nhẹ nhàng */}
      <style jsx>{`
        @keyframes gentleZoomOut {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.03); opacity: 0.6; }
          100% { transform: scale(1.06); opacity: 0; }
        }
        
        @keyframes smoothCircularReveal {
          0% { transform: scale(1); border-radius: 0; opacity: 0; }
          25% { transform: scale(0.9); border-radius: 10%; opacity: 0.2; }
          50% { transform: scale(0.6); border-radius: 25%; opacity: 0.4; }
          75% { transform: scale(0.3); border-radius: 40%; opacity: 0.2; }
          100% { transform: scale(0); border-radius: 50%; opacity: 0; }
        }
        
        @keyframes gentleTextOut {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          50% { transform: scale(1.01) translateY(-5px); opacity: 0.6; }
          100% { transform: scale(1.05) translateY(-10px); opacity: 0; }
        }
        
        @keyframes gentleRadialExpand {
          0% { opacity: 0; transform: scale(1); }
          30% { opacity: 0.3; transform: scale(1.05); }
          70% { opacity: 0.7; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
