import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Award, TrendingUp, Eye } from 'lucide-react';
import Navbar from '../Common/NavBar_Buyer';
import { useAuth } from '../contexts/AuthContext';
import ReportButton from '../components/ReportButton';
import ServCard from '../Common/ServCard';
const SellerInfo = () => {
    const { sellerId } = useParams();
    const [sellerDetails, setSellerDetails] = useState(null);
    const [sellerGigs, setSellerGigs] = useState([]);
    const [sellerStats, setSellerStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchSellerData = async () => {
            if (!sellerId) {
                console.error("No seller ID provided");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log('🔍 Fetching data for seller:', sellerId);
                
                // Fetch seller details first
                const sellerResponse = await fetch(`http://localhost:8000/api/users/${sellerId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                });
                
                if (!sellerResponse.ok) {
                    throw new Error(`Failed to fetch seller details: ${sellerResponse.status}`);
                }
                
                const sellerData = await sellerResponse.json();
                console.log('👤 Seller data received:', sellerData);
                setSellerDetails(sellerData.data || sellerData);
                
                // Try to fetch gigs using multiple approaches
                try {
                    // First try the stats API
                    console.log('📊 Trying to fetch gigs with stats...');
                    const gigsResponse = await fetch(`http://localhost:8000/api/gigs/seller/${sellerId}/stats`, {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : '',
                        },
                    });
                    
                    if (gigsResponse.ok) {
                        const gigsData = await gigsResponse.json();
                        console.log('📊 Gigs data with stats:', gigsData);
                        
                        if (gigsData.status === 'success' && gigsData.data) {
                            setSellerGigs(gigsData.data);
                            // Calculate basic stats from gigs
                            const totalGigs = gigsData.data.length;
                            const totalRatings = gigsData.data.filter(gig => gig.statistics && gig.statistics.averageRating).length;
                            const avgRating = totalRatings > 0 ? 
                                (gigsData.data.reduce((sum, gig) => sum + (gig.statistics?.averageRating || 0), 0) / totalRatings).toFixed(1) : 
                                null;
                            const totalOrders = gigsData.data.reduce((sum, gig) => sum + (gig.statistics?.totalOrders || 0), 0);
                            
                            setSellerStats({
                                totalGigs,
                                avgRating,
                                totalOrders
                            });
                        }
                    } else {
                        // Fallback: try regular gigs API
                        console.log('⚠️ Stats API failed, trying regular gigs API...');
                        const fallbackResponse = await fetch(`http://localhost:8000/api/gigs?filter_by_owner_id=${sellerId}`, {
                            headers: {
                                Authorization: token ? `Bearer ${token}` : '',
                            },
                        });
                        
                        if (fallbackResponse.ok) {
                            const fallbackData = await fallbackResponse.json();
                            console.log('📋 Fallback gigs data:', fallbackData);
                            
                            if (fallbackData.status === 'success' && fallbackData.data) {
                                setSellerGigs(fallbackData.data);
                                setSellerStats({
                                    totalGigs: fallbackData.data.length,
                                    avgRating: null,
                                    totalOrders: 0
                                });
                            }
                        }
                    }
                } catch (gigsError) {
                    console.error('❌ Error fetching gigs:', gigsError);
                }

            } catch (error) {
                console.error('❌ Error fetching seller data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSellerData();
    }, [sellerId, token]);
    if (!sellerId) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="text-center py-16 text-red-600">
                    <h2 className="text-2xl font-semibold">Seller ID not provided</h2>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading seller profile...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!sellerDetails) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="text-center py-16 text-red-600">
                    <h2 className="text-2xl font-semibold">Seller not found</h2>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            
            {/* Hero Section with Cover and Profile */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Profile Section */}
                <div className="relative -mt-20 pb-8">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                {/* Profile Image */}
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                        <img 
                                            src={sellerDetails.avt_url || "https://placehold.co/200x200"} 
                                            alt={sellerDetails.fullname || "Seller"}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {e.target.src = "https://placehold.co/200x200"}}
                                        />
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1">
                                    <div className="mb-4 relative">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{sellerDetails.fullname}</h1>
                                        <p className="text-lg text-gray-600 mb-1">@{sellerDetails.username}</p>
                                        {sellerDetails.seller_headline && (
                                            <p className="text-gray-700 italic text-lg">{sellerDetails.seller_headline}</p>
                                        )}

                                        <div className="absolute top-0 right-0">
                                        <ReportButton 
                                            userId={sellerDetails.uuid}
                                            className="bg-red-600 hover:bg-red-300 text-white border border-red-200 px-3 py-1 text-sm font-medium rounded-md shadow transition duration-200"
                                        >
                                            Report
                                        </ReportButton>
                                        </div>
                                    </div>
                                    
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{sellerStats?.totalGigs || sellerGigs.length || 0}</div>
                                            <div className="text-sm text-gray-500">Active Gigs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {sellerStats?.avgRating ? `${sellerStats.avgRating}★` : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">Rating</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{sellerStats?.totalOrders || 0}</div>
                                            <div className="text-sm text-gray-500">Orders</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {sellerDetails.created_at ? 
                                                    new Date(sellerDetails.created_at).getFullYear() : 
                                                    'N/A'
                                                }
                                            </div>
                                            <div className="text-sm text-gray-500">Member Since</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                                About {sellerDetails.fullname?.split(' ')[0]}
                            </h2>
                            <div className="space-y-4">
                                {sellerDetails.seller_description ? (
                                    <p className="text-gray-700 leading-relaxed">{sellerDetails.seller_description}</p>
                                ) : (
                                    <p className="text-gray-500 italic">No description provided.</p>
                                )}
                                
                                {sellerDetails.created_at && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Member since {new Date(sellerDetails.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long'
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gigs Section */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                                Services by {sellerDetails.fullname?.split(' ')[0]}
                            </h2>
                            <p className="text-gray-600">Discover amazing services offered by this talented seller</p>
                        </div>

                        {sellerGigs.length > 0 ? (
                            <>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sellerGigs.map((gig, index) => (
                                        <div key={gig.id || index} className="transform hover:scale-105 transition-transform duration-200">
                                            <ServCard gig={gig} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                                <p className="text-gray-600">
                                    This seller hasn't created any services yet. Check back later for exciting offerings!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerInfo;