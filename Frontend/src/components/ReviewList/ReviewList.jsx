// components/ReviewList/ReviewList.jsx
import React, { useState, useEffect } from 'react';
import { StarFilled, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Pagination, Empty } from 'antd';
import ApiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const ReviewList = ({ sellerId, showHeader = true }) => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (sellerId) {
      fetchReviews();
      fetchStats();
    }
  }, [sellerId, pagination.current]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await ApiService.request({
        url: `/reviews/seller/${sellerId}?page=${pagination.current}&limit=${pagination.pageSize}`,
        method: 'GET',
        token
      });

      if (response.success) {
        setReviews(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ApiService.request({
        url: `/reviews/seller/${sellerId}/stats`,
        method: 'GET',
        token
      });

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <StarFilled
            key={index}
            className={`text-sm ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating}/5
        </span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Phân bố đánh giá</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center text-sm">
                <span className="w-8 text-gray-600">{star}</span>
                <StarFilled className="text-yellow-400 text-xs mx-2" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Đánh giá từ khách hàng
            </h3>
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <div className="flex items-center mr-2">
                  <StarFilled className="text-yellow-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">
                    {stats.averageRating}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({stats.totalReviews} đánh giá)
                </span>
              </div>
            </div>
          </div>
          
          {stats.totalReviews > 0 && renderRatingDistribution()}
        </div>
      )}

      <div className="p-6">
        {reviews.length === 0 ? (
          <Empty 
            description="Chưa có đánh giá nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div 
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 animate-review-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {review.buyer?.avt_url ? (
                        <img
                          src={review.buyer.avt_url}
                          alt={review.buyer.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {review.buyer?.username || 'Người dùng ẩn danh'}
                          </h5>
                          <div className="flex items-center mt-1">
                            {renderRatingStars(review.rating)}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarOutlined className="mr-1" />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.total > pagination.pageSize && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} đánh giá`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
