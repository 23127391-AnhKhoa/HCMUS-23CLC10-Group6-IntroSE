import React from "react";
import { useNavigate } from "react-router-dom";

const ServCard = ({ gig }) => {
    const navigate = useNavigate();
    
    // Default values in case gig data is not provided
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

    // Use provided gig data or fallback to defaults
    const gigData = gig ? { ...defaultGig, ...gig } : defaultGig;

    // Handle card click
    const handleCardClick = () => {
        if (gigData.id) {
            navigate(`/gig/${gigData.id}`);
        }
    };

    // Format price display
    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(0)}` : '$0';
    };

    // Truncate title if too long
    const truncateTitle = (title, maxLength = 80) => {
        return title && title.length > maxLength ? 
            `${title.substring(0, maxLength)}...` : title || '';
    };

    return (
        <div 
            className="flex flex-col h-[420px] w-[300px] m-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Section */}
            <div className="h-[40%] relative overflow-hidden">
                <img 
                    src={gigData.cover_image || 'https://placehold.co/600x400'} 
                    alt={gigData.title || 'Service preview'}
                    className="w-full h-full object-cover transition-transform duration-300" 
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400';
                    }}
                />
                {/* Status badge */}
                {gigData.status === 'active' && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Active
                    </div>
                )}
            </div>
            
            {/* Content Section */}
            <div className="h-[45%] flex flex-col p-4">
                {/* Seller Info */}
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
                
                {/* Service Title */}
                <div className="flex-1">
                    <p className="text-base text-gray-700 line-clamp-3 leading-relaxed max-h-[60px] min-h-[26px]">
                        {truncateTitle(gigData.title)}
                    </p>
                </div>

                {/* Delivery Time and Badge */}
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
            
            {/* Footer Section */}
            <div className="h-[15%] flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="w-5 h-5">
                    <img 
                        src="https://placehold.co/20x20" 
                        alt="Heart icon" 
                        className="w-full h-full object-cover cursor-pointer transition-opacity" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking heart
                            // Add heart functionality here
                        }}
                    />
                </div>
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

export default ServCard;