import React, { useState, useEffect, useRef } from 'react';

const StatsSection = () => {
    // State được đổi tên cho rõ nghĩa
    const [stats, setStats] = useState({
        buyerUsers: 0,
        favoriteGigs: 0,
        submittedOrders: 0,
        successRate: 98
    });
    const [animatedStats, setAnimatedStats] = useState({
        buyerUsers: 0,
        favoriteGigs: 0,
        submittedOrders: 0,
        successRate: 0
    });
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef();
  // Counter animation function - cải tiến để tránh conflict
  const animateValue = (start, end, duration, key) => {
    if (start === end || end === 0) return;
    
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentValue = Math.floor(start + (end - start) * progress);
      setAnimatedStats(prev => ({ ...prev, [key]: currentValue }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

    // useEffect để fetch dữ liệu đã được cập nhật
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/users/stats'); // Gọi API mới
                if (!response.ok) throw new Error('Network response was not ok');
                
                const result = await response.json();
                if (result.status === 'success') {
                    setStats(prev => ({ ...prev, ...result.data }));
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Dữ liệu dự phòng
                setStats({
                    buyerUsers: 850,
                    favoriteGigs: 3200,
                    submittedOrders: 2100,
                    successRate: 98
                });
            }
        };
        fetchStats();
    }, []);

    // Trigger animation khi stats thay đổi và section đang visible
    useEffect(() => {
        if (isVisible && (stats.buyerUsers > 0 || stats.favoriteGigs > 0 || stats.submittedOrders > 0)) {
            // Reset animated stats trước khi animate
            setAnimatedStats({
                buyerUsers: 0,
                favoriteGigs: 0,
                submittedOrders: 0,
                successRate: 0
            });
            
            setTimeout(() => animateValue(0, stats.buyerUsers, 2000, 'buyerUsers'), 200);
            setTimeout(() => animateValue(0, stats.favoriteGigs, 2200, 'favoriteGigs'), 400);
            setTimeout(() => animateValue(0, stats.submittedOrders, 2400, 'submittedOrders'), 600);
            setTimeout(() => animateValue(0, stats.successRate, 1800, 'successRate'), 800);
        }
    }, [stats, isVisible]);

    // Intersection Observer để trigger animation
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
            } else {
                // Reset khi không visible
                setIsVisible(false);
                setAnimatedStats({
                    buyerUsers: 0,
                    favoriteGigs: 0,
                    submittedOrders: 0,
                    successRate: 0
                });
            }
        }, { threshold: 0.3 });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

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
                
                {/* Cập nhật lại các thẻ thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    {/* Buyer Users */}
                    <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0ms' }}>
                        <h3 className="text-4xl font-bold text-purple-600 mb-2">
                            {animatedStats.buyerUsers.toLocaleString()}+
                        </h3>
                        <p className="text-gray-600 font-medium">Buyer Users</p>
                    </div>
                    {/* Favorite Gigs */}
                    <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                        <h3 className="text-4xl font-bold text-blue-600 mb-2">
                            {animatedStats.favoriteGigs.toLocaleString()}+
                        </h3>
                        <p className="text-gray-600 font-medium">Favorite Gigs</p>
                    </div>
                    {/* Submitted Orders */}
                    <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
                        <h3 className="text-4xl font-bold text-green-600 mb-2">
                            {animatedStats.submittedOrders.toLocaleString()}+
                        </h3>
                        <p className="text-gray-600 font-medium">Submitted Orders</p>
                    </div>
                    {/* Success Rate */}
                    <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
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