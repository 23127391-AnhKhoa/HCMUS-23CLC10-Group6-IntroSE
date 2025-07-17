import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { HeartFilled } from '@ant-design/icons';
import NavBar from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import CreateOrderModal from '../components/CreateOrderModal/CreateOrderModal';
import { useAuth } from '../contexts/AuthContext';

const GigDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, authUser, isLoading: authLoading } = useAuth();
    const [gig, setGig] = useState(null);
    const [sellerDetails, setSellerDetails] = useState(null);
    const [gigMedia, setGigMedia] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);

    // Check favorite status when component mounts and user is available
    useEffect(() => {
        if (authUser && id && !authLoading) {
            checkFavoriteStatus();
        }
    }, [authUser, id, authLoading]);

    const checkFavoriteStatus = async () => {
        if (!authUser || !token) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/favorites/check/${authUser.uuid}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setIsFavorited(data.data.isFavorited);
                }
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleFavoriteToggle = async () => {
        if (!authUser || !token) {
            setErrorNotification('Please log in to save favorites');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gig_id: id }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setIsFavorited(data.data.isFavorited);
                    // Show success message
                    setErrorNotification(
                        data.data.action === 'added' 
                            ? 'Added to favorites!' 
                            : 'Removed from favorites!'
                    );
                    // Clear message after 2 seconds
                    setTimeout(() => setErrorNotification(''), 2000);
                }
            } else {
                throw new Error('Failed to toggle favorite');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setErrorNotification('Failed to update favorites');
        }
    };

    const [errorNotification, setErrorNotification] = useState('');
    
    const handleCreateOrder = () => {
        if (!authUser) {
            setErrorNotification('Please log in to create an order');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            return;
        }
        
        // Check if user is trying to order their own gig
        if (gig && gig.owner_id === authUser.uuid) {
            setErrorNotification('You cannot order your own gig');
            return;
        }
        
        setShowCreateOrderModal(true);
    };

    const handleOrderSubmit = async (orderData) => {
        if (!authUser || !token) {
            setErrorNotification('Please log in to create an order');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            return { success: false, error: 'Authentication required' };
        }

        try {
            console.log('📝 Creating order from gig detail:', orderData);
            
            // Create order with client info and modal data
            const orderPayload = {
                client_id: authUser.uuid,
                gig_id: orderData.gig_id || gig.id, // Use the gig_id from form or fallback to current gig
                price_at_purchase: orderData.price_at_purchase || Number(gig.price),
                requirement: orderData.requirements || `Order for: ${gig.title}`,
                status: orderData.status || 'pending'
                // Note: delivery_deadline will be calculated when seller confirms the order
            };
            
            console.log('📦 Order payload:', orderPayload);
            console.log('👤 Auth user:', authUser);
            console.log('🎫 Token:', token ? 'Present' : 'Missing');
            console.log('🔍 Payload validation:', {
                client_id: !!orderPayload.client_id,
                gig_id: !!orderPayload.gig_id,
                price_at_purchase: typeof orderPayload.price_at_purchase === 'number' && orderPayload.price_at_purchase > 0,
                requirement: !!orderPayload.requirement,
                status: !!orderPayload.status
            });
            
            const response = await fetch('http://localhost:8000/api/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error details:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                
                let errorMessage = `Failed to create order: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                // Indicate success
                setOrderCreated(true);
            } else {
                throw new Error(data.message || 'Failed to create order');
            }
        } catch (err) {
            console.error('❌ Error creating order:', err);
            // Return error object instead of showing alert
            return {
                success: false,
                error: err.message
            };
        }
        
        // If we get here, the order was created successfully
        return { success: true };
    };

    useEffect(() => {
        fetchGigDetail();
    }, [id]);

    // Auto-dismiss error notification after 5 seconds
    useEffect(() => {
        if (errorNotification) {
            const timer = setTimeout(() => {
                setErrorNotification('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorNotification]);

    const fetchGigDetail = async () => {
        try {
            setLoading(true);
            console.log('🚀 Fetching gig detail for ID:', id);
            
            const response = await fetch(`http://localhost:8000/api/gigs/${id}`);
            console.log('📊 Gig detail response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch gig: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📦 Gig detail received:', data);
            
            if (data.status === 'success') {
                setGig(data.data);
                
                // Fetch additional seller details
                if (data.data.owner_id) {
                    try {
                        const sellerResponse = await fetch(`http://localhost:8000/api/users/${data.data.owner_id}`);
                        if (sellerResponse.ok) {
                            const sellerData = await sellerResponse.json();
                            if (sellerData.status === 'success') {
                                setSellerDetails(sellerData.data);
                            }
                        }
                    } catch (sellerError) {
                        console.log('Could not fetch seller details:', sellerError);
                        // Continue without seller details
                    }
                }

                // Fetch gig media
                try {
                    console.log('🎬 Fetching gig media for ID:', id);
                    const mediaResponse = await fetch(`http://localhost:8000/api/gigs/${id}/media`);
                    console.log('🎬 Media response status:', mediaResponse.status);
                    
                    if (mediaResponse.ok) {
                        const mediaData = await mediaResponse.json();
                        console.log('🎬 Media data received:', mediaData);
                        
                        if (mediaData.status === 'success') {
                            console.log('🎬 Setting gig media:', mediaData.data);
                            setGigMedia(mediaData.data || []);
                        } else {
                            console.log('🎬 Media API returned error:', mediaData.message);
                        }
                    } else {
                        const errorText = await mediaResponse.text();
                        console.log('🎬 Media response not ok:', errorText);
                    }
                } catch (mediaError) {
                    console.error('🎬 Error fetching gig media:', mediaError);
                    // Continue without media
                }
            } else {
                throw new Error(data.message || 'Failed to fetch gig');
            }
        } catch (err) {
            console.error('💥 Error fetching gig detail:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get all images (cover + additional media)
    const getAllImages = () => {
        const images = [];
        
        // Add cover image first
        if (gig?.cover_image) {
            images.push({
                url: gig.cover_image,
                type: 'cover',
                id: 'cover'
            });
        }
        
        // Add additional media images
        if (gigMedia && gigMedia.length > 0) {
            console.log('🎬 Processing gigMedia:', gigMedia);
            gigMedia.forEach(media => {
                if (media.url && media.url !== gig?.cover_image) {
                    images.push({
                        url: media.url,
                        type: media.media_type || 'image', // Default to 'image' if media_type is null
                        id: media.id
                    });
                }
            });
        }
        
        return images;
    };

    const allImages = getAllImages();

    // Debug logging
    console.log('🖼️ All images:', allImages);
    console.log('📊 Images count:', allImages.length);
    console.log('🎯 Current index:', currentImageIndex);
    console.log('🎬 GigMedia state:', gigMedia);
    console.log('🎭 Gig cover image:', gig?.cover_image);

    const nextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === allImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? allImages.length - 1 : prev - 1
        );
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    if (loading || authLoading) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gig</h1>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <div className="space-x-4">
                            <button 
                                onClick={fetchGigDetail}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#336088] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em]"
                            >
                                Retry
                            </button>
                            <button 
                                onClick={() => navigate(-1)}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#eaedf0] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em]"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-600 mb-4">Gig Not Found</h1>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#336088] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em]"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="layout-container flex h-full grow flex-col">
                <NavBar />
                
                {/* Error notification */}
                {errorNotification && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg flex items-center">
                        <span className="mr-2">⚠️</span>
                        <span>{errorNotification}</span>
                        <button 
                            onClick={() => setErrorNotification('')}
                            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                <div className="px-40 flex flex-1 justify-center py-5 pt-28">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Breadcrumb */}
                        <div className="flex flex-wrap gap-2 p-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="text-[#5e7487] text-base font-medium leading-normal hover:text-[#336088]"
                            >
                                {gig.category_name || 'Graphics & Design'}
                            </button>
                            <span className="text-[#5e7487] text-base font-medium leading-normal">/</span>
                            <span className="text-[#111518] text-base font-medium leading-normal">
                                {gig.title?.substring(0, 50) || 'Service Details'}
                                {gig.title?.length > 50 ? '...' : ''}
                            </span>
                        </div>

                        {/* Title & Favorite Button */}
                        <div className="flex justify-between items-start px-4 pt-5 pb-3">
                            <h2 className="text-[#111518] tracking-light text-[28px] font-bold leading-tight text-left flex-1 pr-4">
                                {gig.title}
                            </h2>
                            <button
                                onClick={handleFavoriteToggle}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                aria-label="Toggle Favorite"
                            >
                                <HeartFilled
                                    style={{
                                        fontSize: '28px',
                                        color: isFavorited ? '#1dbf73' : '#a9a9a9', // Gray when not favorited
                                    }}
                                />
                            </button>
                        </div>

                        {/* Image Slider */}
                        <div className="flex w-full grow bg-gray-50 p-4">
                            <div className="w-full relative">
                                {/* Main Image Display */}
                                <div className="w-full overflow-hidden bg-gray-50 aspect-[3/2] rounded-xl flex relative">
                                    <div
                                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1 transition-all duration-300"
                                        style={{
                                            backgroundImage: `url("${allImages[currentImageIndex]?.url || gig?.cover_image || 'https://placehold.co/800x400'}")`
                                        }}
                                    ></div>
                                    
                                    {/* Navigation Arrows */}
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 z-10"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 z-10"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                                                </svg>
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {allImages.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                                            {currentImageIndex + 1} / {allImages.length}
                                        </div>
                                    )}

                                    {/* Dot Indicators */}
                                    {allImages.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                            {allImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                        currentImageIndex === index 
                                                            ? 'bg-white scale-125' 
                                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                    }`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                ></button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Navigation */}
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {allImages.map((image, index) => (
                                            <button
                                                key={image.id}
                                                onClick={() => goToImage(index)}
                                                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                                    currentImageIndex === index 
                                                        ? 'border-[#336088] ring-2 ring-[#336088] ring-opacity-30' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                <div
                                                    className="w-full h-full bg-center bg-no-repeat bg-cover"
                                                    style={{
                                                        backgroundImage: `url("${image.url}")`
                                                    }}
                                                ></div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About This Gig */}
                        <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            About This Gig
                        </h2>
                        <div 
                            className="text-[#111518] text-base font-normal leading-normal pb-3 pt-1 px-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(gig.description) }}
                        ></div>

                        {/* Pricing - Single Package */}
                        <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            Pricing
                        </h2>
                        <div className="px-4 py-3">
                            <div className="flex flex-1 flex-col gap-4 bg-gray-50 p-6 max-w-md">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-[#111518] text-base font-bold leading-tight">Service Package</h1>
                                    <p className="flex items-baseline gap-1 text-[#111518]">
                                        <span className="text-[#111518] text-4xl font-black leading-tight tracking-[-0.033em]">
                                            ${gig.price}
                                        </span>
                                        <span className="text-[#111518] text-base font-bold leading-tight">one-time</span>
                                    </p>
                                </div>
                                {/* Only show order button if user is not the owner */}
                                {authUser && gig.owner_id !== authUser.uuid ? (
                                    <button 
                                        onClick={handleCreateOrder}
                                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1dbf73] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#19a463]"
                                    >
                                        <span className="truncate">Continue (${gig.price})</span>
                                    </button>
                                ) : authUser && gig.owner_id === authUser.uuid ? (
                                    <div className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-gray-400 text-gray-700 text-sm font-bold leading-normal tracking-[0.015em] cursor-not-allowed">
                                        <span className="truncate">This is your gig</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1dbf73] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#19a463]"
                                    >
                                        <span className="truncate">Login to Order</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* About The Seller */}
                        <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            About The Seller
                        </h2>
                        <div className="flex p-4">
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex gap-4">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                                        style={{
                                            backgroundImage: `url("${(sellerDetails?.avatar || gig.owner_avatar || 'https://placehold.co/300x300')}")`
                                        }}
                                    ></div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                            {sellerDetails?.fullname || gig.owner_fullname || 'Professional Seller'}
                                        </p>
                                        <p className="text-[#5e7487] text-base font-normal leading-normal">
                                            @{sellerDetails?.username || gig.owner_username || 'seller'}
                                        </p>
                                        <p className="text-[#5e7487] text-base font-normal leading-normal">
                                            {sellerDetails?.seller_headline || gig.category_name || 'Service Provider'}
                                        </p>
                                        {sellerDetails?.seller_since && (
                                            <p className="text-[#5e7487] text-base font-normal leading-normal">
                                                Member since {new Date(sellerDetails.seller_since).getFullYear()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="text-[#111518] text-base font-normal leading-normal pb-3 pt-1 px-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(
                                    sellerDetails?.seller_description || 
                                    gig.owner_bio || 
                                    `${sellerDetails?.fullname || gig.owner_fullname || 'This seller'} is a skilled professional with expertise in ${gig.category_name || 'their field'}. They are committed to delivering high-quality work and excellent customer service.`
                                )
                            }}
                        ></div>

                        {/* Action Buttons */}
                        <div className="flex justify-stretch">
                            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                                <button 
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#336088] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em]"
                                    onClick={() => navigate(`/SellerInfo/${sellerDetails?.uuid || gig.owner_id}`)}
                                >
                                    <span className="truncate">Contact Seller</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#ff4444] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#cc3333]">
                                    <span className="truncate">Report Gig</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Footer />
            </div>

            {/* Create Order Modal */}
            {showCreateOrderModal && (
                <CreateOrderModal
                    gig={gig}
                    onClose={() => {
                        setShowCreateOrderModal(false);
                        setOrderCreated(false);
                        // Navigate to orders page if an order was created
                        if (orderCreated) {
                            navigate('/orders');
                        }
                    }}
                    onSubmit={handleOrderSubmit}
                />
            )}
        </div>
    );
};

export default GigDetail;
