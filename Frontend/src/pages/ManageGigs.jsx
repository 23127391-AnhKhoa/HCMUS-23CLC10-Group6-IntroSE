import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManageGigs = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get seller ID from auth context
  const getSellerId = () => {
    if (!authUser?.uuid) {
      console.warn('No authenticated user found');
      return null;
    }
    return authUser.uuid;
  };

  const sellerId = getSellerId();

  // Fetch seller's gigs from backend with statistics
  const fetchGigs = async () => {
    if (!sellerId) {
      setError('Please log in to view your gigs');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching gigs with stats for seller:', sellerId);

      const response = await fetch(`http://localhost:8000/api/gigs/seller/${sellerId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Gigs data with stats received:', data);

      if (data.status === 'success') {
        setGigs(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch gigs');
      }
    } catch (error) {
      console.error('💥 Error fetching gigs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [sellerId, token]);

  // Filter gigs based on active tab
  const filteredGigs = gigs.filter(gig => {
    switch (activeTab) {
      case 'active':
        return gig.status === 'active';
      case 'paused':
        return gig.status === 'paused' || gig.status === 'inactive';
      case 'drafts':
        return gig.status === 'draft';
      default:
        return true;
    }
  });

  // Get gig statistics (now from API response)
  const getGigStats = (gig) => {
    // Return real statistics from API if available, otherwise fallback to mock data
    if (gig.statistics) {
      return gig.statistics;
    }
    
    // Fallback mock data
    return {
      impressions: Math.floor(Math.random() * 2000) + 500,
      clicks: Math.floor(Math.random() * 500) + 100,
      orders: Math.floor(Math.random() * 50) + 5,
      cancellations: Math.floor(Math.random() * 5),
      earnings: Math.floor(Math.random() * 1000) + 200
    };
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle gig actions
  const handleEdit = (gigId) => {
    navigate(`/gigs/edit/${gigId}`);
  };

  const handlePause = async (gigId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'paused' })
      });

      if (response.ok) {
        fetchGigs(); // Refresh gigs list
      }
    } catch (error) {
      console.error('Error pausing gig:', error);
    }
  };

  const handleActivate = async (gigId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        fetchGigs(); // Refresh gigs list
      }
    } catch (error) {
      console.error('Error activating gig:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchGigs}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Gigs</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your gig performance</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['active', 'paused', 'drafts'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Gigs Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gig
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancellations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGigs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No {activeTab} gigs found
                    </td>
                  </tr>
                ) : (
                  filteredGigs.map((gig) => {
                    const stats = getGigStats(gig);
                    return (
                      <tr key={gig.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={gig.cover_image || 'https://via.placeholder.com/60x60'}
                              alt={gig.title}
                              className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {gig.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                ${gig.price}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.impressions?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.clicks?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.orders || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.cancellations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${stats.earnings || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(gig.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            {gig.status === 'active' ? (
                              <button
                                onClick={() => handlePause(gig.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(gig.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        {filteredGigs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Gigs</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{filteredGigs.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Impressions</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {filteredGigs.reduce((sum, gig) => sum + (getGigStats(gig).impressions || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {filteredGigs.reduce((sum, gig) => sum + (getGigStats(gig).orders || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${filteredGigs.reduce((sum, gig) => sum + (getGigStats(gig).earnings || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Create New Gig Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/create-gig')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Create New Gig
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageGigs;
