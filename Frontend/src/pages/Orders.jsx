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
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, FileTextOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import NavBar from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import OrderCard from '../components/OrderCard/OrderCard';
import OrderOverviewCard from '../components/OrderOverviewCard/OrderOverviewCard';
import AutoPaymentWidget from '../components/AutoPaymentWidget/AutoPaymentWidget';
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
    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 10;

    // Check authentication and redirect if needed
    useEffect(() => {
        console.log('🔄 Auth state check:', { 
            authLoading, 
            authUser: authUser ? 'Present' : 'Missing', 
            token: token ? 'Present' : 'Missing' 
        });
        
        if (!authLoading && (!authUser || !token)) {
            console.log('❌ No authentication, redirecting to login');
            navigate('/login');
            return;
        }
    }, [authUser, token, authLoading, navigate]);

    // Fetch orders when component mounts or filters change
    useEffect(() => {
        if (!authLoading && authUser && token) {
            fetchOrders();
        }
    }, [authUser, token, authLoading, activeTab, statusFilter, currentPage]);

    /**
     * Fetch orders from API based on current filters
     */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
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
                setOrders(data.data || []);
                
                // Handle pagination info if available
                if (data.pagination) {
                    setTotalPages(data.pagination.pages);
                    setTotalOrders(data.pagination.total);
                }
            } else {
                throw new Error(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle order status update
     */
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            console.log('🔄 Updating order status:', orderId, newStatus);
            
            await ApiService.updateOrderStatus(orderId, newStatus);
            
            // Refresh orders list
            fetchOrders();
            console.log('✅ Order status updated successfully');
        } catch (err) {
            console.error('❌ Error updating order status:', err);
            alert(`Error updating order status: ${err.message}`);
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
     * Handle file download for delivered orders
     */
    const handleFileDownload = async (orderOrFile) => {
        console.log('📥 File downloaded from modal - updating order data');
        
        try {
            // If we received an updated order object, update it in our orders list
            if (orderOrFile && orderOrFile.id && orderOrFile.auto_payment_deadline) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderOrFile.id ? { ...order, ...orderOrFile } : order
                    )
                );
                console.log('Order updated with auto-payment deadline:', orderOrFile.auto_payment_deadline);
            } else {
                // Otherwise, refresh all orders data
                await loadOrders();
                console.log('Orders data refreshed after file download');
            }
        } catch (error) {
            console.error('Error updating orders after download:', error);
        }
    };

    /**
     * Handle delivery upload for sellers
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
                // Add delivery message
                const deliveryMessage = prompt('Add a message for the delivery (optional):');
                
                // Convert FileList to Array
                const fileArray = Array.from(files);
                
                // Upload files using ApiService
                await ApiService.uploadDeliveryFiles(order.id, fileArray, deliveryMessage || '');
                
                alert('Delivery files uploaded successfully!');
                
                // Refresh orders list
                fetchOrders();
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
     * Handle revision request
     */
    const handleRevisionRequest = async (order) => {
        console.log('🔄 Requesting revision for order:', order.id);
        
        const revisionReason = prompt('Please specify what needs to be revised:');
        if (revisionReason && revisionReason.trim()) {
            try {
                // Update status to revision_requested
                await ApiService.updateOrderStatus(order.id, 'revision_requested');
                
                // In a real app, you would also send the revision reason to the seller
                alert('Revision request sent to seller.');
                
                // Refresh orders list
                fetchOrders();
            } catch (error) {
                console.error('Error requesting revision:', error);
                alert(`Error requesting revision: ${error.message}`);
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
     * Filter buttons data
     */
    const statusFilters = [
        { key: 'all', label: 'All Orders', count: totalOrders },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'in_progress', label: 'In Progress', count: 0 },
        { key: 'delivered', label: 'Delivered', count: 0 },
        { key: 'revision_requested', label: 'Revision Requested', count: 0 },
        { key: 'completed', label: 'Completed', count: 0 },
        { key: 'cancelled', label: 'Cancelled', count: 0 }
    ];

    
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                
                <div className="flex-1 flex items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }
    const navBarComponent = authUser.role === 'seller' ? <NavBar_Seller /> : <NavBar_Buyer />;

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

                {/* Tab Navigation and View Controls */}
                <div className="mb-6 space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
                            <button
                                onClick={() => {
                                    setActiveTab('buyer');
                                    setCurrentPage(1);
                                    setViewMode('overview'); // Reset to overview when switching tabs
                                }}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'buyer'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <ShoppingOutlined className="mr-2" />
                                As Buyer
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('seller');
                                    setCurrentPage(1);
                                    setViewMode('overview'); // Reset to overview when switching tabs
                                }}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'seller'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <EyeOutlined className="mr-2" />
                                As Seller
                            </button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('overview')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'overview'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <AppstoreOutlined className="mr-1" />
                                Overview
                            </button>
                            <button
                                onClick={() => setViewMode('detailed')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'detailed'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <UnorderedListOutlined className="mr-1" />
                                Detailed
                            </button>
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
                                    setCurrentPage(1);
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
            </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="mt-2 text-red-600 hover:text-red-800 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Orders List */}
                <div className={viewMode === 'overview' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                    {orders.length === 0 ? (
                        <div className={`text-center py-12 ${viewMode === 'overview' ? 'col-span-full' : ''}`}>
                            <div className="text-gray-400 text-6xl mb-4">
                                <ShoppingOutlined />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {activeTab === 'buyer' ? 'No orders placed yet' : 'No orders received yet'}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'buyer' 
                                    ? 'Start browsing gigs to place your first order' 
                                    : 'Orders for your gigs will appear here'
                                }
                            </p>
                            {activeTab === 'buyer' && (
                                <button
                                    onClick={() => navigate('/explore')}
                                    className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Explore Gigs
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {orders.map((order) => {
                                try {
                                    return viewMode === 'overview' ? (
                                        <OrderOverviewCard
                                            key={order.id}
                                            order={order}
                                            userRole={activeTab}
                                            onClick={(orderId) => {
                                                setSelectedOrderId(orderId);
                                                setViewMode('detailed');
                                            }}
                                        />
                                    ) : (
                                        // Show detailed view for specific order or all orders
                                        (!selectedOrderId || selectedOrderId === order.id) ? (
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
                                            />
                                        ) : null
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
                    )}
                </div>

                {/* Back to Overview Button (when in detailed view with selected order) */}
                {viewMode === 'detailed' && selectedOrderId && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setSelectedOrderId(null);
                                setViewMode('overview');
                            }}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            ← Back to Overview
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* Auto Payment Widget - Floating countdown timer */}
            {/* Temporarily disabled for debugging */}
            {/*
            <AutoPaymentWidget
                orders={orders}
                userRole={userRole}
                onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
                position="bottom-right"
            />
            */}
        </div>
    );
};

export default Orders;