/**
 * CreateOrderModal Component - Modal for creating new orders
 * 
 * @file CreateOrderModal.jsx
 * @description Modal component for creating new orders with gig selection and requirements
 * 
 * @requires react - For component functionality
 * @requires @ant-design/icons - For icons
 * @requires prop-types - For prop validation
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CloseOutlined, SearchOutlined, ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';

/**
 * CreateOrderModal component for creating new orders
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSubmit - Callback to submit order
 * @param {Object} props.gig - Pre-selected gig (optional)
 * @returns {JSX.Element} CreateOrderModal component
 */
const CreateOrderModal = ({ onClose, onSubmit, gig = null }) => {
    // Form state
    const [formData, setFormData] = useState({
        gig_id: gig?.id || '',
        price_at_purchase: gig?.price || 0,
        requirement: '',
        status: 'pending'
    });
    
    // UI state
    const [availableGigs, setAvailableGigs] = useState([]);
    const [loadingGigs, setLoadingGigs] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGig, setSelectedGig] = useState(gig || null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch available gigs when modal opens (only if no gig pre-selected)
    useEffect(() => {
        if (!gig) {
            fetchAvailableGigs();
        }
    }, [gig]);

    /**
     * Fetch available gigs from API
     */
    const fetchAvailableGigs = async () => {
        try {
            setLoadingGigs(true);
            
            const response = await fetch('http://localhost:8000/api/gigs?status=active&limit=50');
            
            if (!response.ok) {
                throw new Error('Failed to fetch gigs');
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setAvailableGigs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching gigs:', error);
            alert('Failed to load available gigs');
        } finally {
            setLoadingGigs(false);
        }
    };

    /**
     * Filter gigs based on search term
     */
    const filteredGigs = availableGigs.filter(gig =>
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.owner_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Handle gig selection
     */
    const handleGigSelect = (gig) => {
        setSelectedGig(gig);
        setFormData(prev => ({
            ...prev,
            gig_id: gig.id,
            price_at_purchase: gig.price
        }));
        setErrors(prev => ({ ...prev, gig_id: '' }));
    };

    /**
     * Handle form input changes
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.gig_id) {
            newErrors.gig_id = 'Please select a gig';
        }
        
        if (!formData.requirement.trim()) {
            newErrors.requirement = 'Please provide order requirements';
        }
        
        if (formData.price_at_purchase <= 0) {
            newErrors.price_at_purchase = 'Price must be greater than 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setSubmitting(true);
            // Format the data for submission
            const submissionData = {
                requirements: formData.requirement
            };
            await onSubmit(submissionData);
            
            // Show success state
            setSuccessMessage('Order created successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('Error submitting order:', error);
            // You can add error handling here if needed
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Handle modal background click
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {showSuccess ? (
                    // Success State
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircleOutlined className="text-green-600 text-4xl" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Order Created Successfully!
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Your order has been submitted and is waiting for the seller's confirmation.
                        </p>
                        <p className="text-gray-600 mb-8">
                            You'll receive notifications about the order status updates.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    // Normal Form State
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                <ShoppingCartOutlined className="mr-2" />
                                Create New Order
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <CloseOutlined size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Gig Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {gig ? 'Selected Gig' : 'Select a Gig'} *
                            </label>
                            
                            {/* Pre-selected Gig Display (from GigDetail) */}
                            {gig && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{gig.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                by {gig.owner_username || gig.owner_fullname} • {gig.category_name}
                                            </p>
                                            <p className="text-lg font-semibold text-green-600 mt-2">
                                                ${gig.price}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Delivery: {gig.delivery_days} day{gig.delivery_days !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="text-green-600">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search and selection (only when no pre-selected gig) */}
                            {!gig && (
                                <>
                                    {/* Search */}
                                    <div className="relative mb-4">
                                        <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search gigs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Selected Gig Display */}
                                    {selectedGig && (
                                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{selectedGig.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        by {selectedGig.owner_username} • {selectedGig.category_name}
                                                    </p>
                                                    <p className="text-lg font-semibold text-blue-600 mt-2">
                                                        ${selectedGig.price}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedGig(null);
                                                        setFormData(prev => ({ ...prev, gig_id: '', price_at_purchase: 0 }));
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <CloseOutlined />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gig List */}
                                    {!selectedGig && (
                                        <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                                            {loadingGigs ? (
                                                <div className="flex items-center justify-center p-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                </div>
                                            ) : filteredGigs.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    {searchTerm ? 'No gigs found matching your search' : 'No active gigs available'}
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {filteredGigs.map((gigItem) => (
                                                        <div
                                                            key={gigItem.id}
                                                            onClick={() => handleGigSelect(gigItem)}
                                                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-gray-900">{gigItem.title}</h4>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        by {gigItem.owner_username} • {gigItem.category_name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        Delivery: {gigItem.delivery_days} days
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-semibold text-gray-900">
                                                                        ${gigItem.price}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {errors.gig_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.gig_id}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div>
                            <label htmlFor="price_at_purchase" className="block text-sm font-medium text-gray-700 mb-2">
                                Order Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    id="price_at_purchase"
                                    name="price_at_purchase"
                                    value={formData.price_at_purchase}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!!(selectedGig || gig)}
                                />
                            </div>
                            {errors.price_at_purchase && (
                                <p className="mt-1 text-sm text-red-600">{errors.price_at_purchase}</p>
                            )}
                        </div>

                        {/* Requirements */}
                        <div>
                            <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 mb-2">
                                Order Requirements *
                            </label>
                            <textarea
                                id="requirement"
                                name="requirement"
                                value={formData.requirement}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Describe what you need, provide any specific instructions, deadlines, or requirements..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.requirement && (
                                <p className="mt-1 text-sm text-red-600">{errors.requirement}</p>
                            )}
                        </div>

                        {/* Order Summary */}
                        {(selectedGig || gig) && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Gig:</span>
                                        <span>{(selectedGig || gig)?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Seller:</span>
                                        <span>{(selectedGig || gig)?.owner_username || (selectedGig || gig)?.owner_fullname}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Time:</span>
                                        <span>{(selectedGig || gig)?.delivery_days} days</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
                                        <span>Total:</span>
                                        <span>${(selectedGig || gig)?.price}</span>
                                    </div>
                                </div>
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                    <strong>Note:</strong> The delivery deadline will be automatically calculated when the seller confirms your order.
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || (!selectedGig && !gig)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Order'
                        )}
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

CreateOrderModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    gig: PropTypes.object
};

export default CreateOrderModal;
