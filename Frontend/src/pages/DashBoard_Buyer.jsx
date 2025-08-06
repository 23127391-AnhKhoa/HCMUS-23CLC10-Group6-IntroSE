import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Input, message } from 'antd';
import Footer from '../Common/Footer';
import NavBar from '../Common/NavBar_Buyer';
import { useAuth } from '../contexts/AuthContext';
import AvatarUpload from '../components/AvatarUpload';

const DashBoardBuyer = () => {
  const navigate = useNavigate();
  const { authUser, token } = useAuth();
  const [profileData, setProfileData] = useState({
    username: 'Unnamed Buyer',
    avatarUrl: '',
    balance: 0.00,
    status: 'Inactive',
    fullname: '',
    email: '',
    bio: '',
    avt_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    bio: '',
    avt_url: ''
  });
  const [recommendedGigs, setRecommendedGigs] = useState([]);
  const [gigsLoading, setGigsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        console.log('Token:', token);
        if (!token) throw new Error('No token found');

        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Response Status:', response.status);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Data:', data);
        setProfileData({
          username: data.data.username || 'Unnamed Buyer',
          avatarUrl: data.data.avatar_url || '',
          balance: data.data.balance || 0.00,
          status: data.data.status || 'Inactive',
          fullname: data.data.fullname || '',
          email: data.data.email || authUser?.email || '',
          bio: data.data.bio || '',
          avt_url: data.data.avatar_url || ''
        });
        setFormData({
          fullname: data.data.fullname || '',
          username: data.data.username || '',
          email: data.data.email || authUser?.email || '',
          bio: data.data.bio || '',
          avt_url: data.data.avatar_url || ''
        });
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendedGigs = async () => {
      try {
        setGigsLoading(true);
        
        // PRIMARY: Sử dụng recommendations endpoint
        const response = await fetch('http://localhost:8000/api/gigs/recommendations?limit=3', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Recommended Gigs Data:', data);
        
        setRecommendedGigs(data.data || []);
      } catch (err) {
        console.error('Failed to fetch recommended gigs:', err);
        
        // FALLBACK: Nếu recommendations fail, dùng regular gigs
        try {
          const fallbackResponse = await fetch('http://localhost:8000/api/gigs?limit=3', {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            // Transform regular gigs data to match recommendations format
            const transformedGigs = (fallbackData.data || []).slice(0, 3).map(gig => ({
              gig_id: gig.id,
              title: gig.title,
              description: gig.description,
              price: gig.price,
              rating: gig.rating || '5.0',
              seller_name: gig.owner_username || gig.owner_fullname || 'Seller',
              created_at: gig.created_at
            }));
            setRecommendedGigs(transformedGigs);
          } else {
            setRecommendedGigs([]);
          }
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          setRecommendedGigs([]);
        }
      } finally {
        setGigsLoading(false);
      }
    };

    if (authUser && token) {
      fetchProfileData();
    }
    
    // Fetch recommended gigs regardless of auth status
    fetchRecommendedGigs();
  }, [authUser, token]);

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        fullname: profileData.fullname || '',
        username: profileData.username || '',
        email: profileData.email || authUser?.email || '',
        bio: profileData.bio || '',
        avt_url: profileData.avt_url || ''
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
          bio: formData.bio,
          avt_url: formData.avt_url,
        }),
      });

      console.log('Save Response Status:', response.status);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Save Response Data:', data);
      setProfileData({
        ...profileData,
        username: data.data.username,
        fullname: data.data.fullname,
        bio: data.data.bio,
        avatarUrl: data.data.avatar_url,
        avt_url: data.data.avatar_url,
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
    setFormData((prev) => ({ ...prev, avt_url: avatarUrl }));
    setProfileData((prev) => ({ ...prev, avt_url: avatarUrl, avatarUrl: avatarUrl }));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Sidebar - Profile and Explore */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile */}
            <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">My Profile</h2>
              
              <div className="text-center mb-2">
                  <div className="flex flex-col items-center">
                    <div className="mb-3">
                      <img
                        src={profileData.avatarUrl || 'https://via.placeholder.com/48'}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                        onError={(e) => {
                          console.log('Avatar image failed to load:', e.target.src);
                          e.target.src = 'https://via.placeholder.com/48';
                        }}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">{profileData.fullname || profileData.username}</h3>
                    <p className="text-sm text-gray-600">@{profileData.username}</p>
                    <p className="text-sm text-gray-600">Buyer</p>
                    {profileData.bio && (
                      <p className="text-xs text-gray-500 text-center mt-1">{profileData.bio}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">{authUser?.email}</p>
                  <button
                    onClick={toggleEdit}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  </div>
              </div>

              <div className="space-y-2">
                <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                  <h4 className="font-semibold text-blue-800 text-xs">Balance</h4>
                  <p className="text-base font-bold text-blue-600">${profileData.balance.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                  <h4 className="font-semibold text-green-800 text-xs">Status</h4>
                  <p className="text-sm font-semibold text-green-600">{profileData.status}</p>
                </div>
              </div>
            </div>

            {/* Explore */}
            <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Explore</h3>
              <button
                onClick={() => navigate('/explore')}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                🔍 Browse All Services
              </button>
            </div>
          </div>

          {/* Right Sidebar - Recommended */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Recommended</h3>
              {gigsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendedGigs.length > 0 ? (
                <div className="space-y-3">
                  {recommendedGigs.map((gig) => (
                    <div 
                      key={gig.gig_id} 
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                      onClick={() => navigate(`/gig/${gig.gig_id}`)}
                    >
                      <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">by {gig.seller_name || 'Seller'}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm text-gray-600">{gig.rating || '5.0'}</span>
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          ${gig.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No gigs available at the moment</p>
                </div>
              )}
              <button
                onClick={() => navigate('/explore')}
                className="w-full mt-4 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
              >
                View More
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
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

export default DashBoardBuyer;