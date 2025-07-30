/**
 * AutoPaymentWidget Component - Floating countdown widget for auto payment
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    ClockCircleOutlined, 
    WarningOutlined,
    FireOutlined,
    ExclamationCircleOutlined,
    CloseOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';

const AutoPaymentWidget = ({ 
    orders = [], 
    userRole,
    onOrderClick,
    position = 'bottom-right' 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timeData, setTimeData] = useState({});

    // Filter orders that have auto payment deadline
    const ordersWithDeadline = orders.filter(order => 
        order.status === 'delivered' && order.auto_payment_deadline
    );

    // Calculate time remaining for all orders
    const calculateTimeLeft = (deadline) => {
        if (!deadline) return null;
        
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const difference = deadlineTime - now;

        if (difference <= 0) {
            return { expired: true };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds, total: difference };
    };

    // Update timer every second
    useEffect(() => {
        if (ordersWithDeadline.length === 0) return;

        const timer = setInterval(() => {
            const newTimeData = {};
            ordersWithDeadline.forEach(order => {
                newTimeData[order.id] = calculateTimeLeft(order.auto_payment_deadline);
            });
            setTimeData(newTimeData);
        }, 1000);

        // Initial calculation
        const initialTimeData = {};
        ordersWithDeadline.forEach(order => {
            initialTimeData[order.id] = calculateTimeLeft(order.auto_payment_deadline);
        });
        setTimeData(initialTimeData);

        return () => clearInterval(timer);
    }, [ordersWithDeadline]);

    // Get urgency level and styling
    const getUrgencyLevel = (timeLeft) => {
        if (!timeLeft || timeLeft.expired) return { level: 'expired', color: 'text-gray-500', bg: 'bg-gray-100' };
        
        const totalHours = timeLeft.total / (1000 * 60 * 60);
        
        if (totalHours <= 1) {
            return { 
                level: 'critical', 
                color: 'text-red-600', 
                bg: 'bg-red-50 border-red-300',
                icon: <FireOutlined className="text-red-500" />
            };
        } else if (totalHours <= 3) {
            return { 
                level: 'high', 
                color: 'text-orange-600', 
                bg: 'bg-orange-50 border-orange-300',
                icon: <WarningOutlined className="text-orange-500" />
            };
        } else if (totalHours <= 6) {
            return { 
                level: 'medium', 
                color: 'text-yellow-600', 
                bg: 'bg-yellow-50 border-yellow-300',
                icon: <ExclamationCircleOutlined className="text-yellow-500" />
            };
        } else {
            return { 
                level: 'low', 
                color: 'text-blue-600', 
                bg: 'bg-blue-50 border-blue-300',
                icon: <ClockCircleOutlined className="text-blue-500" />
            };
        }
    };

    // Format time display
    const formatTimeDisplay = (timeLeft, compact = false) => {
        if (!timeLeft || timeLeft.expired) return 'Expired';
        
        if (compact) {
            if (timeLeft.days > 0) {
                return `${timeLeft.days}d ${timeLeft.hours}h`;
            } else if (timeLeft.hours > 0) {
                return `${timeLeft.hours}h ${timeLeft.minutes}m`;
            } else {
                return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
            }
        } else {
            if (timeLeft.days > 0) {
                return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
            } else if (timeLeft.hours > 0) {
                return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
            } else {
                return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
            }
        }
    };

    // Get most urgent order
    const getMostUrgentOrder = () => {
        if (ordersWithDeadline.length === 0) return null;
        
        return ordersWithDeadline.reduce((most, order) => {
            const timeLeft = timeData[order.id];
            const mostTimeLeft = timeData[most.id];
            
            if (!timeLeft) return most;
            if (!mostTimeLeft) return order;
            if (timeLeft.expired && !mostTimeLeft.expired) return most;
            if (!timeLeft.expired && mostTimeLeft.expired) return order;
            if (timeLeft.expired && mostTimeLeft.expired) return most;
            
            return timeLeft.total < mostTimeLeft.total ? order : most;
        });
    };

    if (ordersWithDeadline.length === 0) return null;

    const mostUrgent = getMostUrgentOrder();
    const mostUrgentTime = mostUrgent ? timeData[mostUrgent.id] : null;
    const urgency = getUrgencyLevel(mostUrgentTime);

    // Position classes
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50 max-w-sm`}>
            {/* Compact Widget */}
            {!isExpanded && (
                <div 
                    className={`p-3 rounded-lg border-2 ${urgency.bg} shadow-lg cursor-pointer transition-all hover:scale-105`}
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center space-x-3">
                        {urgency.icon}
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold ${urgency.color}`}>
                                Auto Payment Timer
                            </div>
                            <div className={`text-xs ${urgency.color}`}>
                                {ordersWithDeadline.length} order{ordersWithDeadline.length > 1 ? 's' : ''} • {formatTimeDisplay(mostUrgentTime, true)}
                            </div>
                        </div>
                        <DownOutlined className={`text-xs ${urgency.color}`} />
                    </div>
                </div>
            )}

            {/* Expanded Widget */}
            {isExpanded && (
                <div className="bg-white rounded-lg border-2 shadow-xl max-h-80 overflow-hidden">
                    {/* Header */}
                    <div className={`p-3 ${urgency.bg} border-b`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {urgency.icon}
                                <span className={`text-sm font-semibold ${urgency.color}`}>
                                    Auto Payment Timers
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${urgency.color}`}>
                                    {ordersWithDeadline.length} active
                                </span>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 ${urgency.color}`}
                                >
                                    <UpOutlined className="text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="max-h-60 overflow-y-auto">
                        {ordersWithDeadline.map(order => {
                            const timeLeft = timeData[order.id];
                            const orderUrgency = getUrgencyLevel(timeLeft);
                            
                            return (
                                <div
                                    key={order.id}
                                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => onOrderClick && onOrderClick(order.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                Order #{order.id}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {order.Gigs?.title || 'Unknown Gig'}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {orderUrgency.icon}
                                            <div className={`text-xs font-semibold ${orderUrgency.color}`}>
                                                {formatTimeDisplay(timeLeft, true)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xs mt-1 ${orderUrgency.color}`}>
                                        ${order.price_at_purchase} • {userRole === 'buyer' ? 'Payment due' : 'Auto payment'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

AutoPaymentWidget.propTypes = {
    orders: PropTypes.array.isRequired,
    userRole: PropTypes.oneOf(['buyer', 'seller']).isRequired,
    onOrderClick: PropTypes.func,
    position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left'])
};

export default AutoPaymentWidget;
