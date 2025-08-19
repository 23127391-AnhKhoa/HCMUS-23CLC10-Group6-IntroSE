import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const getAvatarUrl = (user) => {
    if (user?.avt_url) return user.avt_url;
    // Generate a placeholder avatar based on username
    const name = user?.username || user?.fullname || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=48759d&color=fff&size=40`;
  };

  return (
    <div className="flex flex-col gap-3 bg-gray-50">
      <div className="flex items-center gap-3">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage: `url("${getAvatarUrl(review.buyer)}")`
          }}
        />
        <div className="flex-1">
          <p className="text-[#111517] text-base font-medium leading-normal">
            {review.buyer?.fullname || review.buyer?.username || 'Anonymous User'}
          </p>
          <p className="text-[#627484] text-sm font-normal leading-normal">
            {formatDate(review.created_at)}
          </p>
        </div>
      </div>
      
      <StarRating rating={review.rating} size={20} />
      
      <p className="text-[#111517] text-base font-normal leading-normal">
        {review.comment || 'No comment provided.'}
      </p>
    </div>
  );
};

export default ReviewItem;
//