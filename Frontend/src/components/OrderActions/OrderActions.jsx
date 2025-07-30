/**
 * Order Actions Component
 * Displays available actions for orders based on status and user role
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    UploadOutlined,
    DollarCircleOutlined,
    EditOutlined,
    EyeOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    MoreOutlined,
    CarOutlined
} from '@ant-design/icons';
import ApiService from '../../services/apiService';
import UploadDeliveryModal from '../UploadDeliveryModal/UploadDeliveryModal';
import DeliveryFilesModal from '../DeliveryFilesModal/DeliveryFilesModal';
import Toast from '../Toast/Toast';

const OrderActions = ({ 
    order, 
    userRole,
    onOrderUpdate,
    onOpenConversation 
}) => {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', type: 'info' });
    };

    const handleMarkAsDelivered = async () => {
        try {
            setLoading(true);
            const response = await ApiService.markOrderAsDelivered(order.id);
            
            if (response.status === 'success') {
                showToast('Order marked as delivered successfully', 'success');
                onOrderUpdate && onOrderUpdate();
            } else {
                showToast(response.message || 'Failed to mark as delivered', 'error');
            }
        } catch (error) {
            console.error('Error marking as delivered:', error);
            showToast(error.message || 'Failed to mark as delivered', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            const response = await ApiService.processOrderPayment(order.id);
            
            if (response.status === 'success') {
                showToast('Payment processed successfully', 'success');
                onOrderUpdate && onOrderUpdate();
                setDeliveryModalOpen(false);
            } else {
                showToast(response.message || 'Payment failed', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast(error.message || 'Payment failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRevision = async () => {
        try {
            setLoading(true);
            const response = await ApiService.requestOrderRevision(order.id, {
                revision_note: 'Revision requested by buyer'
            });
            
            if (response.status === 'success') {
                showToast('Revision requested successfully', 'success');
                onOrderUpdate && onOrderUpdate();
                setDeliveryModalOpen(false);
            } else {
                showToast(response.message || 'Failed to request revision', 'error');
            }
        } catch (error) {
            console.error('Revision request error:', error);
            showToast(error.message || 'Failed to request revision', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        onOrderUpdate && onOrderUpdate();
        setUploadModalOpen(false);
        showToast('Delivery files uploaded successfully', 'success');
    };

    // Get available actions based on order status and user role
    const getAvailableActions = () => {
        const actions = [];

        if (userRole === 'seller') {
            switch (order.status) {
                case 'pending':
                    actions.push({
                        key: 'accept',
                        label: 'Accept Order',
                        icon: <CheckCircleOutlined />,
                        type: 'primary',
                        onClick: () => handleStatusUpdate('in_progress')
                    });
                    break;
                case 'in_progress':
                case 'revision_requested':
                    actions.push({
                        key: 'upload',
                        label: 'Upload Delivery',
                        icon: <UploadOutlined />,
                        type: 'primary',
                        onClick: () => setUploadModalOpen(true)
                    });
                    actions.push({
                        key: 'mark_delivered',
                        label: 'Mark as Delivered',
                        icon: <CarOutlined />,
                        type: 'default',
                        onClick: handleMarkAsDelivered
                    });
                    break;
                case 'delivered':
                case 'completed':
                    actions.push({
                        key: 'view_files',
                        label: 'View Files',
                        icon: <EyeOutlined />,
                        type: 'default',
                        onClick: () => setDeliveryModalOpen(true)
                    });
                    break;
            }
        } else if (userRole === 'buyer') {
            switch (order.status) {
                case 'pending':
                    actions.push({
                        key: 'cancel',
                        label: 'Cancel Order',
                        icon: <EditOutlined />,
                        type: 'danger',
                        onClick: () => handleStatusUpdate('cancelled')
                    });
                    break;
                case 'in_progress':
                case 'revision_requested':
                    actions.push({
                        key: 'message',
                        label: 'Message',
                        icon: <MessageOutlined />,
                        type: 'default',
                        onClick: () => onOpenConversation && onOpenConversation(order.id)
                    });
                    break;
                case 'delivered':
                    actions.push({
                        key: 'view_files',
                        label: 'View Files',
                        icon: <EyeOutlined />,
                        type: 'primary',
                        onClick: () => setDeliveryModalOpen(true)
                    });
                    break;
                case 'completed':
                    actions.push({
                        key: 'download',
                        label: 'Download Files',
                        icon: <EyeOutlined />,
                        type: 'default',
                        onClick: () => setDeliveryModalOpen(true)
                    });
                    break;
            }
        }

        // Always add message action if order is active
        if (['in_progress', 'revision_requested', 'delivered'].includes(order.status)) {
            actions.push({
                key: 'message',
                label: 'Message',
                icon: <MessageOutlined />,
                type: 'default',
                onClick: () => onOpenConversation && onOpenConversation(order.id)
            });
        }

        return actions;
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLoading(true);
            const response = await ApiService.updateOrderStatus(order.id, newStatus);
            
            if (response.status === 'success') {
                showToast(`Order status updated to ${newStatus}`, 'success');
                onOrderUpdate && onOrderUpdate();
            } else {
                showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast(error.message || 'Failed to update status', 'error');
        } finally {
            setLoading(false);
        }
    };

    const actions = getAvailableActions();

    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            <div className="flex items-center space-x-2">
                {actions.slice(0, 2).map((action) => (
                    <button
                        key={action.key}
                        onClick={action.onClick}
                        disabled={loading}
                        className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            ${action.type === 'primary' 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : action.type === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                            flex items-center space-x-1
                        `}
                    >
                        {action.icon}
                        <span>{action.label}</span>
                    </button>
                ))}
                
                {actions.length > 2 && (
                    <button
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="More actions"
                    >
                        <MoreOutlined />
                    </button>
                )}
            </div>

            {/* Upload Delivery Modal */}
            <UploadDeliveryModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                orderId={order.id}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Delivery Files Modal */}
            <DeliveryFilesModal
                isOpen={deliveryModalOpen}
                onClose={() => setDeliveryModalOpen(false)}
                orderId={order.id}
                orderStatus={order.status}
                userRole={userRole}
                onPayment={handlePayment}
                onRequestRevision={handleRequestRevision}
            />

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </>
    );
};

OrderActions.propTypes = {
    order: PropTypes.object.isRequired,
    userRole: PropTypes.oneOf(['buyer', 'seller']).isRequired,
    onOrderUpdate: PropTypes.func,
    onOpenConversation: PropTypes.func
};

export default OrderActions;
