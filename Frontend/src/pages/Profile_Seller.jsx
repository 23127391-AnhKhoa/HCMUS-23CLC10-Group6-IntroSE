import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import NavBarSeller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';

const ProfileSeller = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    bio: '',
    skills: '',
    hourlyRate: ''
  });

  // Mock data for demonstration
  const stats = {
    totalEarnings: 2850,
    completedOrders: 47,
    activeOrders: 3,
    rating: 4.9,
    responseRate: 95,
    deliveryTime: '2 days'
  };

  const activeOrders = [
    { 
      id: 1, 
      title: 'Logo Design for Startup', 
      client: 'John Doe', 
      price: 150, 
      deadline: '2 days',
      status: 'In Progress'
    },
    { 
      id: 2, 
      title: 'Website Redesign', 
      client: 'Jane Smith', 
      price: 500, 
      deadline: '5 days',
      status: 'Requirements Review'
    },
    { 
      id: 3, 
      title: 'Social Media Graphics', 
      client: 'Alex Johnson', 
      price: 75, 
      deadline: '1 day',
      status: 'Almost Done'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Completed order', description: 'Logo Design for Tech Co.', time: '2 hours ago' },
    { id: 2, action: 'Received payment', description: '$250 from website project', time: '1 day ago' },
    { id: 3, action: 'New order', description: 'Business card design', time: '2 days ago' },
    { id: 4, action: 'Review received', description: '5 stars from happy client', time: '3 days ago' }
  ];

  const sellerTips = [
    { icon: '💡', tip: 'Complete your profile to attract more buyers', color: 'yellow' },
    { icon: '🎯', tip: 'Create compelling gig titles and descriptions', color: 'green' },
    { icon: '⭐', tip: 'Provide excellent service for 5-star reviews', color: 'blue' },
    { icon: '🚀', tip: 'Respond to messages quickly to improve rating', color: 'purple' }
  ];

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.data);
        setFormData({
          fullname: data.data.fullname || '',
          username: data.data.username || '',
          email: authUser?.email || '',
          bio: data.data.bio || '',
          skills: data.data.skills || '',
          hourlyRate: data.data.hourlyRate || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (authUser && token) {
      fetchProfile();
    }
  }, [authUser, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.fullname?.charAt(0).toUpperCase() || authUser?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profile?.fullname || 'Seller'}</h1>
                <p className="text-gray-600">@{profile?.username || 'username'}</p>
                <p className="text-sm text-gray-500">{authUser?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium ml-1">{stats.rating}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.responseRate}% Response Rate
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={() => navigate('/create-gig')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Gig
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell buyers about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="e.g., React, Node.js, Design"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Active Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Active Orders</h2>
              {activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{order.title}</h3>
                          <p className="text-sm text-gray-600">Client: {order.client}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-green-600 font-medium">${order.price}</span>
                            <span className="text-sm text-orange-600">Due in {order.deadline}</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Requirements Review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            View Details
                          </button>
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Deliver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active orders at the moment.</p>
                  <button
                    onClick={() => navigate('/create-gig')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Gig
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.action}</span> - {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="font-semibold text-green-600">${stats.totalEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Orders Completed</span>
                  <span className="font-semibold text-blue-600">{stats.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Orders</span>
                  <span className="font-semibold text-orange-600">{stats.activeOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Delivery Time</span>
                  <span className="font-semibold text-purple-600">{stats.deliveryTime}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-gig')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Gig
                </button>
                <button
                  onClick={() => navigate('/earnings')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Earnings
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Manage Gigs
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Messages
                </button>
              </div>
            </div>

            {/* Seller Tips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Tips</h3>
              <div className="space-y-3">
                {sellerTips.map((tip, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    tip.color === 'yellow' ? 'bg-yellow-50' :
                    tip.color === 'green' ? 'bg-green-50' :
                    tip.color === 'blue' ? 'bg-blue-50' :
                    'bg-purple-50'
                  }`}>
                    <p className={`text-sm ${
                      tip.color === 'yellow' ? 'text-yellow-800' :
                      tip.color === 'green' ? 'text-green-800' :
                      tip.color === 'blue' ? 'text-blue-800' :
                      'text-purple-800'
                    }`}>
                      {tip.icon} {tip.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileSeller;

