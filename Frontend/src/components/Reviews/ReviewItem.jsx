import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review, onLike, onDislike }) => {
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
      
      <div className="flex gap-9 text-[#627484]">
        <button 
          className="flex items-center gap-2 hover:text-[#48759d] transition-colors"
          onClick={() => onLike && onLike(review.id)}
        >
          <div className="text-inherit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
            </svg>
          </div>
          <p className="text-inherit">{review.likes || 0}</p>
        </button>
        <button 
          className="flex items-center gap-2 hover:text-[#48759d] transition-colors"
          onClick={() => onDislike && onDislike(review.id)}
        >
          <div className="text-inherit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
            </svg>
          </div>
          <p className="text-inherit">{review.dislikes || 0}</p>
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;
//