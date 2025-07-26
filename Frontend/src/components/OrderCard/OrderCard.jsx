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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import ApiService from '../../config/api.js'; // ĐÚNG
import DeliveryFilesModal from '../DeliveryFilesModal/DeliveryFilesModal';
import UploadDeliveryModal from '../UploadDeliveryModal/UploadDeliveryModal';
import AutoPaymentTimer from '../AutoPaymentTimer/AutoPaymentTimer';
import OrderStatus from '../OrderStatus/OrderStatus';
import Toast from '../Toast/Toast';
import { 
    CalendarOutlined, 
    DollarCircleOutlined, 
    UserOutlined, 
    FileTextOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    CloseCircleOutlined,
    MessageOutlined,
    DownloadOutlined,
    UploadOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FileOutlined,
    LockOutlined,
    CreditCardOutlined,
    UndoOutlined,
    SendOutlined,
    LoadingOutlined,
    DeleteOutlined
} from '@ant-design/icons';

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
    onPaymentTrigger,
    onFileDownload,
    onDeliveryUpload,
    onMessage,
    onRevisionRequest,
    getStatusColor, 
    getStatusIcon 
}) => {
    const navigate = useNavigate();
    const [deliveryFiles, setDeliveryFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showFilesModal, setShowFilesModal] = useState(false);
    
    // Load delivery files when order loads or status changes
    useEffect(() => {
        // Always try to load delivery files for any order
        loadDeliveryFiles();
    }, [order.id, order.status]);
    
    const loadDeliveryFiles = async () => {
        try {
            setFilesLoading(true);
            const response = await ApiService.getDeliveryFiles(order.id);
            if (response.status === 'success') {
                setDeliveryFiles(response.data.files);
            }
        } catch (error) {
            console.error('Error loading delivery files:', error);
        } finally {
            setFilesLoading(false);
        }
    };
    
    // Handle mark as delivered
    const handleMarkAsDelivered = async () => {
        try {
            console.log('🚚 [OrderCard] Starting mark as delivered for order:', order.id);
            
            setProcessing(true);
            const response = await ApiService.markOrderAsDelivered(order.id);
            
            console.log('✅ [OrderCard] Mark as delivered response:', response);
            
            if (response.status === 'success') {
                safeOnStatusUpdate(order.id, 'delivered');
                alert('Order marked as delivered successfully!');
            } else {
                throw new Error(response.message || 'Failed to mark order as delivered');
            }
        } catch (error) {
            console.error('❌ [OrderCard] Error marking as delivered:', error);
            alert('Failed to mark order as delivered: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };
    
    // Handle delete delivery file
    const handleDeleteDeliveryFile = async (fileId, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }
        
        try {
            setProcessing(true);
            const response = await ApiService.deleteDeliveryFile(order.id, fileId);
            if (response.status === 'success') {
                // Reload delivery files
                await loadDeliveryFiles();
                alert('File deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting delivery file:', error);
            alert('Failed to delete file: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };
    
    // Handle payment
    const handlePayment = async () => {
        try {
            setProcessing(true);
            const response = await ApiService.processOrderPayment(order.id);
            if (response.status === 'success') {
                safeOnStatusUpdate(order.id, 'completed');
                alert('Payment processed successfully!');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };
    
    // Handle revision request
    const handleRevisionRequest = async () => {
        const revisionNote = prompt('Please provide revision details:');
        if (revisionNote) {
            try {
                setProcessing(true);
                const response = await ApiService.requestOrderRevision(order.id, { revision_note: revisionNote });
                if (response.status === 'success') {
                    safeOnStatusUpdate(order.id, 'revision_requested');
                    alert('Revision requested successfully!');
                }
            } catch (error) {
                console.error('Error requesting revision:', error);
                alert('Failed to request revision: ' + error.message);
            } finally {
                setProcessing(false);
            }
        }
    };
    
    // Handle file download - REMOVED: Now handled by DeliveryFilesModal only
    // const handleFileDownload = async (file) => {
    //     // Download logic moved to DeliveryFilesModal to avoid duplicate calls
    // };
    
    // Handle file upload for delivery
    const handleFileUpload = async (files) => {
        try {
            setProcessing(true);
            const response = await ApiService.uploadDeliveryFiles(order.id, files);
            if (response.status === 'success') {
                // Reload delivery files after upload
                await loadDeliveryFiles();
                alert('Delivery files uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Failed to upload files: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };
    
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

    /**
     * Calculate due date based on order creation and delivery days
     */
    const calculateDueDate = () => {
        if (!safeOrder.created_at || !safeOrder.gig_delivery_days) return null;
        
        const createdDate = new Date(safeOrder.created_at);
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + (safeOrder.gig_delivery_days || 3));
        
        return dueDate;
    };

    /**
     * Get time remaining until due date
     */
    const getTimeRemaining = () => {
        const dueDate = calculateDueDate();
        if (!dueDate) return null;
        
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };
        if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600', urgent: true };
        if (diffDays === 1) return { text: '1 day left', color: 'text-orange-500', urgent: false };
        
        return { text: `${diffDays} days left`, color: 'text-gray-600', urgent: false };
    };

    /**
     * Handle payment trigger for completed orders
     */
    const handlePaymentTrigger = () => {
        if (onPaymentTrigger) {
            safeOnPaymentTrigger(safeOrder);
        } else {
            // Fallback - navigate to payment page
            navigate(`/payment/${safeOrder.id}`);
        }
    };

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
                    action: () => safeOnStatusUpdate(safeOrder.id, 'in_progress'),
                    className: 'bg-green-600 hover:bg-green-700 text-white',
                    icon: <PlayCircleOutlined />
                });
                actions.push({
                    label: 'Reject Order',
                    action: () => {
                        const reason = prompt('Please provide a reason for rejecting this order:');
                        if (reason && reason.trim()) {
                            safeOnStatusUpdate(safeOrder.id, 'cancelled');
                        }
                    },
                    className: 'bg-red-600 hover:bg-red-700 text-white',
                    icon: <CloseCircleOutlined />
                });
            } else if (safeOrder.status === 'in_progress' || safeOrder.status === 'revision_requested') {
                // Show specific actions for revision_requested status
                if (safeOrder.status === 'revision_requested') {
                    actions.push({
                        label: 'Accept Revision',
                        action: async () => {
                            try {
                                setProcessing(true);
                                const response = await ApiService.handleRevision(safeOrder.id, 'accept', '');
                                if (response.status === 'success') {
                                    safeOnStatusUpdate(safeOrder.id, 'in_progress');
                                    alert('Revision request accepted. You can now work on the changes.');
                                }
                            } catch (error) {
                                console.error('Error accepting revision:', error);
                                alert('Failed to accept revision: ' + error.message);
                            } finally {
                                setProcessing(false);
                            }
                        },
                        className: 'bg-green-600 hover:bg-green-700 text-white',
                        icon: <CheckCircleOutlined />,
                        disabled: processing
                    });
                    actions.push({
                        label: 'Decline Revision',
                        action: async () => {
                            const note = prompt('Please provide a reason for declining the revision request (optional):');
                            try {
                                setProcessing(true);
                                const response = await ApiService.handleRevision(safeOrder.id, 'decline', note || '');
                                if (response.status === 'success') {
                                    safeOnStatusUpdate(safeOrder.id, 'delivered');
                                    alert('Revision request declined. Order status changed back to delivered.');
                                }
                            } catch (error) {
                                console.error('Error declining revision:', error);
                                alert('Failed to decline revision: ' + error.message);
                            } finally {
                                setProcessing(false);
                            }
                        },
                        className: 'bg-red-600 hover:bg-red-700 text-white',
                        icon: <CloseCircleOutlined />,
                        disabled: processing
                    });
                }
                
                actions.push({
                    label: 'Upload Delivery',
                    action: () => {
                        if (safeOnDeliveryUpload) {
                            safeOnDeliveryUpload(safeOrder);
                        } else {
                            // Fallback: prompt for file upload
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.multiple = true;
                            fileInput.accept = '*/*';
                            fileInput.onchange = (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                    handleFileUpload(files);
                                }
                            };
                            fileInput.click();
                        }
                    },
                    className: 'bg-blue-600 hover:bg-blue-700 text-white',
                    icon: <UploadOutlined />
                });
                
                // Always show Mark as Delivered button for seller in progress
                actions.push({
                    label: 'Mark as Delivered',
                    action: handleMarkAsDelivered,
                    className: deliveryFiles.length > 0 ? 
                        'bg-green-600 hover:bg-green-700 text-white' : 
                        'bg-gray-400 cursor-not-allowed text-white',
                    icon: <SendOutlined />,
                    disabled: processing || deliveryFiles.length === 0,
                    title: deliveryFiles.length === 0 ? 'Please upload delivery files first' : 'Mark order as delivered'
                });
            } else if (safeOrder.status === 'delivered') {
                actions.push({
                    label: 'Upload More Files',
                    action: () => safeOnDeliveryUpload(safeOrder),
                    className: 'bg-blue-600 hover:bg-blue-700 text-white',
                    icon: <UploadOutlined />
                });
                actions.push({
                    label: 'Awaiting Payment',
                    action: null,
                    className: 'bg-yellow-100 text-yellow-800 cursor-not-allowed',
                    icon: <ClockCircleOutlined />
                });
            } else if (safeOrder.status === 'completed') {
                actions.push({
                    label: 'View Files',
                    action: () => loadDeliveryFiles(),
                    className: 'bg-gray-600 hover:bg-gray-700 text-white',
                    icon: <EyeOutlined />
                });
            }
        } else if (userRole === 'buyer') {
            // Buyer actions
            if (safeOrder.status === 'pending') {
                actions.push({
                    label: 'Cancel Order',
                    action: () => {
                        const confirm = window.confirm('Are you sure you want to cancel this order?');
                        if (confirm) {
                            safeOnStatusUpdate(safeOrder.id, 'cancelled');
                        }
                    },
                    className: 'bg-red-600 hover:bg-red-700 text-white',
                    icon: <CloseCircleOutlined />
                });
            } else if (safeOrder.status === 'delivered') {
                actions.push({
                    label: 'Preview & Pay',
                    action: () => setShowFilesModal(true),
                    className: 'bg-blue-600 hover:bg-blue-700 text-white',
                    icon: <EyeOutlined />
                });
            } else if (safeOrder.status === 'completed') {
                actions.push({
                    label: 'View Files',
                    action: () => setShowFilesModal(true),
                    className: 'bg-blue-600 hover:bg-blue-700 text-white',
                    icon: <DownloadOutlined />
                });
                actions.push({
                    label: 'Leave Review',
                    action: () => navigate(`/review/${safeOrder.id}`),
                    className: 'bg-purple-600 hover:bg-purple-700 text-white',
                    icon: <FileTextOutlined />
                });
            }
        }
        
        // Universal actions
        actions.push({
            label: 'Message',
            action: () => onMessage(safeOrder),
            className: 'bg-gray-600 hover:bg-gray-700 text-white',
            icon: <MessageOutlined />
        });
        
        return actions;
    };

    const availableActions = getAvailableActions();
    const timeRemaining = getTimeRemaining();
    const dueDate = calculateDueDate();

    // Handle default callback functions if not provided
    const handleDefaultMessage = (order) => {
        alert(`Message functionality for order ${order.id} - Please implement messaging`);
    };
    
    const handleDefaultDeliveryUpload = (order) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                handleFileUpload(files);
            }
        };
        fileInput.click();
    };
    
    // Set default values for callback functions
    const safeOnMessage = onMessage || handleDefaultMessage;
    const safeOnDeliveryUpload = onDeliveryUpload || handleDefaultDeliveryUpload;
    const safeOnStatusUpdate = onStatusUpdate || ((id, status) => {
        console.log(`Status update for order ${id}: ${status}`);
        // Reload the page or update state as needed
        window.location.reload();
    });

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
                        <div className="text-sm text-gray-600 flex items-center justify-between">
                            <span>
                                <span className="font-medium">Edits:</span> {safeOrder.gig_num_of_edits}
                            </span>
                            {/* Compact countdown timer */}
                            {safeOrder.status === 'delivered' && safeOrder.auto_payment_deadline && safeOrder.download_start_time && (
                                <AutoPaymentTimer
                                    deadline={safeOrder.auto_payment_deadline}
                                    userRole={userRole}
                                    compact={true}
                                    className="ml-2"
                                />
                            )}
                        </div>
                    )}
                </div>
                
                {safeOrder.requirement && (
                    <div className="text-sm text-gray-600">
                        <strong>Requirements:</strong> {safeOrder.requirement}
                    </div>
                )}
            </div>

            {/* Timeline and Due Date */}
            {(dueDate || timeRemaining) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                            <ClockCircleOutlined className="mr-2 text-blue-600" />
                            <span className="font-medium">Timeline:</span>
                        </div>
                        {timeRemaining && (
                            <div className={`text-sm font-medium ${timeRemaining.color}`}>
                                {timeRemaining.urgent && '⚡'} {timeRemaining.text}
                            </div>
                        )}
                    </div>
                    {dueDate && (
                        <div className="mt-1 text-xs text-gray-500">
                            Due: {dueDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </div>
                    )}
                    
                    {/* Progress Indicator */}
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    safeOrder.status === 'completed' ? 'bg-green-500 w-full' :
                                    safeOrder.status === 'delivered' ? 'bg-purple-500 w-5/6' :
                                    safeOrder.status === 'in_progress' ? 'bg-blue-500 w-3/4' :
                                    safeOrder.status === 'revision_requested' ? 'bg-orange-500 w-2/3' :
                                    safeOrder.status === 'cancelled' ? 'bg-red-500 w-1/4' :
                                    'bg-gray-400 w-1/4'
                                }`}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Ordered</span>
                            <span>In Progress</span>
                            <span>Delivered</span>
                            <span>Completed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Payment Timer - Hiển thị sau khi buyer download lần đầu */}
            {/* DEBUG: Log order data */}
            {console.log('🔍 OrderCard Debug:', {
                orderId: safeOrder.id,
                status: safeOrder.status,
                auto_payment_deadline: safeOrder.auto_payment_deadline,
                download_start_time: safeOrder.download_start_time,
                userRole: userRole
            })}
            {safeOrder.status === 'delivered' && 
             safeOrder.auto_payment_deadline && 
             safeOrder.download_start_time && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                        <ClockCircleOutlined className="text-orange-500 mr-2" />
                        <span className="font-medium text-gray-800">
                            {userRole === 'buyer' ? 'Payment Auto-Processing Timer' : 'Awaiting Payment Decision'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                        {userRole === 'buyer' 
                            ? 'Timer started when you first downloaded the delivery files. Payment will be processed automatically if no action is taken.'
                            : 'Buyer has downloaded the delivery files. Payment will be processed automatically if buyer takes no action.'
                        }
                    </div>
                    <AutoPaymentTimer
                        deadline={safeOrder.auto_payment_deadline}
                        userRole={userRole}
                        orderPrice={safeOrder.price_at_purchase}
                        className="mb-2"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                        Download started: {safeOrder.download_start_time && new Date(safeOrder.download_start_time).toLocaleString()}
                    </div>
                </div>
            )}



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

            {/* Delivery Files Section */}
            {(deliveryFiles.length > 0 || safeOrder.status === 'delivered' || safeOrder.status === 'completed') && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FileOutlined className="mr-2" />
                        Delivery Files {deliveryFiles.length > 0 && `(${deliveryFiles.length})`}
                    </h4>
                    
                    {filesLoading ? (
                        <div className="text-center py-4">
                            <ClockCircleOutlined className="animate-spin mr-2" />
                            Loading files...
                        </div>
                    ) : deliveryFiles.length > 0 ? (
                        <div className="space-y-2">
                            {deliveryFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <FileOutlined className="text-blue-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{file.original_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.file_size)} • {file.file_type}
                                            </p>
                                            {file.message && (
                                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                                    <strong>Message:</strong> {file.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {/* View button - always available */}
                                        <button
                                            onClick={() => window.open(file.signed_url, '_blank')}
                                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            <EyeOutlined />
                                            <span>View</span>
                                        </button>
                                        
                                        {/* Delete button - only show if order is not completed */}
                                        {safeOrder.status !== 'completed' && (
                                            <button
                                                onClick={() => handleDeleteDeliveryFile(file.id, file.original_name)}
                                                disabled={processing}
                                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                                title="Delete file"
                                            >
                                                <DeleteOutlined />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <FileOutlined className="text-2xl mb-2" />
                            <p>
                                {safeOrder.status === 'in_progress' ? 
                                    'No delivery files uploaded yet' : 
                                    'No delivery files available'
                                }
                            </p>
                        </div>
                    )}
                    
                    {/* Download Notice - Files always available after delivery */}
                    {safeOrder.status === 'delivered' && userRole === 'buyer' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                <DownloadOutlined className="mr-2" />
                                <strong>Files Ready!</strong> Download anytime - first download starts auto payment countdown.
                            </p>
                            {safeOrder.auto_payment_deadline && (
                                <p className="text-xs text-green-700 mt-1">
                                    ⏰ Or complete payment now to skip countdown and finish immediately
                                </p>
                            )}
                        </div>
                    )}
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

            {/* Additional Info for Revision Requested */}
            {order.status === 'revision_requested' && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                        <FileTextOutlined className="mr-2" />
                        Revision requested by client.
                    </p>
                </div>
            )}

            {/* Additional Info for Delivered Orders */}
            {order.status === 'delivered' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                        <CheckCircleOutlined className="mr-2" />
                        {userRole === 'buyer' ? 'Work delivered - Review and complete payment' : 'Work delivered - Awaiting client review'}
                    </p>
                </div>
            )}
            {/* Delivery Files Modal */}
            {showFilesModal && (
                <DeliveryFilesModal
                    isOpen={showFilesModal}
                    onClose={() => setShowFilesModal(false)}
                    order={safeOrder}
                    userRole={userRole}
                    deliveryFiles={deliveryFiles}
                    onPayment={handlePayment}
                    onRevisionRequest={handleRevisionRequest}
                    onFileDownload={onFileDownload} // Use parent's callback, not local one
                    processing={processing}
                />
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
    onPaymentTrigger: PropTypes.func,
    onFileDownload: PropTypes.func,
    onDeliveryUpload: PropTypes.func,
    onMessage: PropTypes.func,
    onRevisionRequest: PropTypes.func,
    getStatusColor: PropTypes.func.isRequired,
    getStatusIcon: PropTypes.func.isRequired
};

export default OrderCard;
