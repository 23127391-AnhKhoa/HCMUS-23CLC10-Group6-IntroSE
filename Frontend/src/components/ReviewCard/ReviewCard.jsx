// components/ReviewCard/ReviewCard.jsx
import React from 'react';
import { StarFilled, UserOutlined } from '@ant-design/icons';

const ReviewCard = ({ review, compact = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <StarFilled
            key={index}
            className={`text-xs ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            {review.buyer?.avt_url ? (
              <img
                src={review.buyer.avt_url}
                alt={review.buyer.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <UserOutlined className="text-xs text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 text-xs">
                {review.buyer?.username || 'Anonymous'}
              </span>
              {renderStars(review.rating)}
            </div>
            
            {review.comment && (
              <p className="text-gray-600 text-xs line-clamp-2">
                {review.comment}
              </p>
            )}
            
            <span className="text-xs text-gray-500 mt-1">
              {formatDate(review.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3">
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
              <h4 className="font-medium text-gray-900">
                {review.buyer?.username || 'Anonymous User'}
              </h4>
              <div className="flex items-center mt-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm text-gray-600">
                  {review.rating}/5
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </span>
          </div>
          
          {review.comment && (
            <p className="text-gray-700 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
