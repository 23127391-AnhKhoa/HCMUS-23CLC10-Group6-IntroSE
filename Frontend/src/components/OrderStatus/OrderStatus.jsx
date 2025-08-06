/**
 * Order Status Component
 * Displays order status with appropriate styling and icons
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
    ClockCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    DollarCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    CarOutlined
} from '@ant-design/icons';

const OrderStatus = ({ status, className = '' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: <ClockCircleOutlined />,
                    text: 'Pending',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-200'
                };
            case 'in_progress':
                return {
                    icon: <PlayCircleOutlined />,
                    text: 'In Progress',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200'
                };
            case 'delivered':
                return {
                    icon: <CarOutlined />,
                    text: 'Delivered',
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    borderColor: 'border-purple-200'
                };
            case 'completed':
                return {
                    icon: <CheckCircleOutlined />,
                    text: 'Completed',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200'
                };
            case 'cancelled':
                return {
                    icon: <CloseCircleOutlined />,
                    text: 'Cancelled',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200'
                };
            case 'revision_requested':
                return {
                    icon: <EditOutlined />,
                    text: 'Revision Requested',
                    bgColor: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    borderColor: 'border-orange-200'
                };
            default:
                return {
                    icon: <ClockCircleOutlined />,
                    text: 'Unknown',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        >
            {config.icon}
            <span className="ml-1">{config.text}</span>
        </span>
    );
};

OrderStatus.propTypes = {
    status: PropTypes.oneOf([
        'pending',
        'in_progress', 
        'delivered',
        'completed',
        'cancelled',
        'revision_requested'
    ]).isRequired,
    className: PropTypes.string
};

export default OrderStatus;
