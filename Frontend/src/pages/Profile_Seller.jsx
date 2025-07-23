import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import AvatarUpload from '../components/AvatarUpload';

const ProfileSeller = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    activeOrders: 0,
    rating: 0,
    responseRate: 0,
    deliveryTime: 'N/A'
  });
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    bio: '',
    skills: '',
    hourlyRate: '',
    avt_url: ''
  });

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
          email: data.data.email || authUser?.email || '',
          bio: data.data.bio || '',
          skills: data.data.skills || '',
          hourlyRate: data.data.hourlyRate || '',
          avt_url: data.data.avatar_url || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveOrders = async () => {
      try {
        setOrdersLoading(true);
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://localhost:8000/api/orders/owner/${authUser.uuid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Orders Data:', data);
        
        // Filter for active orders (only in_progress)
        const activeOrdersData = data.data?.filter(order => 
          order.status?.toLowerCase() === 'in_progress'
        ) || [];
        
        setActiveOrders(activeOrdersData);
      } catch (err) {
        console.error('Failed to fetch active orders:', err);
        setActiveOrders([]);
      } finally {
        setOrdersLoading(false);
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

        let earningsData = {
          totalEarnings: 0,
          totalOrders: 0,
          monthlyOrders: 0
        };

        if (earningsResponse.ok) {
          const earningsResult = await earningsResponse.json();
          earningsData = earningsResult.data || earningsData;
        }

        // Update stats with real data
        setStats({
          totalEarnings: earningsData.totalEarnings || 0,
          totalOrders: earningsData.totalOrders || 0,
          activeOrders: activeOrders.length,
          rating: 0, // Placeholder, as rating fetch is commented out
          responseRate: 95, // This would come from messaging/response data
          deliveryTime: '2-3 days' // This would be calculated from order completion times
        });

      } catch (err) {
        console.error('Failed to fetch seller stats:', err);
        // Keep default stats if fetch fails
      }
    };

    if (authUser && token) {
      fetchProfile();
      fetchActiveOrders();
      fetchSellerStats();
    }
  }, [authUser, token]);

  // Update activeOrders count in stats when activeOrders changes
  useEffect(() => {
    setStats(prevStats => ({
      ...prevStats,
      activeOrders: activeOrders.length
    }));
  }, [activeOrders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData(prev => ({
      ...prev,
      avt_url: avatarUrl
    }));
    // Also update the profile state to reflect changes immediately
    setProfile(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
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
                  currentAvatar={profile?.avatar_url || formData.avt_url}
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
                  <p className="text-sm font-bold text-green-600">${stats.totalEarnings}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                  <h4 className="font-semibold text-blue-800 text-xs mb-1">Orders</h4>
                  <p className="text-xs font-bold text-blue-600">{stats.totalOrders}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg text-center border border-orange-100">
                  <h4 className="font-semibold text-orange-800 text-xs mb-1">Active</h4>
                  <p className="text-xs font-bold text-orange-600">{stats.activeOrders}</p>
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
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-800 line-clamp-1 flex-1">
                          {order.gig_title || order.title || 'Order'}
                        </h4>
                        <span className="text-base font-bold text-green-600 ml-2">
                          ${order.total_price || order.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Client: {order.buyer_name || order.client || 'Client'}</span>
                        <span>Due: {order.delivery_date || order.deadline || 'TBD'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active orders at the moment</p>
                </div>
              )}
              
              <button
                onClick={() => navigate('/orders')}
                className="w-full mt-4 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself and your expertise..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, Node.js, UI/UX Design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>
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

export default ProfileSeller;