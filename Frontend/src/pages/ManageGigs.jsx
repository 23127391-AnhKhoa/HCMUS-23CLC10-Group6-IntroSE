import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar_Seller from '../Common/NavBar_Seller';
import Footer from '../Common/Footer';
import { createSafeHtml, truncateHtml } from '../utils/htmlSanitizer';

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
        console.log('📊 All gigs loaded:', data.data?.length || 0);
        
        // Debug: Log gig statuses
        if (data.data) {
          const statusCounts = data.data.reduce((acc, gig) => {
            acc[gig.status] = (acc[gig.status] || 0) + 1;
            return acc;
          }, {});
          console.log('📈 Gig status breakdown:', statusCounts);
        }
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
        return gig.status === 'paused' ;
      case 'denied':
        return gig.status === 'denied';
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
      console.log('🔄 Pausing gig:', gigId);
      
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'paused' })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pause response:', data);
        fetchGigs(); // Refresh gigs list
      } else {
        const errorData = await response.json();
        console.error('❌ Pause failed:', errorData);
      }
    } catch (error) {
      console.error('💥 Error pausing gig:', error);
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

  const handleDelete = async (gigId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this gig? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting gig:', gigId);
      
      const response = await fetch(`http://localhost:8000/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'deleted' })
      });

      console.log('📡 Delete response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Delete response:', data);
        fetchGigs(); // Refresh gigs list
      } else {
        const errorData = await response.json();
        console.error('❌ Delete failed:', errorData);
      }
    } catch (error) {
      console.error('💥 Error deleting gig:', error);
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
    <>
      <NavBar_Seller />
      <div className="min-h-screen bg-gray-50 pt-24 py-8"> {/* Add pt-24 for NavBar spacing */}
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
              {['active', 'paused', 'denied'].map((tab) => (
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

        {/* Summary Stats */}
        {filteredGigs.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Gigs</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{filteredGigs.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
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
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No {activeTab} gigs found
                    </td>
                  </tr>
                ) : (
                  filteredGigs.map((gig) => {
                    const stats = getGigStats(gig);
                    return (
                      <tr key={gig.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start space-y-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={gig.cover_image || 'https://via.placeholder.com/60x60'}
                                alt={gig.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <button
                                  className="text-base font-semibold text-green-700 hover:underline text-left"
                                  onClick={() => navigate(`/gig/${gig.id}`)}
                                  style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                                >
                                  {gig.title}
                                </button>
                                <p className="text-base font-medium text-gray-700 mt-1">
                                  ${gig.price}
                                </p>
                              </div>
                            </div>
                            <div 
                              className="text-sm text-gray-600 mt-2 line-clamp-2"
                              dangerouslySetInnerHTML={createSafeHtml(
                                gig.description 
                                  ? truncateHtml(gig.description, 100)
                                  : 'No description provided.'
                              )}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                          {stats.orders || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                          {stats.cancellations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                          ${stats.earnings || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(gig.id)}
                              className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                              title="Edit Gig"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {gig.status === 'active' ? (
                              <button
                                onClick={() => handlePause(gig.id)}
                                className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 p-2 rounded-lg transition-colors"
                                title="Pause Gig"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            ) : gig.status === 'paused' ? (
                              <>
                                <button
                                  onClick={() => handleActivate(gig.id)}
                                  className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                  title="Activate Gig"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10-4v4a2 2 0 002 2h8a2 2 0 002-2v-4M7 7V6a1 1 0 011-1h8a1 1 0 011 1v1" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(gig.id)}
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  title="Delete Gig"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleActivate(gig.id)}
                                className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                title="Activate Gig"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10-4v4a2 2 0 002 2h8a2 2 0 002-2v-4M7 7V6a1 1 0 011-1h8a1 1 0 011 1v1" />
                                </svg>
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
      <Footer />
    </>
  );
};

export default ManageGigs;
