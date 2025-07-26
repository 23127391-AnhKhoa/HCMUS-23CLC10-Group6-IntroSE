/**
 * ServCard Component - Displays a service/gig card with image, details, and favorite functionality
 * 
 * @file ServCard.jsx
 * @description A reusable card component for displaying gig information in a grid layout.
 * Features hover effects, favorite toggle, and navigation to detailed gig view.
 * 
 * @requires @ant-design/icons - For heart icon
 * @requires react-router-dom - For navigation
 * @requires react - For state management and component lifecycle
 */

import { HeartFilled } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

/**
 * ServCard - A card component for displaying gig/service information
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.gig - Gig data object containing service information
 * @param {string} props.gig.id - Unique identifier for the gig
 * @param {string} props.gig.title - Title of the service
 * @param {string} props.gig.cover_image - URL of the cover image
 * @param {number} props.gig.price - Price of the service
 * @param {number} props.gig.delivery_days - Number of delivery days
 * @param {string} props.gig.status - Status of the gig (active, inactive, etc.)
 * @param {string} props.gig.owner_username - Username of the service owner
 * @param {string} props.gig.owner_fullname - Full name of the service owner
 * @param {string} props.gig.owner_avatar - Avatar URL of the service owner
 * @param {string} props.gig.category_name - Category name of the service
 * 
 * @returns {React.JSX.Element} A card component displaying gig information
 * 
 * @example
 * // Basic usage with gig data
 * <ServCard gig={gigData} />
 * 
 * // Usage in a grid layout
 * <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 *   {gigs.map(gig => <ServCard key={gig.id} gig={gig} />)}
 * </div>
 */
const ServCard = ({ gig, isPreview = false }) => {
    // Navigation hook for programmatic routing
    const navigate = useNavigate();
    const { token, authUser } = useAuth();
    
    // State to track favorite status of the gig
    const [isFavorited, setIsFavorited] = useState(false);

    // Default values used when gig data is not provided or incomplete
    const defaultGig = {
        id: '',
        title: 'Service Title',
        description: 'Service description...',
        cover_image: 'https://placehold.co/600x400',
        price: 0,
        delivery_days: 1,
        status: 'active',
        owner_username: 'username',
        owner_fullname: 'Seller Name',
        owner_avatar: 'https://placehold.co/300x300',
        category_name: 'Category'
    };

    // Merge provided gig data with defaults to ensure all required fields exist
    const gigData = gig ? { ...defaultGig, ...gig } : defaultGig;

    // Check favorite status when component mounts
    useEffect(() => {
        if (authUser && gigData.id && token) {
            checkFavoriteStatus();
        }
    }, [authUser, gigData.id, token]);

    const checkFavoriteStatus = async () => {
        if (!authUser || !token || !gigData.id) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/users/favorite/check/${authUser.uuid}/${gigData.id}`, {
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

    /**
     * Handles the favorite button click event
     * Prevents event bubbling to avoid triggering card click
     * Toggles the favorite state using API
     * 
     * @param {React.MouseEvent} e - Mouse event from the button click
     */
    const handleFavoriteClick = async (e) => {
        e.stopPropagation(); // Prevent card click event from firing
        
        if (!authUser || !token) {
            navigate('/auth');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/users/favorite/toggle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gig_id: gigData.id }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setIsFavorited(data.data.isFavorited);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    /**
     * Handles navigation to the detailed gig view
     * Only navigates if gig has a valid ID
     */
    const handleCardClick = () => {
        if (gigData.id) {
            navigate(`/gig/${gigData.id}`);
        }
    };

    /**
     * Formats price for display
     * Converts number to dollar format with no decimal places
     * 
     * @param {number} price - The price to format
     * @returns {string} Formatted price string (e.g., "$25")
     */
    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(0)}` : '$0';
    };

    /**
     * Truncates title if it exceeds maximum length
     * Adds ellipsis (...) to indicate truncation
     * 
     * @param {string} title - The title to truncate
     * @param {number} maxLength - Maximum allowed length (default: 80)
     * @returns {string} Truncated title with ellipsis if needed
     */
    const truncateTitle = (title, maxLength = 80) => {
        return title && title.length > maxLength ? 
            `${title.substring(0, maxLength)}...` : title || '';
    };

    return (
        <div 
            className="flex flex-col h-[420px] w-full max-w-[300px] bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            onClick={handleCardClick}
        >
            {/* 
                Image Section (40% of card height)
                Contains cover image and favorite button overlay
            */}
            <div className="h-[40%] relative overflow-hidden">
                <img 
                    src={gigData.cover_image || 'https://placehold.co/600x400'} 
                    alt={gigData.title || 'Service preview'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400';
                    }}
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Favorite Button Overlay */}
                <button 
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm hover:bg-white/95 rounded-full border border-white/30 transition-all duration-200 transform hover:scale-110"
                    aria-label="Favorite this gig"
                >
                    <HeartFilled 
                        style={{ 
                            fontSize: '18px', 
                            color: isFavorited ? '#ef4444' : '#6b7280',
                        }} 
                    />
                </button>
            </div>
            
            {/* 
                Content Section (45% of card height)
                Contains seller info, title, and metadata
            */}
            <div className="h-[45%] p-5 flex flex-col justify-between">
                {/* Seller Information */}
                <div className="flex items-center mb-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gradient-to-br from-blue-400 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            <img 
                                src={gigData.owner_avatar || 'https://placehold.co/300x300'} 
                                alt={`${gigData.owner_username} avatar`}
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/300x300';
                                }}
                            />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                            {gigData.owner_username || 'username'}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                            {gigData.category_name || 'Professional Seller'}
                        </div>
                    </div>
                </div>
                
                {/* Service Title - Show full title for preview, truncated for regular cards */}
                <div className="flex-1">
                    {isPreview ? (
                        <div 
                            className="text-base text-gray-700 leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{
                                __html: gigData.title || gigData.description || 'No description'
                            }}
                        />
                    ) : (
                        <p className="text-base text-gray-700 line-clamp-3 leading-relaxed max-h-[60px] min-h-[26px] font-medium">
                            {truncateTitle(gigData.title)}
                        </p>
                    )}
                </div>

                {/* Delivery Time and Rating */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100/80">
                    <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <span className="text-blue-500 text-sm">🚀</span>
                        <span className="text-sm font-semibold text-blue-700 ml-1">
                            {gigData.delivery_days} day{gigData.delivery_days !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {/* Rating placeholder - can be enhanced with real data */}
                    <div className="flex items-center">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm font-semibold text-gray-700 ml-1">4.9</span>
                        <span className="text-xs text-gray-500 ml-1">(127)</span>
                    </div>
                </div>
            </div>
            
            {/* 
                Footer Section (15% of card height)
                Contains pricing information with enhanced design
            */}
            <div className="h-[15%] flex justify-between items-center px-5 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-100/80">
                {/* Trust indicator */}
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 ml-2 font-medium">Verified</span>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Starting at</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(gigData.price)}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Component Features:
 * - Responsive design with fixed dimensions (300x420px)
 * - Hover effects with scaling and shadow transitions
 * - Favorite functionality with heart icon toggle
 * - Click navigation to detailed gig view
 * - Fallback images for broken image sources
 * - Price formatting and title truncation
 * - Seller information display with avatar
 * - Category badges and delivery time indicators
 * 
 * Styling:
 * - Uses Tailwind CSS for responsive design
 * - Card layout with 40% image, 45% content, 15% footer
 * - Smooth transitions and hover effects
 * - Consistent spacing and typography
 * 
 * TODO:
 * - Implement API integration for favorite functionality
 * - Add loading states for images
 * - Consider removing redundant heart icon in footer
 * - Add accessibility improvements (ARIA labels, keyboard navigation)
 * - Implement proper error boundaries
 */

export default ServCard;