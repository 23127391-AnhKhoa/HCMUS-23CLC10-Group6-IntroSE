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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    
    // State to track favorite status of the gig
    const [isFavorited, setIsFavorited] = useState(false);

    /**
     * Handles the favorite button click event
     * Prevents event bubbling to avoid triggering card click
     * Toggles the favorite state and logs the action
     * 
     * @param {React.MouseEvent} e - Mouse event from the button click
     */
    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent card click event from firing
        setIsFavorited(!isFavorited);
        console.log(`Gig ${gigData.id} favorite status: ${!isFavorited}`);
        // TODO: Implement API call to update the favorite status in backend
    };
    
    /**
     * Default values used when gig data is not provided or incomplete
     * Ensures the component renders properly even with missing data
     * 
     * @type {Object}
     * @constant
     */
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
            className="flex flex-col h-[420px] w-[300px] m-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
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
                {/* Favorite Button Overlay */}
                <button 
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 p-2 bg-transparent border-none cursor-pointer"
                    aria-label="Favorite this gig"
                    style={{ transition: 'transform 0.2s' }}
                >
                    <HeartFilled 
                        style={{ 
                            fontSize: '22px', 
                            color: isFavorited ? '#1dbf73' : 'white',
                            stroke: 'black', 
                            strokeWidth: 40
                        }} 
                    />
                </button>
                {/* Status Badge - Currently hidden to avoid overlap with favorite button */}
                {/* {gigData.status === 'active' && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Active
                    </div>
                )} */}
            </div>
            
            {/* 
                Content Section (45% of card height)
                Contains seller info, title, and metadata
            */}
            <div className="h-[45%] p-4 flex flex-col justify-between">
                {/* Seller Information */}
                <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100">
                        <img 
                            src={gigData.owner_avatar || 'https://placehold.co/300x300'} 
                            alt={`${gigData.owner_username} avatar`}
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/300x300';
                            }}
                        />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-800">
                            {gigData.owner_username || 'username'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {gigData.category_name || 'Professional Seller'}
                        </div>
                    </div>
                </div>
                
                {/* Service Title - Show full title for preview, truncated for regular cards */}
                <div className="flex-1">
                    {isPreview ? (
                        <div 
                            className="text-base text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: gigData.title || gigData.description || 'No description'
                            }}
                        />
                    ) : (
                        <p className="text-base text-gray-700 line-clamp-3 leading-relaxed max-h-[60px] min-h-[26px]">
                            {truncateTitle(gigData.title)}
                        </p>
                    )}
                </div>

                {/* Delivery Time and Category Badge */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                        <span className="text-blue-500 text-sm">📅</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">
                            {gigData.delivery_days} day{gigData.delivery_days !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {gigData.category_name && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {gigData.category_name}
                        </div>
                    )}
                </div>
            </div>
            
            {/* 
                Footer Section (15% of card height)
                Contains pricing information and legacy heart icon
            */}
            <div className="h-[15%] flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                {/* Legacy heart icon - Consider removing if not needed */}
                <div className="w-5 h-5">
                    <img 
                        src="https://placehold.co/20x20" 
                        alt="Heart icon" 
                        className="w-full h-full object-cover cursor-pointer transition-opacity" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking heart
                            // TODO: Add heart functionality here or remove if redundant
                        }}
                    />
                </div>
                {/* Price Display */}
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Starting at</div>
                    <div className="text-lg font-bold text-gray-800">
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