import React, { useState, useEffect, useMemo } from 'react';
import StarRating from './StarRating';
import RatingDistribution from './RatingDistribution';
import ReviewItem from './ReviewItem';

// Cache for storing fetched reviews to reduce API calls
const reviewsCache = new Map();

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
  
  // New states for filtering and sorting
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest
  const [filterByStar, setFilterByStar] = useState(0); // 0 = all, 1-5 = specific star rating

  // Fetch reviews for this gig
  useEffect(() => {
    if (gigId) {
      fetchReviews();
    }
  }, [gigId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `reviews_${gigId}`;
      const cachedData = reviewsCache.get(cacheKey);
      
      // Use cached data if it exists and is less than 5 minutes old
      if (cachedData && Date.now() - cachedData.timestamp < 300000) {
        console.log('Using cached reviews data');
        setReviews(cachedData.reviews);
        setRatingDistribution(cachedData.distribution);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:8000/api/reviews/gig/${gigId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const reviewsData = data.data.reviews || [];
        
        // Calculate rating distribution
        const distribution = {};
        reviewsData.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        
        // Cache the data
        reviewsCache.set(cacheKey, {
          reviews: reviewsData,
          distribution,
          timestamp: Date.now()
        });
        
        setReviews(reviewsData);
        setRatingDistribution(distribution);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cache when new review is submitted
  const clearReviewsCache = () => {
    const cacheKey = `reviews_${gigId}`;
    reviewsCache.delete(cacheKey);
  };

  // Filtered and sorted reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];
    
    // Filter by star rating
    if (filterByStar > 0) {
      filtered = filtered.filter(review => review.rating === filterByStar);
    }
    
    // Sort reviews
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return filtered;
  }, [reviews, sortBy, filterByStar]);

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
        clearReviewsCache(); // Clear cache when new review is submitted
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
    <div className="flex flex-col max-w-[960px] flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Reviews Header */}
      <div className="flex flex-wrap justify-between gap-3 p-6">
        <p className="text-[#111517] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Reviews
        </p>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col lg:flex-row gap-8 px-6 pb-6">
        {/* Left Side - Overall Rating */}
        <div className="flex flex-col items-center lg:items-start gap-3 lg:min-w-[200px]">
          <p className="text-[#111517] text-5xl font-black leading-tight tracking-[-0.033em]">
            {avgRating ? avgRating.toFixed(1) : '0.0'}
          </p>
          <StarRating rating={avgRating || 0} size={20} />
          <p className="text-[#111517] text-base font-medium leading-normal">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Right Side - Rating Distribution */}
        <div className="flex-1">
          <RatingDistribution ratings={ratingDistribution} totalReviews={totalReviews} />
        </div>
      </div>

      {/* Filter and Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-6 px-6 py-4 bg-gray-50 border-y border-gray-200">
          {/* Filter by Star Rating */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by:</label>
            <select
              value={filterByStar}
              onChange={(e) => setFilterByStar(Number(e.target.value))}
              className="min-w-[120px] px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#48759d] focus:border-transparent transition-colors appearance-none cursor-pointer hover:border-gray-400"
            >
              <option value={0}>All Stars</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[140px] px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#48759d] focus:border-transparent transition-colors appearance-none cursor-pointer hover:border-gray-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 ml-auto">
            Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="px-6 pt-4 pb-2">
        <h3 className="text-[#111517] text-lg font-bold leading-tight tracking-[-0.015em]">
          Customer Reviews
        </h3>
      </div>
      
      <div className="flex flex-col gap-6 px-6 pb-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#48759d]"></div>
          </div>
        ) : filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review}
              onLike={(reviewId) => console.log('Like review:', reviewId)}
              onDislike={(reviewId) => console.log('Dislike review:', reviewId)}
            />
          ))
        ) : reviews.length > 0 ? (
          <div className="text-center py-8 text-[#627484] bg-gray-50 rounded-xl">
            <p>No reviews match the selected filter.</p>
            <button 
              onClick={() => {
                setFilterByStar(0);
                setSortBy('newest');
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-[#627484] bg-gray-50 rounded-xl">
            <p>No reviews yet. Be the first to review this gig!</p>
          </div>
        )}
      </div>

      {/* Write Review Section */}
      {canWriteReview && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-[#111517] text-lg font-bold leading-tight tracking-[-0.015em]">
              Write a Review
            </h3>
          </div>
          
          {/* Rating Input */}
          <div className="px-6 py-3">
            <p className="text-[#111517] text-sm font-medium mb-2">Your Rating:</p>
            <InteractiveStarRating 
              rating={newRating} 
              onRatingChange={setNewRating}
            />
          </div>
          
          {/* Review Text Input */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-6 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Write your review here"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-2xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#d6dce1] bg-gray-50 focus:border-[#48759d] min-h-36 placeholder:text-[#627484] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex px-6 py-4 justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={!newReview.trim() || newRating === 0}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-10 px-4 bg-[#48759d] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a5f7a] transition-colors"
            >
              <span className="truncate">Submit Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
