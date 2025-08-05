import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import RatingDistribution from './RatingDistribution';
import ReviewItem from './ReviewItem';

const ReviewSection = ({ 
  gigId, 
  avgRating = 0, 
  totalReviews = 0, 
  onSubmitReview 
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [canWriteReview, setCanWriteReview] = useState(false);

  // Fetch reviews for this gig
  useEffect(() => {
    if (gigId) {
      fetchReviews();
    }
  }, [gigId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/reviews/gig/${gigId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews || []);
        
        // Calculate rating distribution
        const distribution = {};
        data.data.reviews.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        setRatingDistribution(distribution);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) {
      alert('Please provide both a rating and a review comment.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          gigId,
          rating: newRating,
          comment: newReview,
        }),
      });

      if (response.ok) {
        setNewReview('');
        setNewRating(0);
        fetchReviews(); // Refresh reviews
        if (onSubmitReview) {
          onSubmitReview(); // Callback to refresh gig data
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const InteractiveStarRating = ({ rating, onRatingChange, size = 24 }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className="transition-colors hover:scale-110"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onRatingChange(star)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={`${size}px`} 
              height={`${size}px`} 
              fill="currentColor" 
              viewBox="0 0 256 256"
              className={`${
                star <= (hoveredRating || rating) 
                  ? 'text-[#48759d]' 
                  : 'text-[#d6dce1]'
              }`}
            >
              <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col max-w-[960px] flex-1">
      {/* Reviews Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111517] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Reviews
        </p>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-[#111517] text-4xl font-black leading-tight tracking-[-0.033em]">
            {avgRating ? avgRating.toFixed(1) : '0.0'}
          </p>
          <StarRating rating={avgRating || 0} size={18} />
          <p className="text-[#111517] text-base font-normal leading-normal">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
        
        <RatingDistribution ratings={ratingDistribution} totalReviews={totalReviews} />
      </div>

      {/* Reviews List */}
      <h3 className="text-[#111517] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Customer Reviews
      </h3>
      
      <div className="flex flex-col gap-8 overflow-x-hidden bg-gray-50 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#48759d]"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review}
              onLike={(reviewId) => console.log('Like review:', reviewId)}
              onDislike={(reviewId) => console.log('Dislike review:', reviewId)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-[#627484]">
            <p>No reviews yet. Be the first to review this gig!</p>
          </div>
        )}
      </div>

      {/* Write Review Section */}
      {canWriteReview && (
        <>
          <h3 className="text-[#111517] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Write a Review
          </h3>
          
          {/* Rating Input */}
          <div className="px-4 py-2">
            <p className="text-[#111517] text-sm font-medium mb-2">Your Rating:</p>
            <InteractiveStarRating 
              rating={newRating} 
              onRatingChange={setNewRating}
            />
          </div>
          
          {/* Review Text Input */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Write your review here"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#d6dce1] bg-gray-50 focus:border-[#48759d] min-h-36 placeholder:text-[#627484] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex px-4 py-3 justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={!newReview.trim() || newRating === 0}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#48759d] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a5f7a] transition-colors"
            >
              <span className="truncate">Submit Review</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSection;
