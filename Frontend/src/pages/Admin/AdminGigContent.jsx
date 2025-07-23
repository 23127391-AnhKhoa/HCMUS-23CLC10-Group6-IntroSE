import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';

const GigDetailContent = () => {
    const { id } = useParams();
    const [gig, setGig] = useState(null);
    const [sellerDetails, setSellerDetails] = useState(null);
    const [gigMedia, setGigMedia] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGigDetail();
    }, [id]);

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

    // Helper function to get all images and videos (cover + additional media)
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
        
        // Add additional media images and videos
        if (gigMedia && gigMedia.length > 0) {
            console.log('🎬 Processing gigMedia:', gigMedia);
            gigMedia.forEach(media => {
                if (media.url && media.url !== gig?.cover_image) {
                    images.push({
                        url: media.url,
                        type: media.media_type || 'image', // Can be 'image', 'video', etc.
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

    if (loading) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading gig details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gig</h1>
                        <p className="text-gray-600 mb-6 bg-red-50 p-4 rounded-xl">{error}</p>
                        <button 
                            onClick={fetchGigDetail}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-600 mb-4">Gig Not Found</h1>
                        <p className="text-gray-500 mb-6">The service you're looking for doesn't exist or has been removed.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="layout-container flex h-full grow flex-col relative z-10">
                <div className="px-6 lg:px-40 flex flex-1 justify-center py-5 pt-8">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Title */}
                        <div className="p-6 mb-6">
                            <h2 className="text-gray-800 tracking-light text-[28px] font-bold leading-tight text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {gig.title}
                            </h2>
                        </div>

                        {/* Image Slider */}
                        <div className="w-full relative p-6 mb-6">
                            {/* Main Image/Video Display */}
                            <div className="w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[3/2] rounded-2xl flex relative shadow-inner">
                                {allImages[currentImageIndex]?.type === 'video' ? (
                                    <video
                                        className="w-full h-full object-cover rounded-2xl"
                                        autoPlay
                                        muted
                                        loop
                                        preload="metadata"
                                        style={{ outline: 'none' }}
                                        controlsList="nodownload noremoteplayback noplaybackrate"
                                        disablePictureInPicture
                                        controls
                                        key={currentImageIndex} // Force re-render when switching videos
                                    >
                                        <source src={allImages[currentImageIndex]?.url} type="video/mp4" />
                                        <source src={allImages[currentImageIndex]?.url} type="video/webm" />
                                        <source src={allImages[currentImageIndex]?.url} type="video/ogg" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div
                                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-2xl flex-1 transition-all duration-300"
                                        style={{
                                            backgroundImage: `url("${allImages[currentImageIndex]?.url || gig?.cover_image || 'https://placehold.co/800x400'}")`
                                        }}
                                    ></div>
                                )}
                                
                                {/* Navigation Arrows */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full p-3 transition-all duration-200 z-10 shadow-lg hover:shadow-xl border border-white/20"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full p-3 transition-all duration-200 z-10 shadow-lg hover:shadow-xl border border-white/20"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Media Type Indicator */}
                                {allImages[currentImageIndex]?.type === 'video' && (
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-10 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                        Video
                                    </div>
                                )}

                                {/* Image Counter */}
                                {allImages.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm z-10 border border-white/20 shadow-lg">
                                        {currentImageIndex + 1} / {allImages.length}
                                    </div>
                                )}

                                {/* Dot Indicators */}
                                {allImages.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                        {allImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToImage(index)}
                                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                    currentImageIndex === index 
                                                        ? 'bg-white scale-125 shadow-lg' 
                                                        : 'bg-white/60 hover:bg-white/80'
                                                }`}
                                                aria-label={`Go to ${allImages[index]?.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                                            ></button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Navigation */}
                            {allImages.length > 1 && (
                                <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                                    {allImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => goToImage(index)}
                                            className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-md hover:shadow-lg relative ${
                                                currentImageIndex === index 
                                                    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-30 transform scale-105' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {image.type === 'video' ? (
                                                <>
                                                    <video
                                                        className="w-full h-full object-cover"
                                                        preload="metadata"
                                                        muted
                                                    >
                                                        <source src={image.url} type="video/mp4" />
                                                    </video>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                </>
                                            ) : (
                                                <div
                                                    className="w-full h-full bg-center bg-no-repeat bg-cover"
                                                    style={{
                                                        backgroundImage: `url("${image.url}")`
                                                    }}
                                                ></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* About This Gig */}
                        <div className="p-6 mb-6">
                            <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                About This Gig
                            </h2>
                            <div 
                                className="text-gray-700 text-base font-normal leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(gig.description) }}
                            ></div>
                        </div>

                        {/* Pricing - Display Only */}
                        <div className="p-6 mb-6">
                            <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Pricing
                            </h2>
                            <div className="max-w-md">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-gray-800 text-lg font-bold leading-tight">Service Package</h3>
                                            <p className="flex items-baseline gap-1">
                                                <span className="text-gray-800 text-4xl font-black leading-tight tracking-[-0.033em] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                    ${gig.price}
                                                </span>
                                                <span className="text-gray-600 text-base font-bold leading-tight">one-time</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About The Seller */}
                        <div className="p-6 mb-6">
                            <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                About The Seller
                            </h2>
                            <div className="flex w-full flex-col gap-6">
                                <div className="flex gap-6 items-start">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 ring-4 ring-white shadow-xl border-4 border-white"
                                        style={{
                                            backgroundImage: `url("${(sellerDetails?.avatar || gig.owner_avatar || 'https://placehold.co/300x300')}")`
                                        }}
                                    ></div>
                                    <div className="flex flex-col justify-center flex-1">
                                        <p className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] mb-1">
                                            {sellerDetails?.fullname || gig.owner_fullname || 'Professional Seller'}
                                        </p>
                                        <p className="text-blue-600 text-base font-medium leading-normal mb-1">
                                            @{sellerDetails?.username || gig.owner_username || 'seller'}
                                        </p>
                                        <p className="text-gray-600 text-base font-normal leading-normal mb-2">
                                            {sellerDetails?.seller_headline || gig.category_name || 'Service Provider'}
                                        </p>
                                        {sellerDetails?.seller_since && (
                                            <p className="text-gray-500 text-sm font-medium mb-3">
                                                Member since {new Date(sellerDetails.seller_since).getFullYear()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div 
                                    className="text-gray-700 text-base font-normal leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800"
                                    dangerouslySetInnerHTML={{ 
                                        __html: DOMPurify.sanitize(
                                            sellerDetails?.seller_description || 
                                            gig.owner_bio || 
                                            `${sellerDetails?.fullname || gig.owner_fullname || 'This seller'} is a skilled professional with expertise in ${gig.category_name || 'their field'}. They are committed to delivering high-quality work and excellent customer service.`
                                        )
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigDetailContent;