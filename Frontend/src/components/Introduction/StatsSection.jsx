import React, { useState, useEffect, useRef } from 'react';

const StatsSection = () => {
  const [stats, setStats] = useState({
    buyerUsers: 0,
    favoriteGigs: 0,
    submittedOrders: 0,
    successRate: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    buyerUsers: 0,
    favoriteGigs: 0,
    submittedOrders: 0,
    successRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef();
  const timersRef = useRef([]);

  // Counter animation function
  const animateValue = (start, end, duration, key) => {
    if (start === end) return;
    
    const startTime = Date.now();
    const startValue = start;
    const endValue = end;
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1); // Ensure progress never exceeds 1
      
      if (progress >= 1) {
        setAnimatedStats(prev => ({ ...prev, [key]: endValue }));
        clearInterval(timer);
        // Remove timer from ref array
        timersRef.current = timersRef.current.filter(t => t !== timer);
      } else {
        // Use easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        // Ensure value never decreases
        setAnimatedStats(prev => ({ 
          ...prev, 
          [key]: Math.max(prev[key] || 0, currentValue)
        }));
      }
    }, 16);
    
    // Store timer reference for cleanup
    timersRef.current.push(timer);
    return timer;
  };

  // Cleanup function to clear all timers
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearInterval(timer));
    timersRef.current = [];
  };

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        // Fetch stats from new dedicated endpoint
        const response = await fetch('/api/admin/stats-section');
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setStats(result.data);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use default values if API fails
        setStats({
          buyerUsers: 11,
          favoriteGigs: 22,
          submittedOrders: 108,
          successRate: 98
        });
      }
    };
    
    fetchStats();
  }, []);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && stats.buyerUsers > 0) {
          setIsVisible(true);
          setHasAnimated(true);
          
          // Clear any existing timers
          clearAllTimers();
          
          // Reset animated stats to 0 before starting animations
          setAnimatedStats({
            buyerUsers: 0,
            favoriteGigs: 0,
            submittedOrders: 0,
            successRate: 0
          });
          
          // Start all animations independently with different durations for variety
          setTimeout(() => animateValue(0, stats.buyerUsers, 1800, 'buyerUsers'), 50);
          setTimeout(() => animateValue(0, stats.favoriteGigs, 2000, 'favoriteGigs'), 100);
          setTimeout(() => animateValue(0, stats.submittedOrders, 2200, 'submittedOrders'), 150);
          setTimeout(() => animateValue(0, stats.successRate, 1600, 'successRate'), 200);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      clearAllTimers(); // Cleanup on unmount
    };
  }, [stats, hasAnimated]);

  // Reset animation when component remounts or stats change
  useEffect(() => {
    if (stats.buyerUsers > 0 || stats.favoriteGigs > 0 || stats.submittedOrders > 0) {
      setHasAnimated(false);
      // Clear any running animations
      clearAllTimers();
      // Reset animated values when stats change
      setAnimatedStats({
        buyerUsers: 0,
        favoriteGigs: 0,
        submittedOrders: 0,
        successRate: 0
      });
    }
  }, [stats]);

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Freeland in Numbers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust Freeland for their freelance needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '0ms' }}>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">
              {animatedStats.buyerUsers.toLocaleString()}+
            </h3>
            <p className="text-gray-600 font-medium">Buyer Users</p>
          </div>
          <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '100ms' }}>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">
              {animatedStats.favoriteGigs.toLocaleString()}+
            </h3>
            <p className="text-gray-600 font-medium">Favorite Gigs</p>
          </div>
          <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <h3 className="text-4xl font-bold text-green-600 mb-2">
              {animatedStats.submittedOrders.toLocaleString()}+
            </h3>
            <p className="text-gray-600 font-medium">Submitted Orders</p>
          </div>
          <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <h3 className="text-4xl font-bold text-yellow-600 mb-2">
              {animatedStats.successRate}%
            </h3>
            <p className="text-gray-600 font-medium">Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
