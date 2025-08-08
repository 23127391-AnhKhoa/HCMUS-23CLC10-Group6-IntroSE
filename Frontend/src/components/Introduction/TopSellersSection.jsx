import React, { useState, useEffect } from 'react';
import { FiStar, FiAward, FiUser, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TopSellersSection = () => {
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/top-sellers?limit=3');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            setTopSellers(result.data || []);
          } else {
            console.error('Failed to fetch top sellers:', result.message);
            setTopSellers([]);
          }
        } else {
          console.error('Failed to fetch top sellers:', response.statusText);
          setTopSellers([]);
        }
      } catch (error) {
        console.error('Error fetching top sellers:', error);
        setTopSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  const formatEarnings = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${Math.round(amount)}`;
    }
  };

  if (loading) {
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
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (topSellers.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Top Sellers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading top sellers...
            </p>
          </div>
        </div>
      </section>
    );
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
                  {index === 0 && (
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
                <div className="flex items-center text-green-600 font-semibold">
                  <FiDollarSign className="w-4 h-4 mr-1" />
                  <span>{formatEarnings(seller.totalEarnings)} earned</span>
                </div>
                
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Rank #{index + 1}</span>
                <Link 
                  to={`/SellerInfo/${seller.uuid}`}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopSellersSection;
