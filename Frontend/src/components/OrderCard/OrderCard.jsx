/**
 * OrderCard Component - Individual order card for displaying order details
 * 
 * @file OrderCard.jsx
 * @description Displays order information in a card format with actions based on user role
 * 
 * @requires react - For component functionality
 * @requires @ant-design/icons - For icons
 * @requires prop-types - For prop validation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { 
    CalendarOutlined, 
    DollarCircleOutlined, 
    UserOutlined, 
    FileTextOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    CloseCircleOutlined 
} from '@ant-design/icons';

/**
 * OrderCard component for displaying individual order information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.order - Order data object
 * @param {string} props.userRole - Current user role ('buyer' or 'seller')
 * @param {Function} props.onStatusUpdate - Callback for status updates
 * @param {Function} props.getStatusColor - Function to get status color classes
 * @param {Function} props.getStatusIcon - Function to get status icon
 * @returns {JSX.Element} OrderCard component
 */
const OrderCard = ({ 
    order, 
    userRole, 
    onStatusUpdate, 
    getStatusColor, 
    getStatusIcon 
}) => {
    const navigate = useNavigate();
    
    // Defensive programming - validate order data
    if (!order || typeof order !== 'object') {
        console.error('❌ Invalid order data received:', order);
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 font-medium">Invalid order data</p>
                <p className="text-red-500 text-sm">Order: {JSON.stringify(order)}</p>
            </div>
        );
    }

    // Ensure order has required properties
    const safeOrder = {
        id: order.id || 'unknown',
        gig_id: order.gig_id || 'unknown',
        status: order.status || 'pending',
        created_at: order.created_at || new Date().toISOString(),
        price_at_purchase: order.price_at_purchase || 0,
        requirement: order.requirement || 'No requirements specified',
        gig_owner_name: order.gig_owner_name || 'Unknown',
        client_name: order.client_name || 'Unknown',
        gig_title: order.gig_title || 'Unknown Service',
        gig_cover_image: order.gig_cover_image || null,
        gig_price: order.gig_price || 0,
        gig_delivery_days: order.gig_delivery_days || 0,
        gig_num_of_edits: order.gig_num_of_edits || 0,
        ...order
    };

    console.log('🔍 OrderCard rendering with data:', safeOrder);

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Format price for display
     */
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    /**
     * Safely render HTML content or plain text
     * @param {string} content - The content to render
     * @returns {Object} Props for dangerouslySetInnerHTML or children
     */
    const renderSafeHTML = (content) => {
        if (!content) return null;
        
        // Check if content contains HTML tags
        const hasHTML = /<[^>]*>/g.test(content);
        
        if (hasHTML) {
            return {
                dangerouslySetInnerHTML: {
                    __html: DOMPurify.sanitize(content, {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                        ALLOWED_ATTR: []
                    })
                }
            };
        }
        
        return { children: content };
    };

    /**
     * Handle navigation to gig detail page
     */
    const handleGigTitleClick = () => {
        if (safeOrder.gig_id) {
            navigate(`/gig/${safeOrder.gig_id}`);
        }
    };

    /**
     * Get available actions based on user role and order status
     */
    const getAvailableActions = () => {
        const actions = [];
        
        if (userRole === 'seller') {
            // Seller actions
            if (safeOrder.status === 'pending') {
                actions.push({
                    label: 'Accept Order',
                    action: () => onStatusUpdate(safeOrder.id, 'in_progress'),
                    className: 'bg-green-600 hover:bg-green-700 text-white',
                    icon: <PlayCircleOutlined />
                });
                actions.push({
                    label: 'Reject Order',
                    action: () => onStatusUpdate(safeOrder.id, 'cancelled'),
                    className: 'bg-red-600 hover:bg-red-700 text-white',
                    icon: <CloseCircleOutlined />
                });
            } else if (safeOrder.status === 'in_progress') {
                actions.push({
                    label: 'Mark Complete',
                    action: () => onStatusUpdate(safeOrder.id, 'completed'),
                    className: 'bg-green-600 hover:bg-green-700 text-white',
                    icon: <CheckCircleOutlined />
                });
            }
        } else if (userRole === 'buyer') {
            // Buyer actions
            if (safeOrder.status === 'pending') {
                actions.push({
                    label: 'Cancel Order',
                    action: () => onStatusUpdate(safeOrder.id, 'cancelled'),
                    className: 'bg-red-600 hover:bg-red-700 text-white',
                    icon: <CloseCircleOutlined />
                });
            }
        }
        
        return actions;
    };

    const availableActions = getAvailableActions();

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{String(safeOrder.id).slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {userRole === 'buyer' ? 'Ordered from' : 'Ordered by'}: {' '}
                        <span className="font-medium">
                            {userRole === 'buyer' ? safeOrder.gig_owner_name : safeOrder.client_name}
                        </span>
                    </p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(safeOrder.status)}`}>
                    {getStatusIcon(safeOrder.status)}
                    <span className="ml-1 capitalize">{safeOrder.status.replace('_', ' ')}</span>
                </div>
            </div>

            {/* Gig Information */}
            <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                    {/* Gig Cover Image */}
                    {safeOrder.gig_cover_image && (
                        <div className="flex-shrink-0">
                            <img 
                                src={safeOrder.gig_cover_image} 
                                alt={safeOrder.gig_title}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/64x64/f3f4f6/9ca3af?text=Gig';
                                }}
                            />
                        </div>
                    )}
                    
                    {/* Gig Title and Description */}
                    <div className="flex-1">
                        <h4 
                            className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleGigTitleClick}
                            title="Click to view gig details"
                        >
                            <FileTextOutlined className="mr-2" />
                            {safeOrder.gig_title}
                        </h4>
                        {safeOrder.gig_description && (
                            <div 
                                className="text-sm text-gray-600 mb-2 overflow-hidden prose prose-sm max-w-none prose-headings:text-sm prose-headings:font-medium prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0" 
                                style={{ 
                                    display: '-webkit-box', 
                                    WebkitLineClamp: 2, 
                                    WebkitBoxOrient: 'vertical' 
                                }}
                                {...renderSafeHTML(safeOrder.gig_description)}
                            />
                        )}
                    </div>
                </div>
                
                {/* Gig Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                    {safeOrder.gig_price && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Gig Price:</span> {formatPrice(safeOrder.gig_price)}
                        </div>
                    )}
                    {safeOrder.gig_delivery_days && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Delivery:</span> {safeOrder.gig_delivery_days} days
                        </div>
                    )}
                    {safeOrder.gig_num_of_edits && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Edits:</span> {safeOrder.gig_num_of_edits}
                        </div>
                    )}
                </div>
                
                {safeOrder.requirement && (
                    <div className="text-sm text-gray-600">
                        <strong>Requirements:</strong> {safeOrder.requirement}
                    </div>
                )}
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <DollarCircleOutlined className="mr-2 text-green-600" />
                    <span className="font-medium">{formatPrice(safeOrder.price_at_purchase)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                    <CalendarOutlined className="mr-2 text-blue-600" />
                    <span>Created: {formatDate(safeOrder.created_at)}</span>
                </div>
                
                {safeOrder.updated_at && safeOrder.updated_at !== safeOrder.created_at && (
                    <div className="flex items-center text-sm text-gray-600">
                        <CalendarOutlined className="mr-2 text-orange-600" />
                        <span>Updated: {formatDate(safeOrder.updated_at)}</span>
                    </div>
                )}
            </div>

            {/* Delivery Information */}
            {safeOrder.delivery_time && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Delivery Time:</strong> {safeOrder.delivery_time} days
                    </p>
                </div>
            )}

            {/* Actions */}
            {availableActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {availableActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${action.className}`}
                        >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Additional Info for Completed Orders */}
            {order.status === 'completed' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                        <CheckCircleOutlined className="mr-2" />
                        Order completed successfully!
                    </p>
                </div>
            )}

            {/* Additional Info for Cancelled Orders */}
            {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                        <CloseCircleOutlined className="mr-2" />
                        Order was cancelled.
                    </p>
                </div>
            )}
        </div>
    );
};

OrderCard.propTypes = {
    order: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        gig_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        gig_title: PropTypes.string.isRequired,
        gig_description: PropTypes.string,
        gig_cover_image: PropTypes.string,
        gig_price: PropTypes.number,
        gig_delivery_days: PropTypes.number,
        gig_num_of_edits: PropTypes.number,
        gig_status: PropTypes.string,
        client_name: PropTypes.string,
        gig_owner_name: PropTypes.string,
        price_at_purchase: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        requirement: PropTypes.string,
        created_at: PropTypes.string.isRequired,
        updated_at: PropTypes.string
    }).isRequired,
    userRole: PropTypes.oneOf(['buyer', 'seller']).isRequired,
    onStatusUpdate: PropTypes.func.isRequired,
    getStatusColor: PropTypes.func.isRequired,
    getStatusIcon: PropTypes.func.isRequired
};

export default OrderCard;
