/**
 * Payment Page Component - Handle order payment processing
 * 
 * @file Payment.jsx
 * @description Payment processing page for completing orders
 * 
 * @requires react - For component functionality
 * @requires react-router-dom - For navigation and params
 * @requires @ant-design/icons - For icons
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleOutlined, CreditCardOutlined, DollarOutlined, LockOutlined, ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import NavBar from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import AutoPaymentTimer from '../components/AutoPaymentTimer/AutoPaymentTimer';
import { useAuth } from '../contexts/AuthContext';

/**
 * Payment component for processing order payments
 */
const Payment = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { token, authUser, isLoading: authLoading } = useAuth();
    
    // State management
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    
    // Payment form state
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });

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
     * Fetch order details for payment
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
                
                // Validate that user can pay for this order
                if (data.data.client_id !== authUser.uuid) {
                    throw new Error('You are not authorized to pay for this order');
                }
                
                if (data.data.status !== 'delivered') {
                    throw new Error('This order is not ready for payment');
                }
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

    /**
     * Handle payment processing
     */
    const handlePayment = async () => {
        try {
            setProcessing(true);
            setError(null);
            
            // Validate payment method
            if (paymentMethod === 'wallet') {
                // Check wallet balance
                if (!authUser.balance || authUser.balance < order.price_at_purchase) {
                    throw new Error('Insufficient wallet balance. Please top up your wallet or use a different payment method.');
                }
            } else if (paymentMethod === 'card') {
                // Validate card details
                if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.nameOnCard) {
                    throw new Error('Please fill in all card details');
                }
            }
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update order status to completed
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (!response.ok) {
                throw new Error('Payment processed but failed to update order status');
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                // Redirect to success page
                navigate(`/payment/success/${orderId}`);
            } else {
                throw new Error(data.message || 'Failed to complete payment');
            }
        } catch (err) {
            console.error('❌ Payment error:', err);
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    /**
     * Handle form input changes
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
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

    if (error && !order) {
        return (
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <NavBar />
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Error</h2>
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
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <ArrowLeftOutlined className="mr-2" />
                        Back to Orders
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
                    <p className="text-gray-600">
                        Complete payment now to finalize your order immediately and stop any auto-payment countdown
                    </p>
                </div>

                {/* Auto Payment Timer - Prominent display for payment urgency */}
                {order?.status === 'delivered' && 
                 order?.auto_payment_deadline && 
                 order?.download_start_time && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-8">
                        <div className="flex items-center mb-3">
                            <ClockCircleOutlined className="text-red-500 mr-3 text-xl" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Auto Payment Timer Active</h3>
                                <p className="text-sm text-gray-600">
                                    Complete your payment before the timer expires to avoid automatic processing
                                </p>
                            </div>
                        </div>
                        <AutoPaymentTimer
                            deadline={order.auto_payment_deadline}
                            userRole="buyer"
                            orderPrice={order.price_at_purchase}
                            className="mb-3"
                        />
                        <div className="text-xs text-gray-500">
                            Timer started when you first downloaded delivery files: {new Date(order.download_start_time).toLocaleString()}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                            
                            {/* Gig Info */}
                            <div className="mb-4">
                                {order?.gig_cover_image && (
                                    <img 
                                        src={order.gig_cover_image} 
                                        alt={order.gig_title}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <h4 className="font-medium text-gray-900 mb-1">{order?.gig_title}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    by {order?.gig_owner_name}
                                </p>
                            </div>

                            {/* Order Details */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Order ID:</span>
                                    <span className="text-sm font-medium">#{String(order?.id).slice(-8)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <span className="text-sm font-medium capitalize">{order?.status}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm text-gray-600">Delivery:</span>
                                    <span className="text-sm font-medium">{order?.gig_delivery_days} days</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            ${order?.price_at_purchase?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h3>
                            
                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Wallet Payment */}
                                    <div 
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                            paymentMethod === 'wallet' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('wallet')}
                                    >
                                        <div className="flex items-center">
                                            <DollarOutlined className="text-xl text-green-600 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-900">Wallet Balance</p>
                                                <p className="text-sm text-gray-600">
                                                    Available: ${authUser?.balance?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Payment */}
                                    <div 
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                            paymentMethod === 'card' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="flex items-center">
                                            <CreditCardOutlined className="text-xl text-blue-600 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-900">Credit/Debit Card</p>
                                                <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details Form */}
                            {paymentMethod === 'card' && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Card Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={paymentData.cardNumber}
                                                onChange={handleInputChange}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={paymentData.expiryDate}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentData.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name on Card
                                            </label>
                                            <input
                                                type="text"
                                                name="nameOnCard"
                                                value={paymentData.nameOnCard}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <LockOutlined className="text-green-600 mr-2" />
                                    <p className="text-sm text-green-800">
                                        Your payment information is secure and encrypted
                                    </p>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing Payment...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <CheckCircleOutlined className="mr-2" />
                                        Complete Payment (${order?.price_at_purchase?.toFixed(2)})
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Payment;
