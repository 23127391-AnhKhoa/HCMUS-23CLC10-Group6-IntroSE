import React, { useState, useEffect } from 'react';
import { FiStar, FiAward, FiUser } from 'react-icons/fi';

const TopSellersSection = () => {
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    // Fetch top sellers from API
    const fetchTopSellers = async () => {
      try {
        const response = await fetch('/api/users?role=seller&limit=6&sort_by=rating');
        if (response.ok) {
          const data = await response.json();
          setTopSellers(data.slice(0, 6));
        } else {
          // Fallback data
          setTopSellers([
            {
              uuid: '1',
              username: 'john_designer',
              fullname: 'John Smith',
              avt_url: null,
              seller_headline: 'Professional UI/UX Designer',
              rating: 4.9,
              completedOrders: 127,
              responseTime: '1 hour'
            },
            {
              uuid: '2',
              username: 'sarah_dev',
              fullname: 'Sarah Johnson',
              avt_url: null,
              seller_headline: 'Full Stack Developer',
              rating: 4.8,
              completedOrders: 89,
              responseTime: '2 hours'
            },
            {
              uuid: '3',
              username: 'mike_writer',
              fullname: 'Mike Chen',
              avt_url: null,
              seller_headline: 'Content Writer & SEO Expert',
              rating: 4.9,
              completedOrders: 203,
              responseTime: '30 minutes'
            },
            {
              uuid: '4',
              username: 'emma_artist',
              fullname: 'Emma Davis',
              avt_url: null,
              seller_headline: 'Digital Artist & Illustrator',
              rating: 5.0,
              completedOrders: 156,
              responseTime: '1 hour'
            },
            {
              uuid: '5',
              username: 'alex_marketer',
              fullname: 'Alex Rodriguez',
              avt_url: null,
              seller_headline: 'Digital Marketing Specialist',
              rating: 4.7,
              completedOrders: 178,
              responseTime: '3 hours'
            },
            {
              uuid: '6',
              username: 'lisa_video',
              fullname: 'Lisa Wang',
              avt_url: null,
              seller_headline: 'Video Editor & Motion Graphics',
              rating: 4.8,
              completedOrders: 94,
              responseTime: '2 hours'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching top sellers:', error);
        // Use fallback data on error
        setTopSellers([]);
      }
    };

    fetchTopSellers();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="w-4 h-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="w-4 h-4 fill-current text-yellow-400 opacity-50" />);
    }

    return stars;
  };

  if (topSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Top Sellers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our most successful freelancers who consistently deliver exceptional results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topSellers.map((seller, index) => (
            <div
              key={seller.uuid}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative"
            >
              {index < 3 && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center">
                  <FiAward className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={seller.avt_url || `https://i.pravatar.cc/150?u=${seller.username}`}
                    alt={seller.fullname}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://i.pravatar.cc/150?u=${seller.username}`;
                    }}
                  />
                  {seller.rating >= 4.8 && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <FiUser className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {seller.fullname || seller.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{seller.username}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 text-sm">
                {seller.seller_headline || 'Professional Freelancer'}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(seller.rating || 4.5)}
                  </div>
                  <span className="font-medium">{seller.rating || 4.5}</span>
                </div>
                <span>{seller.completedOrders || 50}+ orders</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Response time: {seller.responseTime || '2 hours'}</span>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-transparent border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300">
            View All Sellers
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopSellersSection;
