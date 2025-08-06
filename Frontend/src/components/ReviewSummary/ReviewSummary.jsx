// components/ReviewSummary/ReviewSummary.jsx
import React, { useState, useEffect } from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const ReviewSummary = ({ sellerId, compact = false }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) {
      fetchStats();
    }
  }, [sellerId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await ApiService.request({
        url: `/reviews/seller/${sellerId}/stats`,
        method: 'GET',
        token
      });

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 'text-base') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <StarFilled key={i} className={`${size} text-yellow-400`} />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative inline-block">
            <StarOutlined className={`${size} text-gray-300`} />
            <StarFilled 
              className={`${size} text-yellow-400 absolute top-0 left-0`}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(
          <StarOutlined key={i} className={`${size} text-gray-300`} />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <div className={compact ? 'text-sm text-gray-500' : 'text-gray-500'}>
        Chưa có đánh giá
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {renderStars(stats.averageRating, 'text-sm')}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {stats.averageRating}
        </span>
        <span className="text-sm text-gray-500">
          ({stats.totalReviews})
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {renderStars(stats.averageRating, 'text-lg')}
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">
              {stats.averageRating}/5
            </div>
            <div className="text-sm text-gray-600">
              {stats.totalReviews} đánh giá
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.ratingDistribution[star] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center text-xs">
              <span className="w-4 text-gray-600">{star}</span>
              <StarFilled className="text-yellow-400 text-xs mx-1" />
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 mx-2">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-6 text-gray-600 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSummary;
//