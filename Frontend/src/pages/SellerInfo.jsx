import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Common/NavBar_Buyer';
import { useAuth } from '../contexts/AuthContext';
const ReportForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 Report submitted:', formData);
    // TODO: Gửi API tại đây
    alert('Report sent!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">Report Form</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Spam, Inappropriate, Scam..."
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the issue..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};
const SellerInfo = () => {
    const { sellerId } = useParams();
    const [sellerDetails, setSellerDetails] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Add a separate useEffect to log sellerDetails when it changes
    useEffect(() => {
        if (sellerDetails) {
            console.log("Seller details updated:", sellerDetails);
        }
    }, [sellerDetails]);
    
    useEffect(() => {
        const fetchSellerDetails = async () => {
            if (!sellerId) {
                console.error("No seller ID provided");
                return;
            }
            
            try {
                console.log(`Fetching details for seller ID: ${sellerId}`);
                const response = await fetch(`http://localhost:8000/api/users/${sellerId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                });
                
                if (!response.ok) {
                    console.error(`Server returned ${response.status}: ${response.statusText}`);
                    throw new Error(`Failed to fetch seller details: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Seller data received:", data);
                // Check if data.data exists, otherwise use data directly
                setSellerDetails(data.data || data);
                // Don't use hooks inside other functions - removed the nested useEffect

            } catch (error) {
                console.error('Error fetching seller details:', error);
            }
        };
        
        fetchSellerDetails();
    }, [sellerId, token]);
    if (!sellerId) {
        return <div className="text-center py-8 text-red-600">Seller ID not provided.</div>;
    }
    if (!sellerDetails) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Seller Profile Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        {/* Banner and Profile Picture Section */}
                        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-pink-600">
                            {/* Nút Report */}
                            <button
                                onClick={() => <ReportForm />}
                                className="absolute -bottom-12 right-4 bg-red-600 hover:bg-red-300 text-white border border-red-200 px-3 py-1 text-sm font-medium rounded-md shadow transition duration-200"
                            >
                                Report
                            </button>
                            <div className="absolute -bottom-12 left-8">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                    <img 
                                        src={sellerDetails.avt_url || "https://placehold.co/150x150"} 
                                        alt={sellerDetails.fullname || "Seller"}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {e.target.src = "https://placehold.co/150x150"}}
                                    />
                                </div>
                            </div>  
                        </div>
                        
                        {/* Seller Info Section */}
                        <div className="pt-16 pb-8 px-8">
                            <div className="flex flex-wrap justify-between items-start">
                                <div className="mb-4">
                                    <h1 className="text-2xl font-bold text-gray-900">{sellerDetails.fullname}</h1>
                                    <p className="text-gray-600">@{sellerDetails.username}</p>
                                    {sellerDetails.seller_headline && (
                                        <p className="text-gray-700 mt-2 italic">{sellerDetails.seller_headline}</p>
                                    )}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="flex flex-wrap gap-6 mt-6">
                                <div className="text-center px-4">
                                    <p className="text-xl font-bold text-gray-900">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2
                                        }).format(sellerDetails.balance || 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Balance</p>
                                </div>
                                {sellerDetails.role === 'seller' && (
                                    <>
                                        <div className="text-center px-4">
                                            <p className="text-xl font-bold text-gray-900">
                                                {sellerDetails.completed_gigs || 0}
                                            </p>
                                            <p className="text-sm text-gray-600">Active Gigs</p>
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="text-xl font-bold text-gray-900">
                                                {sellerDetails.avg_rating || "N/A"}
                                            </p>
                                            <p className="text-sm text-gray-600">Average Rating</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* About Section */}
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold mb-3">About</h2>
                                <div className="prose prose-sm text-gray-700">
                                    {sellerDetails.seller_description ? (
                                        <p>{sellerDetails.seller_description}</p>
                                    ) : (
                                        <p>No description provided.</p>
                                    )}
                                </div>
                                {sellerDetails.seller_headline && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-600">Headline</p>
                                        <p className="text-base text-gray-800">{sellerDetails.seller_headline}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">User ID</p>
                                        <p className="text-gray-900 text-sm truncate">{sellerDetails.uuid || "Not available"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Role</p>
                                        <p className="text-gray-900">
                                            <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                                                sellerDetails.role === 'seller' ? 'bg-green-100 text-green-800' : 
                                                sellerDetails.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {sellerDetails.role || "buyer"}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Account Created</p>
                                        <p className="text-gray-900">
                                            {sellerDetails.created_at ? 
                                                new Date(sellerDetails.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 
                                                "Not available"
                                            }
                                        </p>
                                    </div>
                                    {sellerDetails.role === 'seller' && (
                                        <div>
                                            <p className="text-gray-500 text-sm">Seller Since</p>
                                            <p className="text-gray-900">
                                                {sellerDetails.seller_since ? 
                                                    new Date(sellerDetails.seller_since).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 
                                                    "Not available"
                                                }
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-gray-500 text-sm">Status</p>
                                        <p className="text-gray-900">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                sellerDetails.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                sellerDetails.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {sellerDetails.status || "Unknown"}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Last Updated</p>
                                        <p className="text-gray-900">
                                            {sellerDetails.updated_at ? 
                                                new Date(sellerDetails.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 
                                                "Not available"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerInfo