/**
 * OrderOverviewCard Component - Simplified order card for overview mode
 * 
 * @file OrderOverviewCard.jsx
 * @description Displays basic order information in a compact card format
 */

import React from 'react';
import AutoPaymentTimer from '../AutoPaymentTimer/AutoPaymentTimer';
import { 
    CalendarOutlined, 
    DollarCircleOutlined, 
    UserOutlined, 
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    LoadingOutlined,
    CloseCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';

/**
 * Get status color classes
 */
const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'delivered': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'revision_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

/**
 * Get status icon
 */
const getStatusIcon = (status) => {
    switch (status) {
        case 'pending': return <ClockCircleOutlined className="w-4 h-4" />;
        case 'in_progress': return <LoadingOutlined className="w-4 h-4" />;
        case 'delivered': return <CheckCircleOutlined className="w-4 h-4" />;
        case 'completed': return <CheckCircleOutlined className="w-4 h-4" />;
        case 'cancelled': return <CloseCircleOutlined className="w-4 h-4" />;
        case 'revision_requested': return <FileTextOutlined className="w-4 h-4" />;
        default: return <ClockCircleOutlined className="w-4 h-4" />;
    }
};

/**
 * Format date for display
 */
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * OrderOverviewCard component
 * 
 * @param {Object} props
 * @param {Object} props.order - Order data
 * @param {string} props.userRole - Current user role ('buyer' or 'seller')
 * @param {Function} props.onClick - Click handler to view details
 */
const OrderOverviewCard = ({ order, userRole, onClick }) => {
    const gigTitle = order.Gigs?.title || 'Unknown Gig';
    const clientName = order.User?.fullname || order.User?.username || 'Unknown Client';
    const sellerName = order.Gigs?.User?.fullname || order.Gigs?.User?.username || 'Unknown Seller';
    const otherPartyName = userRole === 'buyer' ? sellerName : clientName;

    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onClick(order.id)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{order.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status?.replace('_', ' ')}</span>
                    </span>
                </div>
                <EyeOutlined className="text-gray-400" />
            </div>

            {/* Main Content */}
            <div className="space-y-2">
                {/* Gig Title */}
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                    {gigTitle}
                </h3>

                {/* Other Party */}
                <div className="flex items-center text-xs text-gray-600">
                    <UserOutlined className="w-3 h-3 mr-1" />
                    <span className="truncate">
                        {userRole === 'buyer' ? 'Seller' : 'Client'}: {otherPartyName}
                    </span>
                </div>

                {/* Price and Date */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center">
                        <DollarCircleOutlined className="w-3 h-3 mr-1" />
                        <span className="font-medium">${order.price_at_purchase}</span>
                    </div>
                    <div className="flex items-center">
                        <CalendarOutlined className="w-3 h-3 mr-1" />
                        <span>{formatDate(order.created_at)}</span>
                    </div>
                </div>

                {/* Auto Payment Timer (compact version for overview) */}
                {order.status === 'delivered' && order.auto_payment_deadline && (
                    <div className="mt-2">
                        <AutoPaymentTimer
                            deadline={order.auto_payment_deadline}
                            userRole={userRole}
                            compact={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderOverviewCard;
