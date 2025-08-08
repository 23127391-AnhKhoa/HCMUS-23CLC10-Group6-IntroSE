// pages/ReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { message } from 'antd';
import NavBar_Buyer from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

const ReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, authUser } = useAuth();
  
  console.log('ReviewPage loaded with orderId:', orderId);
  console.log('Auth user:', authUser);
  console.log('Token:', token ? 'exists' : 'missing');
  
  const [order, setOrder] = useState(null);
  const [gig, setGig] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    console.log('=== ReviewPage Effect Starting ===');
    console.log('Order ID:', orderId);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    // Clear previous state to avoid cache issues
    setOrder(null);
    setGig(null);
    setCanReview(false);
    setExistingReview(null);
    
    checkCanReview();
  }, [orderId, token]);

  const checkCanReview = async () => {
    try {
      setLoading(true);
      const response = await ApiService.checkCanReview(orderId);
      console.log('Full API response:', response);

      if (response.success) {
        console.log('✅ API Success - Can Review:', response.canReview);
        setCanReview(response.canReview);
        
        if (response.order) {
          console.log('✅ Order data received:', response.order);
          setOrder(response.order);
        }
        
        if (response.gig) {
          console.log('✅ Gig data received from backend:', response.gig);
          setGig(response.gig);
        } else {
          console.log('❌ No gig data in backend response');
          // Set gig to null to show fallback UI
          setGig(null);
        }
        
        if (response.review) {
          console.log('✅ Existing review found:', response.review);
          setExistingReview(response.review);
          setRating(response.review.rating);
          setComment(response.review.comment || '');
        }
      } else {
        message.error(response.message || 'Error checking review eligibility');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error checking can review:', error);
      message.error('Error checking review eligibility');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchGigInfo = async (gigId) => {
    try {
      console.log('Fetching gig info for gigId:', gigId);
      const response = await ApiService.fetchGigById(gigId);
      console.log('Gig API response:', response);
      
      if (response.success && response.data) {
        setGig(response.data);
      } else if (response.gig) {
        // Handle different response format
        setGig(response.gig);
      } else {
        console.warn('No gig data in response');
      }
    } catch (error) {
      console.error('Error fetching gig info:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      message.error('Please select a star rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await ApiService.createReview({
        orderId: parseInt(orderId),
        rating,
        comment: comment.trim()
      });

      if (response.success) {
        message.success('Review submitted successfully!');
        navigate('/orders');
      } else {
        message.error(response.message || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async () => {
    try {
      setSubmitting(true);
      const response = await ApiService.updateReview(existingReview.id, {
        comment: comment.trim()
      });

      if (response.success) {
        message.success('Review updated successfully!');
        navigate('/orders');
      } else {
        message.error(response.message || 'Error updating review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Error updating review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`text-5xl transition-all duration-300 hover:scale-125 transform ${
            i <= (hoveredRating || rating)
              ? 'text-yellow-400 drop-shadow-lg animate-star-bounce'
              : 'text-gray-300 hover:text-yellow-200'
          } ${existingReview ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
          onMouseEnter={() => !existingReview && setHoveredRating(i)}
          onMouseLeave={() => !existingReview && setHoveredRating(0)}
          onClick={() => !existingReview && setRating(i)}
          disabled={!!existingReview}
        >
          <StarOutlined className={i <= (hoveredRating || rating) ? 'filter drop-shadow-md' : ''} />
        </button>
      );
    }
    return stars;
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Very Dissatisfied',
      2: 'Dissatisfied',
      3: 'Neutral',
      4: 'Satisfied',
      5: 'Very Satisfied'
    };
    return texts[rating] || '';
  };

  if (loading) {
    return (
      <>
        <NavBar_Buyer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!canReview && !existingReview) {
    return (
      <>
        <NavBar_Buyer />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-yellow-500 text-6xl mb-4">
                ⚠️
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Cannot review this order
              </h1>
              <p className="text-gray-600 mb-6">
                You can only review completed orders.
              </p>
              <button
                onClick={() => navigate('/orders')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar_Buyer />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6 group"
            >
              <ArrowLeftOutlined className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {existingReview ? 'Your Review' : 'Review Order'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {existingReview ? 'You can edit your comment' : 'Share your experience about this service'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Gig Information Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Service Being Reviewed
                </h3>
                
                {gig ? (
                  <div className="space-y-6">
                    {/* Gig Cover & Title */}
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={gig.cover_image || order?.gig_cover_image || 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Service'}
                        alt={gig.title || order?.gig_title || 'Service'}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Service';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                        {gig.title || order?.gig_title || 'Service Title'}
                      </h4>
                      
                      {(gig.description || order?.gig_description) && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {gig.description || order?.gig_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Service Price</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${order?.price_at_purchase || gig.price || 'N/A'}
                        </span>
                      </div>
                      
                      {(gig.category || order?.gig_category) && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Category:</span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {gig.category || order?.gig_category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : order ? (
                  // Show order info even if gig data is missing
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                      <div className="text-4xl mb-3">📦</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Order #{order.id}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {order.gig_title || 'Service Order'}
                      </p>
                      <div className="mt-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${order.price_at_purchase || order.price || 'N/A'}
                        </span>
                      </div>
                      {order.gig_category && (
                        <div className="mt-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {order.gig_category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="bg-gray-200 h-48 rounded-xl"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  </div>
                )}

                {/* Order Details */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Order ID:</span>
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        #{order?.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Completed Date:</span>
                      <span className="text-sm font-medium">
                        {order?.completed_at ? new Date(order.completed_at).toLocaleDateString('en-US') : 'N/A'}
                      </span>
                    </div>
                    {order?.seller_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Seller:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {order.seller_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-all duration-300">
                {/* Rating Section */}
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {existingReview ? 'Your Current Rating' : 'How would you rate this service?'}
                  </h3>
                  
                  <div className="flex justify-center items-center space-x-3 mb-6">
                    {renderStars()}
                  </div>
                  
                  {rating > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 animate-fade-in">
                      <p className="text-xl font-semibold text-blue-700">
                        {getRatingText(rating)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Comment Section */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    Share details about your experience
                  </label>
                  <div className="relative">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share what you liked about this service, work quality, delivery time, and overall experience..."
                      className="w-full h-40 p-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      maxLength={1000}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400 bg-white px-2 py-1 rounded">
                      {comment.length}/1000
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  {existingReview ? (
                    <button
                      onClick={handleUpdateReview}
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      ) : (
                        <SendOutlined className="mr-3 text-lg" />
                      )}
                      {submitting ? 'Updating...' : 'Update Review'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting || rating === 0}
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      ) : (
                        <SendOutlined className="mr-3 text-lg" />
                      )}
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReviewPage;
