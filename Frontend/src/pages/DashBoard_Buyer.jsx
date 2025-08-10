import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Footer from '../Common/Footer';
import NavBar from '../Common/NavBar_Buyer';
import { useAuth } from '../contexts/AuthContext';
import AvatarUpload from '../components/AvatarUpload';

const DashBoardBuyer = () => {
  const navigate = useNavigate();
  const { authUser, token } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    fullname: '',
    email: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
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
        
        const profile = {
          username: data.data.username || '',
          fullname: data.data.fullname || '',
          email: data.data.email || authUser?.email || '',
          avatar_url: data.data.avt_url || data.data.avatar_url || ''
        };
        
        setProfileData(profile);
        setFormData({
          fullname: profile.fullname,
          username: profile.username,
          avatar_url: profile.avatar_url
        });
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser && token) {
      fetchProfileData();
    }
  }, [authUser, token]);

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        fullname: profileData.fullname,
        username: profileData.username,
        avatar_url: profileData.avatar_url
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          fullname: formData.fullname,
          avt_url: formData.avatar_url,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      console.log('Update response:', data); // Debug log
      
      setProfileData({
        ...profileData,
        username: data.data.username,
        fullname: data.data.fullname,
        avatar_url: data.data.avt_url || data.data.avatar_url,
      });
      setIsEditing(false);
      message.success('Profile updated successfully');
    } catch (err) {
      setError(err.message);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
    setProfileData((prev) => ({ ...prev, avatar_url: avatarUrl }));
  };

  if (loading) return (
    <div className="sticky-footer-page bg-gray-50">
      <NavBar />
      <div className="max-w-md mx-auto px-4 pt-32 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="animate-pulse text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="sticky-footer-page bg-gray-50">
      <NavBar />
      <div className="max-w-md mx-auto px-4 pt-32 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Unable to load profile</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sticky-footer-page bg-gray-50">
      <NavBar />

      <div className="max-w-md mx-auto px-4 pt-32 pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center mb-6">
          {!isEditing ? (
            <>
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <img
                  src={profileData.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format';
                  }}
                />
              </div>
              
              {/* Display Name */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileData.fullname || 'User'}</h1>
              
              {/* Username/ID */}
              <p className="text-gray-600 text-sm mb-1">@{profileData.username}</p>
              
              {/* Email */}
              <p className="text-gray-600 text-sm mb-6">{profileData.email}</p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={toggleEdit}
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
                    currentAvatar={formData.avatar_url}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Choose a username"
                    required
                  />
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
                    onClick={toggleEdit}
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

      <Footer />
    </div>
  );
};

export default DashBoardBuyer;