/**
 * AutoPaymentTimer Component - Real-time countdown timer for auto payment
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    ClockCircleOutlined, 
    WarningOutlined,
    FireOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const AutoPaymentTimer = ({ 
    deadline, 
    userRole, 
    orderPrice,
    className = '',
    compact = false 
}) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    // Calculate time remaining
    const calculateTimeLeft = () => {
        if (!deadline) return null;
        
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const difference = deadlineTime - now;

        if (difference <= 0) {
            setIsExpired(true);
            return null;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds, total: difference };
    };

    // Update timer every second
    useEffect(() => {
        if (!deadline) return;

        const timer = setInterval(() => {
            const timeRemaining = calculateTimeLeft();
            setTimeLeft(timeRemaining);
        }, 1000);

        // Initial calculation
        const timeRemaining = calculateTimeLeft();
        setTimeLeft(timeRemaining);

        return () => clearInterval(timer);
    }, [deadline]);

    // Get urgency level and styling
    const getUrgencyLevel = () => {
        if (!timeLeft) return { level: 'expired', color: 'text-gray-500', bg: 'bg-gray-100' };
        
        const totalHours = timeLeft.total / (1000 * 60 * 60);
        
        if (totalHours <= 1) {
            return { 
                level: 'critical', 
                color: 'text-red-600', 
                bg: 'bg-red-50 border-red-200',
                icon: <FireOutlined className="text-red-500" />
            };
        } else if (totalHours <= 3) {
            return { 
                level: 'high', 
                color: 'text-orange-600', 
                bg: 'bg-orange-50 border-orange-200',
                icon: <WarningOutlined className="text-orange-500" />
            };
        } else if (totalHours <= 6) {
            return { 
                level: 'medium', 
                color: 'text-yellow-600', 
                bg: 'bg-yellow-50 border-yellow-200',
                icon: <ExclamationCircleOutlined className="text-yellow-500" />
            };
        } else {
            return { 
                level: 'low', 
                color: 'text-blue-600', 
                bg: 'bg-blue-50 border-blue-200',
                icon: <ClockCircleOutlined className="text-blue-500" />
            };
        }
    };

    // Format time display
    const formatTimeDisplay = () => {
        if (!timeLeft) return 'Expired';
        
        if (compact) {
            // Always show hh:mm:ss format for compact timer
            const hours = timeLeft.days * 24 + timeLeft.hours;
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = timeLeft.minutes.toString().padStart(2, '0');
            const formattedSeconds = timeLeft.seconds.toString().padStart(2, '0');
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
            const parts = [];
            if (timeLeft.days > 0) parts.push(`${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}`);
            if (timeLeft.hours > 0) parts.push(`${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}`);
            if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`);
            if (timeLeft.days === 0 && timeLeft.hours === 0) parts.push(`${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`);
            
            return parts.join(', ');
        }
    };

    // Get role-specific message
    const getRoleMessage = () => {
        if (isExpired) {
            return userRole === 'buyer' 
                ? 'Auto payment has been processed'
                : 'Order payment has been automatically processed';
        }

        if (userRole === 'buyer') {
            return 'Complete payment or timer will auto-process:';
        } else {
            return 'Auto payment will process in:';
        }
    };

    // Return null if no deadline and not expired (timer was cleared)
    if (!deadline && !isExpired) return null;

    const urgency = getUrgencyLevel();

    if (compact) {
        return (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${urgency.bg} ${className}`}>
                {urgency.icon}
                <span className={`text-sm font-medium ${urgency.color}`}>
                    {formatTimeDisplay()}
                </span>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-lg border ${urgency.bg} ${className}`}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    {urgency.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${urgency.color}`}>
                            Auto Payment Timer
                        </h3>
                        {orderPrice && (
                            <span className="text-sm font-medium text-gray-600">
                                ${orderPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                        {getRoleMessage()}
                    </p>
                    
                    <div className={`text-2xl font-bold ${urgency.color} mb-2`}>
                        {formatTimeDisplay()}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                        {isExpired ? (
                            'Payment completed automatically'
                        ) : (
                            <>
                                Deadline: {new Date(deadline).toLocaleString()}
                                {urgency.level === 'critical' && (
                                    <div className="mt-1 text-red-600 font-medium">
                                        ⚡ Payment processing soon!
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

AutoPaymentTimer.propTypes = {
    deadline: PropTypes.string,
    userRole: PropTypes.oneOf(['buyer', 'seller']).isRequired,
    orderPrice: PropTypes.number,
    className: PropTypes.string,
    compact: PropTypes.bool
};

export default AutoPaymentTimer;
