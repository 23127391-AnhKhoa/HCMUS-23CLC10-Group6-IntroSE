/**
 * Toast Notification Component
 * Provides user feedback for actions
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    InfoCircleOutlined, 
    WarningOutlined,
    CloseOutlined
} from '@ant-design/icons';

const Toast = ({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onClose,
    show = false 
}) => {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);
        
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleOutlined className="text-green-500" />;
            case 'error':
                return <CloseCircleOutlined className="text-red-500" />;
            case 'warning':
                return <WarningOutlined className="text-yellow-500" />;
            case 'info':
            default:
                return <InfoCircleOutlined className="text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
            default:
                return 'text-blue-800';
        }
    };

    if (!visible) return null;

    return (
        <div 
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
                visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg`}>
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${getTextColor()}`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`flex-shrink-0 ${getTextColor()} hover:opacity-70 transition-opacity`}
                    >
                        <CloseOutlined className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    onClose: PropTypes.func,
    show: PropTypes.bool
};

export default Toast;
