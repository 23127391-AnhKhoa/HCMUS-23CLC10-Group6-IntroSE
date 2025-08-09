import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import AvatarUpload from '../components/AvatarUpload';

const DashBoardSeller = () => {
  const { authUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    rating: 0,
    responseRate: 95
  });
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    avt_url: '',
    seller_headline: '',
    seller_description: ''
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!token) throw new Error('No token found');

        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        setProfile(data.data);
        setFormData({
          fullname: data.data.fullname || '',
          username: data.data.username || '',
          avt_url: data.data.avt_url || data.data.avatar_url || '',
          seller_headline: data.data.seller_headline || '',
          seller_description: data.data.seller_description || ''
        });

        // Update rating from profile
        setStats(prevStats => ({
          ...prevStats,
          rating: data.data.rating || 0
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSellerStats = async () => {
      try {
        if (!token || !authUser?.uuid) return;

        // Fetch earnings overview
        const earningsResponse = await fetch(`http://localhost:8000/api/users/${authUser.uuid}/earnings/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (earningsResponse.ok) {
          const earningsResult = await earningsResponse.json();
          const earningsData = earningsResult.data || {};
          
          setStats(prevStats => ({
            ...prevStats,
            totalEarnings: earningsData.totalEarnings || 0,
            totalOrders: earningsData.totalOrders || 0
          }));
        }
      } catch (err) {
        console.error('Failed to fetch seller stats:', err);
      }
    };

    const fetchActiveOrders = async () => {
      try {
        if (!token || !authUser?.uuid) return;
        
        setOrdersLoading(true);
        // Use the correct API endpoint - filter orders by current user and status
        const response = await fetch(`http://localhost:8000/api/orders?status=in_progress&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📋 Orders API response:', result);
          if (result.status === 'success' && result.data) {
            // Filter orders to only show ones where current user is the seller
            const sellerOrders = result.data.filter(order => 
              order.gig_owner_id === authUser.uuid || 
              order.seller_id === authUser.uuid
            );
            setActiveOrders(sellerOrders);
          }
        } else {
          console.error('Orders API error:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('Failed to fetch active orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    const fetchRecentReviews = async () => {
      try {
        if (!token || !authUser?.uuid) return;
        
        setReviewsLoading(true);
        const response = await fetch(`http://localhost:8000/api/reviews/seller/${authUser.uuid}?page=1&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setRecentReviews(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recent reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (authUser && token) {
      fetchProfile();
      fetchSellerStats();
      fetchActiveOrders();
      fetchRecentReviews();
    }
  }, [authUser, token]);

  // Function to handle order click
  const handleOrderClick = (orderId) => {
    navigate('/orders');
  };

  // Function to handle gig click
  const handleGigClick = (gigId) => {
    navigate(`/gig/${gigId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (avatarUrl) => {
    // Only update formData for the form - don't save to database yet
    setFormData(prev => ({
      ...prev,
      avt_url: avatarUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that can be updated (fullname, username, avt_url, seller_headline, seller_description)
      const updateData = {
        fullname: formData.fullname,
        username: formData.username,
        avt_url: formData.avt_url,
        seller_headline: formData.seller_headline,
        seller_description: formData.seller_description
      };

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);
      
      // Update AuthContext with the new profile data
      if (updateUser) {
        updateUser(data.data);
      }
      
      setIsEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast('Error updating profile: ' + err.message, 'error');
    }
  };

  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  // Function to format order status
  const getStatusBadge = (status) => {
    const statusConfig = {
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="sticky-footer-page bg-gray-50">
        <NavBarSeller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sticky-footer-page bg-gray-50">
        <NavBarSeller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky-footer-page bg-gray-50">
      <NavBarSeller />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center sticky top-6">
              {!isEditing ? (
                <>
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <img
                      src={profile?.avt_url || profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format';
                      }}
                    />
                  </div>
                  
                  {/* Display Name */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.fullname || 'Seller'}</h1>
                  
                  {/* Username/ID */}
                  <p className="text-gray-600 text-sm mb-1">@{profile?.username}</p>
                  
                  {/* Email */}
                  <p className="text-gray-600 text-sm mb-2">{authUser?.email}</p>
                  
                  {/* Seller Headline */}
                  {profile?.seller_headline && (
                    <p className="text-gray-700 font-medium text-sm mb-1">{profile.seller_headline}</p>
                  )}
                  
                  {/* Seller Description */}
                  {profile?.seller_description && (
                    <p className="text-gray-600 text-xs mb-4 max-w-xs mx-auto leading-relaxed">
                      {profile.seller_description}
                    </p>
                  )}
                  
                  {!profile?.seller_headline && !profile?.seller_description && (
                    <div className="mb-4"></div>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <h4 className="font-semibold text-green-800 text-xs mb-1">Total Earnings</h4>
                      <p className="text-lg font-bold text-green-600 truncate">${stats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-800 text-xs mb-1">Total Orders</h4>
                      <p className="text-lg font-bold text-blue-600">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <h4 className="font-semibold text-yellow-800 text-xs mb-1">Rating</h4>
                      <p className="text-lg font-bold text-yellow-600">★ {stats.rating.toFixed(1)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-purple-800 text-xs mb-1">Response Rate</h4>
                      <p className="text-lg font-bold text-purple-600">{stats.responseRate}%</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => navigate('/orders')}
                      className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Orders
                    </button>
                    
                    <button
                      onClick={() => navigate('/manage-gigs')}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage Gigs
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                      <AvatarUpload 
                        currentAvatar={formData.avt_url}
                        onAvatarChange={handleAvatarChange}
                        size="xlarge"
                      />
                    </div>
                    
                    {/* Form Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seller Headline
                      </label>
                      <input
                        type="text"
                        name="seller_headline"
                        value={formData.seller_headline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Professional Web Developer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seller Description
                      </label>
                      <textarea
                        name="seller_description"
                        value={formData.seller_description}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                        placeholder="Describe your services and expertise..."
                        style={{ minHeight: '120px' }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seller_description.length}/500 characters
                      </p>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Active Orders and Recent Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Active Orders
                </h2>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
                  <p className="text-gray-600">You don't have any orders in progress at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order, index) => (
                    <div key={order.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                         onClick={() => handleOrderClick(order.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {order.gig?.title || order.gig_title || `Order #${order.id}`}
                            </h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Customer: {order.buyer?.username || order.client_username || order.buyer_username || 'N/A'}
                            </p>
                            <span className="font-semibold text-green-600">
                              ${order.price_at_purchase || order.total_amount || order.amount || order.price || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Recent Reviews
                </h2>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">You haven't received any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div key={review.id || index} className="border border-gray-200 rounded-lg p-4">
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
                              <span className="text-gray-500 text-sm font-medium">
                                {review.buyer?.username?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900 text-sm">
                                {review.buyer?.username || 'Anonymous User'}
                              </h5>
                              <div className="flex items-center mt-1">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-gray-600">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                          
                          {/* Clickable Gig Title */}
                          {review.order?.gig_id && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">For: </span>
                              <button
                                onClick={() => handleGigClick(review.order.gig_id)}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                              >
                                {(() => {
                                  // Try to get gig title from nested gig data first
                                  if (review.gig?.title) {
                                    return review.gig.title;
                                  }
                                  if (review.order?.gig?.title) {
                                    return review.order.gig.title;
                                  }
                                  if (review.order?.gig_title) {
                                    return review.order.gig_title;
                                  }
                                  if (review.gig_title) {
                                    return review.gig_title;
                                  }
                                  // Generic fallback
                                  return "Completed Service";
                                })()}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashBoardSeller;