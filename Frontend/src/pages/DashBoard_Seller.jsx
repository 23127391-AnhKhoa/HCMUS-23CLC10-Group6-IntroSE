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

    if (authUser && token) {
      fetchProfile();
      fetchSellerStats();
    }
  }, [authUser, token]);

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
        <div className="max-w-md mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
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
                <div className="grid grid-cols-2 gap-4 mb-6">
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
      </div>

      <Footer />
    </div>
  );
};

export default DashBoardSeller;