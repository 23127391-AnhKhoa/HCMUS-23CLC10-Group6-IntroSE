import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Award, TrendingUp, Eye } from 'lucide-react';
import Navbar from '../Common/NavBar_Buyer';
import { useAuth } from '../contexts/AuthContext';
import ReportButton from '../components/ReportButton';
import ServCard from '../Common/ServCard';
import GigService from '../services/gigService';
const SellerInfo = () => {
    const { sellerId } = useParams();
    const [sellerDetails, setSellerDetails] = useState(null);
    const [sellerGigs, setSellerGigs] = useState([]);
    const [sellerStats, setSellerStats] = useState(null);
    const [sellerReviews, setSellerReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gigs'); // 'gigs' or 'reviews'
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Function to fetch seller reviews
    const fetchSellerReviews = async () => {
        if (!sellerId || !token) return;
        
        try {
            setReviewsLoading(true);
            console.log('📝 Fetching seller reviews...');
            
            // Fetch reviews
            const reviewsResponse = await fetch(`http://localhost:8000/api/reviews/seller/${sellerId}?page=1&limit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();
                console.log('✅ Reviews received:', reviewsData);
                if (reviewsData.success && reviewsData.data) {
                    setSellerReviews(reviewsData.data);
                }
            }
            
            // Fetch review stats
            const statsResponse = await fetch(`http://localhost:8000/api/reviews/seller/${sellerId}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log('✅ Review stats received:', statsData);
                if (statsData.success && statsData.data) {
                    setReviewStats(statsData.data);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };
    
    // Function to render star rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            );
        }
        return <div className="flex">{stars}</div>;
    };
    
    // Function to handle gig click
    const handleGigClick = (gigId) => {
        navigate(`/gig/${gigId}`);
    };
    
    useEffect(() => {
        if (activeTab === 'reviews' && sellerId && token) {
            fetchSellerReviews();
        }
    }, [activeTab, sellerId, token]);
    
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
                
                // Try to fetch gigs using the modern GigService first
                try {
                    console.log('📊 Trying to fetch gigs with GigService...');
                    const gigsResult = await GigService.getSellerGigsWithStats(sellerId, token);
                    
                    if (gigsResult.success && gigsResult.data) {
                        console.log('✅ GigService: Gigs data received:', gigsResult.data);
                        setSellerGigs(gigsResult.data);
                        
                        // Calculate stats from gigs
                        const totalGigs = gigsResult.data.length;
                        const gigsWithRatings = gigsResult.data.filter(gig => gig.statistics && gig.statistics.averageRating);
                        const avgRating = gigsWithRatings.length > 0 ? 
                            (gigsWithRatings.reduce((sum, gig) => sum + (gig.statistics?.averageRating || 0), 0) / gigsWithRatings.length).toFixed(1) : 
                            null;
                        const totalOrders = gigsResult.data.reduce((sum, gig) => sum + (gig.statistics?.totalOrders || 0), 0);
                        
                        setSellerStats({
                            totalGigs,
                            avgRating,
                            totalOrders
                        });
                        
                        // Fetch seller rating stats from the reviews API
                        try {
                            console.log('📊 Fetching seller rating stats...');
                            const ratingResponse = await fetch(`http://localhost:8000/api/reviews/seller/${sellerId}/stats`, {
                                headers: {
                                    Authorization: token ? `Bearer ${token}` : '',
                                },
                            });
                            
                            if (ratingResponse.ok) {
                                const ratingData = await ratingResponse.json();
                                console.log('✅ Rating stats received:', ratingData);
                                if (ratingData.success === true && ratingData.data) {
                                    // Update seller stats with rating data from the dedicated API
                                    setSellerStats(prev => ({
                                        ...prev,
                                        avgRating: ratingData.data.averageRating?.toFixed(1) || prev.avgRating,
                                        totalReviews: ratingData.data.totalReviews || 0
                                    }));
                                }
                            }
                        } catch (ratingError) {
                            console.log('⚠️ Rating stats API failed:', ratingError);
                        }
                    } else {
                        throw new Error('GigService returned no data');
                    }
                } catch (gigServiceError) {
                    console.log('⚠️ GigService failed, trying legacy API...');
                    
                    // Fallback to legacy stats API
                    const gigsResponse = await fetch(`http://localhost:8000/api/gigs/seller/${sellerId}/stats`, {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : '',
                        },
                    });
                    
                    if (gigsResponse.ok) {
                        const gigsData = await gigsResponse.json();
                        console.log('📊 Legacy gigs data with stats:', gigsData);
                        
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
                            
                            // Fetch seller rating stats from the reviews API
                            try {
                                console.log('📊 Fetching seller rating stats...');
                                const ratingResponse = await fetch(`http://localhost:8000/api/reviews/seller/${sellerId}/stats`, {
                                    headers: {
                                        Authorization: token ? `Bearer ${token}` : '',
                                    },
                                });
                                
                                if (ratingResponse.ok) {
                                    const ratingData = await ratingResponse.json();
                                    console.log('✅ Rating stats received:', ratingData);
                                    if (ratingData.success === true && ratingData.data) {
                                        // Update seller stats with rating data from the dedicated API
                                        setSellerStats(prev => ({
                                            ...prev,
                                            avgRating: ratingData.data.averageRating?.toFixed(1) || prev.avgRating,
                                            totalReviews: ratingData.data.totalReviews || 0
                                        }));
                                    }
                                }
                            } catch (ratingError) {
                                console.log('⚠️ Rating stats API failed:', ratingError);
                            }
                        }
                    } else {
                        // Final fallback: try regular gigs API
                        console.log('❌ Legacy stats API failed, trying regular gigs API...');
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
                                    totalOrders: 0,
                                    totalReviews: 0
                                });
                                
                                // Fetch seller rating stats from the reviews API
                                try {
                                    console.log('📊 Fetching seller rating stats (fallback)...');
                                    const ratingResponse = await fetch(`http://localhost:8000/api/reviews/seller/${sellerId}/stats`, {
                                        headers: {
                                            Authorization: token ? `Bearer ${token}` : '',
                                        },
                                    });
                                    
                                    if (ratingResponse.ok) {
                                        const ratingData = await ratingResponse.json();
                                        console.log('✅ Rating stats received:', ratingData);
                                        if (ratingData.success === true && ratingData.data) {
                                            // Update seller stats with rating data from the dedicated API
                                            setSellerStats(prev => ({
                                                ...prev,
                                                avgRating: ratingData.data.averageRating?.toFixed(1) || prev.avgRating,
                                                totalReviews: ratingData.data.totalReviews || 0
                                            }));
                                        }
                                    }
                                } catch (ratingError) {
                                    console.log('⚠️ Rating stats API failed:', ratingError);
                                }
                            }
                        }
                    }
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
                                            Id={sellerDetails.uuid}
                                            type='report-user'
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
                                            <div className="text-sm text-gray-500">Active Services</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                                                {sellerStats?.avgRating ? (
                                                    <>
                                                        <span className="mr-1">{sellerStats.avgRating}</span>
                                                        <span className="text-yellow-500">★</span>
                                                    </>
                                                ) : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Rating {sellerStats?.totalReviews ? `(${sellerStats.totalReviews} reviews)` : ''}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{sellerStats?.totalOrders || 0}</div>
                                            <div className="text-sm text-gray-500">Total Orders</div>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6">
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
                            
                            {/* Review Summary in Sidebar */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-3">Reviews</h3>
                                {reviewStats.totalReviews > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            {renderStars(reviewStats.averageRating)}
                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                {reviewStats.averageRating.toFixed(1)}/5
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {reviewStats.totalReviews} reviews
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No reviews yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="xl:col-span-3">
                        {/* Tabs Navigation */}
                        <div className="mb-6">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('gigs')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'gigs'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <TrendingUp className="w-4 h-4 inline mr-2" />
                                    Services ({sellerGigs.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'reviews'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Star className="w-4 h-4 inline mr-2" />
                                    Reviews {sellerStats?.totalReviews ? `(${sellerStats.totalReviews})` : ''}
                                </button>
                            </div>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === 'gigs' ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                                        <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                                        Services by {sellerDetails.fullname?.split(' ')[0]}
                                    </h2>
                                    <p className="text-gray-600">Discover amazing services offered by this talented seller</p>
                                </div>

                                {sellerGigs.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                        {sellerGigs.map((gig, index) => (
                                            <div key={gig.id || index} className="w-full max-w-sm mx-auto transform hover:scale-105 transition-transform duration-200">
                                                <ServCard gig={gig} />
                                            </div>
                                        ))}
                                    </div>
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
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Review Summary */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Customer Reviews
                                        </h3>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end mb-1">
                                                <div className="flex items-center mr-2">
                                                    <Star className="text-yellow-400 w-5 h-5 fill-current mr-1" />
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {reviewStats.averageRating.toFixed(1)}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500">
                                                    ({reviewStats.totalReviews} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Rating Distribution */}
                                    {reviewStats.totalReviews > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    const count = reviewStats.ratingDistribution[star] || 0;
                                                    const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                                                    
                                                    return (
                                                        <div key={star} className="flex items-center text-sm">
                                                            <span className="w-8 text-gray-600">{star}</span>
                                                            <Star className="text-yellow-400 w-3 h-3 fill-current mx-2" />
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                                <div 
                                                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="w-8 text-gray-600 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Review List */}
                                <div className="bg-white rounded-lg shadow-sm">
                                    <div className="p-6">
                                        {reviewsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : sellerReviews.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Star className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                                                <p className="text-gray-600">
                                                    This seller hasn't received any reviews yet.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {sellerReviews.map((review, index) => (
                                                    <div 
                                                        key={review.id || index}
                                                        className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                                                    >
                                                        <div className="flex items-start space-x-4">
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
                                                                        <h5 className="font-medium text-gray-900">
                                                                            {review.buyer?.username || 'Anonymous User'}
                                                                        </h5>
                                                                        <div className="flex items-center mt-1">
                                                                            {renderStars(review.rating)}
                                                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                                                {review.rating}/5
                                                                            </span>
                                                                        </div>
                                                                        {/* Gig Title */}
                                                                        {review.order?.gig_id && (
                                                                            <div className="mt-2">
                                                                                <span className="text-xs text-gray-500">For: </span>
                                                                                <button
                                                                                    onClick={() => handleGigClick(review.order.gig_id)}
                                                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                                                >
                                                                                    {(() => {
                                                                                        const gig = sellerGigs.find(g => g.id === review.order.gig_id);
                                                                                        return gig?.title || `Service #${review.order.gig_id}`;
                                                                                    })()}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <Calendar className="w-4 h-4 mr-1" />
                                                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                
                                                                {review.comment && (
                                                                    <p className="text-gray-700 leading-relaxed">
                                                                        {review.comment}
                                                                    </p>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerInfo;