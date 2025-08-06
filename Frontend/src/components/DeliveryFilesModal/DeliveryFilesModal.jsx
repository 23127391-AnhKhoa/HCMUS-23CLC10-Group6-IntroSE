/**
 * DeliveryFilesModal Component - Modal for previewing and downloading delivery files
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    DownloadOutlined, 
    EyeOutlined, 
    FileOutlined,
    LockOutlined,
    DollarCircleOutlined,
    CloseOutlined,
    LoadingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import ApiService from '../../services/apiService';
import Toast from '../Toast/Toast';
import { useAuth } from '../../contexts/AuthContext';

const DeliveryFilesModal = ({ 
    isOpen, 
    onClose, 
    order,
    userRole,
    deliveryFiles,
    onPayment,
    onRevisionRequest,
    onFileDownload,
    processing
}) => {
    // Get updateUser from AuthContext
    const { updateUser } = useAuth();
    
    // Extract order properties for easier access
    const orderId = order?.id;
    const orderStatus = order?.status;
    const orderPrice = order?.price_at_purchase;
    const [localDeliveryFiles, setLocalDeliveryFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingFile, setDownloadingFile] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // Use passed deliveryFiles or local state
    const currentDeliveryFiles = deliveryFiles || localDeliveryFiles;

    useEffect(() => {
        if (isOpen && orderId && !deliveryFiles) {
            loadDeliveryFiles();
        } else if (deliveryFiles) {
            setLocalDeliveryFiles(deliveryFiles);
        }
    }, [isOpen, orderId, deliveryFiles]);

    const loadDeliveryFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ApiService.getDeliveryFiles(orderId);
            
            if (response.status === 'success') {
                setLocalDeliveryFiles(response.data.files || []);
            } else {
                setError('Failed to load delivery files');
            }
        } catch (error) {
            console.error('Error loading delivery files:', error);
            setError(error.message || 'Failed to load delivery files');
        } finally {
            setLoading(false);
        }
    };

    const handleFileDownload = async (file) => {
        try {
            setDownloadingFile(file.id);
            
            if (file.signed_url) {
                // Force download using fetch and blob
                const response = await fetch(file.signed_url);
                const blob = await response.blob();
                
                // Create blob URL and force download
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = file.original_name;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL
                window.URL.revokeObjectURL(blobUrl);
                
                showToast('File download started', 'success');
            } else {
                // Show message about payment requirement
                if (file.download_message) {
                    showToast(file.download_message, 'warning');
                } else if (!file.can_download) {
                    showToast('Payment required to download files', 'warning');
                } else {
                    showToast('File download not available', 'error');
                }
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            showToast('Failed to download file', 'error');
        } finally {
            setDownloadingFile(null);
        }
    };

    const handlePayment = async () => {
        try {
            const confirmComplete = window.confirm(
                'Are you sure you want to complete this order? Payment will be processed immediately.'
            );

            if (!confirmComplete) return;

            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to complete the order');
            }

            const response = await fetch(`http://localhost:8000/api/orders/${order.id}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete order');
            }

            console.log('✅ Payment response:', data);

            // Update user balance in AuthContext if returned from backend
            if (data.data?.payment?.updatedBuyerData) {
                console.log('🔄 Updating buyer balance in AuthContext:', data.data.payment.updatedBuyerData);
                updateUser(data.data.payment.updatedBuyerData);
            }

            showToast('Order completed successfully! Payment has been processed.', 'success');
            
            // Close modal and refresh order data
            onClose();
            
            // Call onPayment callback if provided (for parent component updates)
            if (onPayment) {
                await onPayment();
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
            if (onRevisionRequest) {
                await onRevisionRequest();
            }
            showToast('Revision request sent', 'success');
            onClose();
        } catch (error) {
            console.error('Revision request error:', error);
            showToast(error.message || 'Failed to request revision', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', type: 'info' });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('image')) return '🖼️';
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('video')) return '🎥';
        if (fileType?.includes('audio')) return '🎵';
        if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦';
        return '📁';
    };

    const canDownload = (file) => {
        return file.can_download || orderStatus === 'completed';
    };

    const getTotalFileSize = () => {
        return deliveryFiles.reduce((total, file) => total + (file.file_size || 0), 0);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <h2 className="text-xl font-semibold text-gray-800">
                                <FileOutlined className="mr-2" />
                                Delivery Files
                            </h2>
                            {currentDeliveryFiles.length > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                                    {currentDeliveryFiles.length} file{currentDeliveryFiles.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Compact Timer in Header for Delivered Orders */}
                            {userRole === 'buyer' && orderStatus === 'delivered' && 
                             order?.auto_payment_deadline && order?.download_start_time && (
                                <AutoPaymentTimer
                                    deadline={order.auto_payment_deadline}
                                    userRole={userRole}
                                    compact={true}
                                    className="mr-2"
                                />
                            )}
                            <button
                                onClick={loadDeliveryFiles}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                disabled={loading}
                                title="Refresh files"
                            >
                                <ReloadOutlined className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <CloseOutlined className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <LoadingOutlined className="text-2xl text-blue-600 animate-spin mr-3" />
                                <span className="text-gray-600">Loading files...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={loadDeliveryFiles}
                                    className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!loading && !error && currentDeliveryFiles.length === 0 && (
                            <div className="text-center py-8">
                                <FileOutlined className="text-4xl text-gray-300 mb-2" />
                                <p className="text-gray-500">No delivery files available</p>
                                {userRole === 'seller' && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Upload delivery files to complete this order
                                    </p>
                                )}
                            </div>
                        )}

                        {!loading && !error && currentDeliveryFiles.length > 0 && (
                            <div className="space-y-4">
                                {/* Files Summary */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Total: {currentDeliveryFiles.length} file{currentDeliveryFiles.length > 1 ? 's' : ''}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Size: {formatFileSize(getTotalFileSize())}
                                        </span>
                                    </div>
                                </div>

                                {/* Files List */}
                                {currentDeliveryFiles.map((file, index) => (
                                    <div
                                        key={file.id || index}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">
                                                    {getFileIcon(file.file_type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-800 truncate">
                                                        {file.original_name}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>{formatFileSize(file.file_size)}</span>
                                                        <span>{file.file_type}</span>
                                                        <span>
                                                            {new Date(file.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {canDownload(file) ? (
                                                    <button
                                                        onClick={() => handleFileDownload(file)}
                                                        disabled={downloadingFile === file.id}
                                                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {downloadingFile === file.id ? (
                                                            <LoadingOutlined className="animate-spin" />
                                                        ) : (
                                                            <DownloadOutlined />
                                                        )}
                                                        <span>Download</span>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg">
                                                        <LockOutlined />
                                                        <span>Pay to Download</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payment Notice */}
                        {!loading && currentDeliveryFiles.length > 0 && orderStatus === 'delivered' && userRole === 'buyer' && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2 text-yellow-800">
                                    <DollarCircleOutlined />
                                    <span className="font-medium">Payment Required</span>
                                </div>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Complete payment of <strong>${orderPrice?.toFixed(2)}</strong> to download delivery files and finalize this order.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions - Fixed */}
                    {userRole === 'buyer' && orderStatus === 'delivered' && (
                        <div className="border-t p-6 flex-shrink-0 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleRequestRevision}
                                    disabled={loading}
                                    className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                                >
                                    Request Revision
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <LoadingOutlined className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <DollarCircleOutlined />
                                            <span>Pay & Complete Order</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
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

DeliveryFilesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    userRole: PropTypes.oneOf(['buyer', 'seller']).isRequired,
    deliveryFiles: PropTypes.array,
    onPayment: PropTypes.func,
    onRevisionRequest: PropTypes.func,
    onFileDownload: PropTypes.func,
    processing: PropTypes.bool
};

export default DeliveryFilesModal;
