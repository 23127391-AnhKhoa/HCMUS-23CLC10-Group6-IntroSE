import React from 'react';

const RatingDistribution = ({ ratings = {}, totalReviews = 0 }) => {
  // Calculate percentages for each rating
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  // Default rating distribution
  const distribution = {
    5: ratings[5] || 0,
    4: ratings[4] || 0,
    3: ratings[3] || 0,
    2: ratings[2] || 0,
    1: ratings[1] || 0,
  };

  return (
    <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating];
        const percentage = getPercentage(count);
        
        return (
          <React.Fragment key={rating}>
            <p className="text-[#111517] text-sm font-normal leading-normal">{rating}</p>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d6dce1]">
              <div 
                className="rounded-full bg-[#48759d] transition-all duration-300" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[#627484] text-sm font-normal leading-normal text-right">
              {percentage}%
            </p>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RatingDistribution;
