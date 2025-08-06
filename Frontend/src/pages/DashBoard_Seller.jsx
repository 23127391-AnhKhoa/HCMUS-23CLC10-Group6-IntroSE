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
  const [activeOrders, setActiveOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
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

        // Cập nhật rating từ profile
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

        // Fetch earnings overview from new transactions-based endpoint
        const earningsResponse = await fetch(`http://localhost:8000/api/users/${authUser.uuid}/earnings/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let earningsData = {
          totalEarnings: 0,
          totalOrders: 0,
          monthlyOrders: 0
        };

        if (earningsResponse.ok) {
          const earningsResult = await earningsResponse.json();
          earningsData = earningsResult.data || earningsData;
        }

        // Update stats with real data from received_payment transactions
        // Don't override pendingOrders and activeOrders here - let useEffect handle them
        setStats(prevStats => ({
          ...prevStats,
          totalEarnings: earningsData.totalEarnings || 0, // Now from received_payment transactions
          responseRate: 95, // This would come from messaging/response data
          deliveryTime: '2-3 days' // This would be calculated from order completion times
        }));

      } catch (err) {
        console.error('Failed to fetch seller stats:', err);
        // Keep default stats if fetch fails
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
      fetchActiveOrders();
      fetchSellerStats();
    }
  }, [authUser, token]);

  // Function to handle gig click
  const handleGigClick = (gigId) => {
    navigate(`/gig/${gigId}`);
  };

  // Function to handle order click
  const handleOrderClick = () => {
    navigate('/orders');
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
      // Only send fields that can be updated (fullname, username, avt_url)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarSeller />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <NavBarSeller />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Sidebar - Profile and Create Gig */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile */}
            <div className="bg-white rounded-lg shadow-lg p-3 max-w-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">My Profile</h2>
              
              <div className="text-center mb-2">
                <AvatarUpload 
                  currentAvatar={isEditing ? formData.avt_url || profile?.avatar_url : profile?.avatar_url}
                  onAvatarChange={handleAvatarChange}
                  size="medium"
                />
                
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{profile?.fullname || 'Seller'}</h3>
                  <p className="text-sm text-gray-600">@{profile?.username || 'username'}</p>
                  <p className="text-xs text-gray-500 mb-2">{authUser?.email}</p>
                  
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-medium ml-1 text-yellow-700">{stats.rating}</span>
                    </div>
                    <div className="bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">{stats.responseRate}%</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                  <h4 className="font-semibold text-green-800 text-xs mb-1">Earnings</h4>
                  <p className="text-sm font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                  <h4 className="font-semibold text-blue-800 text-xs mb-1">Active Orders</h4>
                  <p className="text-xs font-bold text-blue-600">{activeOrders.length}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg text-center border border-orange-100">
                  <h4 className="font-semibold text-orange-800 text-xs mb-1">Total Orders</h4>
                  <p className="text-xs font-bold text-orange-600">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Create Gig */}
            <div className="bg-white rounded-lg shadow-lg p-3 max-w-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Create Gig</h3>
              <p className="text-xs text-gray-600 mb-3">Ready to showcase your skills?</p>
              <button
                onClick={() => navigate('/create-gig')}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Create New Gig
              </button>
            </div>
          </div>

          {/* Right Sidebar - Active Orders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">Active Orders</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {ordersLoading ? '...' : activeOrders.length}
                </span>
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
                    <div 
                      key={order.id || index} 
                      onClick={() => handleOrderClick()}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                    >
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
                              Customer: {order.buyer?.username || order.buyer_username || order.client_username || 'N/A'}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <div className="flex items-center justify-start mb-6">
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
                                  // Try to get gig title from nested gig data
                                  if (review.order?.gig?.title) {
                                    return review.order.gig.title;
                                  }
                                  if (review.gig?.title) {
                                    return review.gig.title;
                                  }
                                  if (review.order?.gig_title) {
                                    return review.order.gig_title;
                                  }
                                  // Fallback to gig ID
                                  return `Service #${review.order.gig_id}`;
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

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Avatar</label>
                <AvatarUpload 
                  currentAvatar={formData.avt_url}
                  onAvatarChange={handleAvatarChange}
                  size="xlarge"
                  saveImmediately={false}
                />
                <p className="text-xs text-gray-500 mt-2">Click to upload a new avatar</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seller Headline</label>
                <input
                  type="text"
                  name="seller_headline"
                  value={formData.seller_headline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Professional Web Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seller Description</label>
                <textarea
                  name="seller_description"
                  value={formData.seller_description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your services and expertise..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DashBoardSeller;