/**
 * Orders Page Component - Main orders management page
 * 
 * @file Orders.jsx
 * @description Main page for viewing and managing orders
 * Shows different views based on user role (buyer/seller)
 * 
 * @requir                // Add files to FormData with correct field name
                for (let i = 0; i < files.length; i++) {
                    formData.append('deliveryFiles', files[i]);
                }eact - For component state and lifecycle
 * @requires react-router-dom - For navigation
 * @requires @ant-design/icons - For icons
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar_Buyer from '../Common/NavBar_Buyer';
import NavBar_Seller from '../Common/NavBar_Seller';
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import Footer from '../Common/Footer';
import OrderCard from '../components/OrderCard/OrderCard';
import OrderOverviewCard from '../components/OrderOverviewCard/OrderOverviewCard';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

/**
 * Orders component for managing user orders
 * Displays orders as buyer or seller based on user role
 */
const Orders = () => {
    const navigate = useNavigate();
    const { token, authUser, isLoading: authLoading } = useAuth();
    
    // State management
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(authUser?.role === 'seller' ? 'seller' : 'buyer'); // Set based on user role
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Separate loading states for different actions
    const [actionLoadings, setActionLoadings] = useState({
        statusUpdate: {},
        deliveryUpload: {},
        fileDownload: {},
        revisionRequest: {}
    });

    // Infinite scroll state
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 20;

    // Check authentication and redirect if needed
    useEffect(() => {
        console.log('🔄 Auth state check:', { 
            authLoading, 
            authUser: authUser ? 'Present' : 'Missing', 
            token: token ? 'Present' : 'Missing' 
        });
        
        if (!authLoading && (!authUser || !token)) {
            console.log('❌ No authentication, redirecting to login');
            navigate('/auth');
            return;
        }
    }, [authUser, token, authLoading, navigate]);

    // Fetch orders when component mounts or filters change
    useEffect(() => {
        if (!authLoading && authUser && token) {
            // Reset orders when filters change and fetch new data
            fetchOrders(true);
        }
    }, [authUser, token, authLoading, activeTab, statusFilter]);

    // Initialize with correct tab and setup scroll listener
    useEffect(() => {
        if (!authLoading && authUser) {
            // Set the correct tab based on user role
            const correctTab = authUser.role === 'seller' ? 'seller' : 'buyer';
            if (activeTab !== correctTab) {
                setActiveTab(correctTab);
            }
        }

        // Setup infinite scroll listener
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoadingMore || !hasMore) {
                return;
            }
            loadMoreOrders();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [authUser, authLoading, isLoadingMore, hasMore]);

    /**
     * Custom sorting function for orders based on status priority
     */
    const sortOrdersByStatus = (ordersArray) => {
        const statusPriority = {
            'pending': 1,
            'in_progress': 2,
            'revision_requested': 3,
            'delivered': 4,
            'completed': 5,
            'cancelled': 6
        };

        return ordersArray.sort((a, b) => {
            const aPriority = statusPriority[a.status] || 99;
            const bPriority = statusPriority[b.status] || 99;
            
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            // If same status, sort by created_at descending (newest first)
            return new Date(b.created_at) - new Date(a.created_at);
        });
    };

    /**
     * Fetch orders from API based on current filters
     */
    const fetchOrders = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setOrders([]); // Clear orders immediately when resetting
                setHasMore(true);
            } else {
                setIsLoadingMore(true);
            }
            setError(null);
            
            const currentPage = reset ? 1 : Math.floor(orders.length / itemsPerPage) + 1;
            
            let url = '';
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            if (activeTab === 'buyer') {
                // Get orders where current user is the client
                url = `http://localhost:8000/api/orders/client/${authUser.uuid}?${params}`;
            } else {
                // Get orders where current user is the gig owner  
                url = `http://localhost:8000/api/orders/owner/${authUser.uuid}?${params}`;
            }
            
            console.log('👤 Using user UUID:', authUser.uuid);
            console.log('📍 Request URL:', url);

            console.log('🔄 Fetching orders from:', url);
            console.log('🎫 Using token:', token ? token.substring(0, 20) + '...' : 'No token available');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('✅ Authorization header added');
            } else {
                console.log('❌ No token available, request will fail');
            }
            
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error details:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Failed to fetch orders: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Orders received:', data);
            console.log('📦 Orders data array:', data.data);
            console.log('📦 First order sample:', data.data?.[0]);

            if (data.status === 'success') {
                const newOrders = data.data || [];
                
                if (reset) {
                    // Apply custom sorting for 'all' filter
                    const sortedOrders = statusFilter === 'all' ? sortOrdersByStatus([...newOrders]) : newOrders;
                    setOrders(sortedOrders);
                } else {
                    // Append new orders for infinite scroll
                    const combinedOrders = [...orders, ...newOrders];
                    const sortedOrders = statusFilter === 'all' ? sortOrdersByStatus(combinedOrders) : combinedOrders;
                    setOrders(sortedOrders);
                }
                
                // Handle pagination info if available
                if (data.pagination) {
                    setTotalOrders(data.pagination.total);
                    setHasMore(currentPage < data.pagination.pages);
                } else {
                    // If no pagination info, assume no more data if less than requested amount
                    setHasMore(newOrders.length === itemsPerPage);
                }
            } else {
                throw new Error(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    /**
     * Set loading state for specific action and order
     */
    const setActionLoading = (action, orderId, isLoading) => {
        setActionLoadings(prev => ({
            ...prev,
            [action]: {
                ...prev[action],
                [orderId]: isLoading
            }
        }));
    };

    /**
     * Get loading state for specific action and order
     */
    const getActionLoading = (action, orderId) => {
        return actionLoadings[action]?.[orderId] || false;
    };

    /**
     * Update order in place without full reload
     */
    const updateOrderInPlace = (orderId, updates) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, ...updates }
                    : order
            )
        );
    };

    /**
     * Load more orders for infinite scroll
     */
    const loadMoreOrders = () => {
        if (!isLoadingMore && hasMore) {
            fetchOrders(false);
        }
    };

    /**
     * Handle order status update with optimistic UI
     */
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            console.log('🔄 Updating order status:', orderId, newStatus);
            
            // Set loading state for this specific order
            setActionLoading('statusUpdate', orderId, true);
            
            // Optimistic update - update UI immediately
            updateOrderInPlace(orderId, { status: newStatus });
            
            await ApiService.updateOrderStatus(orderId, newStatus);
            
            console.log('✅ Order status updated successfully');
        } catch (err) {
            console.error('❌ Error updating order status:', err);
            
            // Revert optimistic update on error
            const originalOrder = orders.find(order => order.id === orderId);
            if (originalOrder) {
                updateOrderInPlace(orderId, { status: originalOrder.status });
            }
            
            alert(`Error updating order status: ${err.message}`);
        } finally {
            setActionLoading('statusUpdate', orderId, false);
        }
    };

    /**
     * Handle payment trigger for completed orders
     */
    const handlePaymentTrigger = (order) => {
        console.log('💳 Triggering payment for order:', order.id);
        navigate(`/payment/${order.id}`);
    };

    /**
     * Handle file download for delivered orders with loading state
     */
    const handleFileDownload = async (orderOrFile) => {
        const orderId = orderOrFile.id || orderOrFile.order_id;
        
        try {
            console.log('📥 File download started for order:', orderId);
            setActionLoading('fileDownload', orderId, true);
            
            // The actual file download logic would be here
            // For now, just simulate the action
            
            console.log('Orders data updated after file download');
        } catch (error) {
            console.error('Error during file download:', error);
            alert(`Error downloading file: ${error.message}`);
        } finally {
            setActionLoading('fileDownload', orderId, false);
        }
    };

    /**
     * Handle delivery upload for sellers with loading state
     */
    const handleDeliveryUpload = async (order) => {
        console.log('📤 Uploading delivery for order:', order.id);
        
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*'; // Accept all file types
        
        fileInput.onchange = async (event) => {
            const files = event.target.files;
            if (files.length === 0) return;
            
            try {
                // Set loading state for this specific order
                setActionLoading('deliveryUpload', order.id, true);
                
                // Add delivery message
                const deliveryMessage = prompt('Add a message for the delivery (optional):');
                
                // Convert FileList to Array
                const fileArray = Array.from(files);
                
                // Upload files using ApiService
                await ApiService.uploadDeliveryFiles(order.id, fileArray, deliveryMessage || '');
                
                // Update order status optimistically
                updateOrderInPlace(order.id, { 
                    status: 'delivered',
                    delivery_message: deliveryMessage || '',
                    delivery_files: fileArray.map(file => ({ name: file.name }))
                });
                
                alert('Delivery files uploaded successfully!');
                
            } catch (error) {
                console.error('Error uploading delivery:', error);
                
                // Parse error response for better user feedback
                let errorMessage = 'Error uploading delivery files';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                    
                    // Show specific guidance for common errors
                    if (error.response.data.details?.current_user_role === 'buyer') {
                        errorMessage += '\n\nPlease log in as the seller to upload delivery files.';
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
            } finally {
                setActionLoading('deliveryUpload', order.id, false);
            }
        };
        
        fileInput.click();
    };

    /**
     * Handle messaging between buyer and seller
     */
    const handleMessage = async (order) => {
        console.log('💬 Opening chat for order:', order.id);
        
        try {
            // Tạo hoặc lấy conversation cho order
            const response = await ApiService.getOrCreateOrderConversation(order.id);
            
            if (response.status === 'success') {
                // Navigate to inbox with conversation ID và order info
                navigate(`/inbox?conversation=${response.data.id}&order=${order.id}&gig=${order.gig_title}`);
            } else {
                throw new Error(response.message || 'Failed to create conversation');
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            alert(`Error creating conversation: ${error.message}`);
            // Fallback to general inbox
            navigate(`/inbox?order=${order.id}`);
        }
    };

    /**
     * Handle revision request with loading state
     */
    const handleRevisionRequest = async (order) => {
        console.log('🔄 Requesting revision for order:', order.id);
        
        const revisionReason = prompt('Please specify what needs to be revised:');
        if (revisionReason && revisionReason.trim()) {
            try {
                // Set loading state for this specific order
                setActionLoading('revisionRequest', order.id, true);
                
                // Optimistic update
                updateOrderInPlace(order.id, { status: 'revision_requested' });
                
                // Update status to revision_requested
                await ApiService.updateOrderStatus(order.id, 'revision_requested');
                
                // In a real app, you would also send the revision reason to the seller
                alert('Revision request sent to seller.');
                
            } catch (error) {
                console.error('Error requesting revision:', error);
                
                // Revert optimistic update on error
                updateOrderInPlace(order.id, { status: order.status });
                
                alert(`Error requesting revision: ${error.message}`);
            } finally {
                setActionLoading('revisionRequest', order.id, false);
            }
        }
    };

    /**
     * Get status badge color
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'revision_requested':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    /**
     * Get status icon
     */
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockCircleOutlined />;
            case 'in_progress':
                return <ClockCircleOutlined />;
            case 'delivered':
                return <CheckCircleOutlined />;
            case 'completed':
                return <CheckCircleOutlined />;
            case 'cancelled':
                return <CloseCircleOutlined />;
            case 'revision_requested':
                return <FileTextOutlined />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    /**
     * Skeleton loading component for order cards
     */
    const OrderCardSkeleton = () => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

    /**
     * Skeleton loading component for overview cards
     */
    const OrderOverviewSkeleton = () => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
    );
    /**
     * Filter buttons data
     */
    const statusFilters = [
        { key: 'all', label: 'All', count: totalOrders },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'in_progress', label: 'In Progress', count: 0 },
        { key: 'delivered', label: 'Delivered', count: 0 },
        { key: 'revision_requested', label: 'Needs Revision', count: 0 },
        { key: 'completed', label: 'Completed', count: 0 },
        { key: 'cancelled', label: 'Cancelled', count: 0 }
    ];

    
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <div className="flex-1 flex items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }
    
    const navBarComponent = authUser?.role === 'seller' ? <NavBar_Seller /> : <NavBar_Buyer />;

    // If not authenticated, the useEffect will redirect
    if (!authUser || !token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            {navBarComponent}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">
                        Manage your orders and track their progress
                    </p>
                </div>

                {/* Role Tabs - Show only relevant tab based on user role */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {(authUser?.role === 'buyer' || authUser?.role !== 'seller') && (
                                <button
                                    onClick={() => {
                                        setActiveTab('buyer');
                                        setSelectedOrderId(null);
                                        setStatusFilter('all');
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'buyer'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    My Purchases
                                </button>
                            )}
                            {authUser?.role === 'seller' && (
                                <button
                                    onClick={() => {
                                        setActiveTab('seller');
                                        setSelectedOrderId(null);
                                        setStatusFilter('all');
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'seller'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    My Sales
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => {
                                    setStatusFilter(filter.key);
                                    setSelectedOrderId(null);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    statusFilter === filter.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {filter.label}
                                {filter.count > 0 && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                                        {filter.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => {
                                fetchOrders(true);
                            }}
                            className="mt-2 text-red-600 hover:text-red-800 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        // Show skeleton loading for initial load and filter changes
                        selectedOrderId ? (
                            // Skeleton for detailed view
                            <OrderCardSkeleton />
                        ) : (
                            // Skeleton for overview grid
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderOverviewSkeleton key={index} />
                                ))}
                            </div>
                        )
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">
                                <ShoppingOutlined />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {activeTab === 'buyer' ? 'No purchases yet' : 'No sales yet'}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'buyer' 
                                    ? 'Start browsing services to make your first purchase' 
                                    : 'Orders for your services will appear here'
                                }
                            </p>
                            {activeTab === 'buyer' && (
                                <button
                                    onClick={() => navigate('/explore')}
                                    className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Browse Services
                                </button>
                            )}
                        </div>
                    ) : selectedOrderId ? (
                        // Show detailed view for selected order only
                        <>
                            {orders
                                .filter(order => order.id === selectedOrderId)
                                .map((order) => {
                                    try {
                                        return (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                userRole={activeTab}
                                                onStatusUpdate={handleStatusUpdate}
                                                onPaymentTrigger={handlePaymentTrigger}
                                                onFileDownload={handleFileDownload}
                                                onDeliveryUpload={handleDeliveryUpload}
                                                onMessage={handleMessage}
                                                onRevisionRequest={handleRevisionRequest}
                                                getStatusColor={getStatusColor}
                                                getStatusIcon={getStatusIcon}
                                                // Loading states for each action
                                                isStatusUpdating={getActionLoading('statusUpdate', order.id)}
                                                isDeliveryUploading={getActionLoading('deliveryUpload', order.id)}
                                                isFileDownloading={getActionLoading('fileDownload', order.id)}
                                                isRevisionRequesting={getActionLoading('revisionRequest', order.id)}
                                            />
                                        );
                                    } catch (error) {
                                        console.error('❌ Error rendering order card:', error, 'Order data:', order);
                                        return (
                                            <div key={order.id || `error-${Date.now()}`} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                                <p className="text-red-600 font-medium">Error loading order</p>
                                                <p className="text-red-500 text-sm">Order ID: {order.id || 'Unknown'}</p>
                                                <p className="text-red-500 text-sm">Error: {error.message}</p>
                                            </div>
                                        );
                                    }
                                })}
                        </>
                    ) : (
                        // Show overview list of all orders
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.map((order) => {
                                try {
                                    return (
                                        <OrderOverviewCard
                                            key={order.id}
                                            order={order}
                                            userRole={activeTab}
                                            onClick={(orderId) => {
                                                setSelectedOrderId(orderId);
                                            }}
                                            // Pass loading states for visual feedback
                                            isStatusUpdating={getActionLoading('statusUpdate', order.id)}
                                            isDeliveryUploading={getActionLoading('deliveryUpload', order.id)}
                                            isFileDownloading={getActionLoading('fileDownload', order.id)}
                                            isRevisionRequesting={getActionLoading('revisionRequest', order.id)}
                                        />
                                    );
                                } catch (error) {
                                    console.error('❌ Error rendering order card:', error, 'Order data:', order);
                                    return (
                                        <div key={order.id || `error-${Date.now()}`} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                            <p className="text-red-600 font-medium">Error loading order</p>
                                            <p className="text-red-500 text-sm">Order ID: {order.id || 'Unknown'}</p>
                                            <p className="text-red-500 text-sm">Error: {error.message}</p>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>

                {/* Back to Overview Button (when viewing a specific order) */}
                {selectedOrderId && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setSelectedOrderId(null);
                            }}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            ← Back to List
                        </button>
                    </div>
                )}

                {/* Infinite Scroll Loading Indicator */}
                {isLoadingMore && (
                    <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <OrderOverviewSkeleton key={`loading-${index}`} />
                            ))}
                        </div>
                    </div>
                )}

                {/* End of Results Indicator */}
                {!hasMore && orders.length > 0 && (
                    <div className="mt-8 text-center text-gray-500">
                        <p>You've reached the end of your orders</p>
                    </div>
                )}
            </div>

            <Footer />

        </div>
    );
};

export default Orders;