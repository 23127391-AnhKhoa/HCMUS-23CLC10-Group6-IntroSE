/**
 * Payment Success Page Component - Display payment completion confirmation
 * 
 * @file PaymentSuccess.jsx
 * @description Success page after completing payment
 * 
 * @requires react - For component functionality
 * @requires react-router-dom - For navigation
 * @requires @ant-design/icons - For icons
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleOutlined, StarOutlined, DownloadOutlined, MessageOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import NavBar from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import { useAuth } from '../contexts/AuthContext';

/**
 * PaymentSuccess component for displaying payment confirmation
 */
const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { token, authUser, isLoading: authLoading } = useAuth();
    
    // State management
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication
    useEffect(() => {
        if (!authLoading && (!authUser || !token)) {
            navigate('/login');
            return;
        }
    }, [authUser, token, authLoading, navigate]);

    // Fetch order details
    useEffect(() => {
        if (!authLoading && authUser && token && orderId) {
            fetchOrderDetails();
        }
    }, [authUser, token, authLoading, orderId]);

    /**
     * Fetch order details
     */
    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                setOrder(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch order');
            }
        } catch (err) {
            console.error('❌ Error fetching order:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <NavBar />
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <NavBar />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleOutlined className="text-4xl text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-lg text-gray-600">
                        Your order has been completed and payment processed successfully.
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Order Info */}
                        <div>
                            <div className="flex items-start gap-4">
                                {order?.gig_cover_image && (
                                    <img 
                                        src={order.gig_cover_image} 
                                        alt={order.gig_title}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{order?.gig_title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        by {order?.gig_owner_name}
                                    </p>
                                    <div className="text-lg font-bold text-green-600">
                                        ${order?.price_at_purchase?.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Details */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Order ID:</span>
                                <span className="text-sm font-medium">#{String(order?.id).slice(-8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="text-sm font-medium text-green-600 capitalize">
                                    {order?.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Completed At:</span>
                                <span className="text-sm font-medium">
                                    {order?.completed_at ? 
                                        new Date(order.completed_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 
                                        'Just now'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Payment Method:</span>
                                <span className="text-sm font-medium">Wallet Balance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Download Files */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DownloadOutlined className="text-xl text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Download Files</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Access and download your completed project files
                        </p>
                        <button 
                            onClick={() => navigate(`/order/${order?.id}/files`)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Download
                        </button>
                    </div>

                    {/* Rate Seller */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <StarOutlined className="text-xl text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Rate & Review</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Share your experience and rate the seller
                        </p>
                        <button 
                            onClick={() => navigate(`/order/${order?.id}/review`)}
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                        >
                            Leave Review
                        </button>
                    </div>

                    {/* Contact Seller */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageOutlined className="text-xl text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Contact Seller</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Get in touch with the seller for any questions
                        </p>
                        <button 
                            onClick={() => navigate(`/order/${order?.id}/chat`)}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Message
                        </button>
                    </div>
                </div>

                {/* Transaction Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold text-green-800 mb-3">Transaction Complete</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-green-700">
                                <strong>Payment Status:</strong> Completed
                            </p>
                            <p className="text-green-700">
                                <strong>Transaction ID:</strong> TXN-{String(order?.id).padStart(8, '0')}
                            </p>
                        </div>
                        <div>
                            <p className="text-green-700">
                                <strong>Receipt:</strong> Sent to your email
                            </p>
                            <p className="text-green-700">
                                <strong>Seller Payment:</strong> Released
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeftOutlined className="mr-2" />
                        Back to Orders
                    </button>
                    <button
                        onClick={() => navigate('/explore')}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Explore More Gigs
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PaymentSuccess;
