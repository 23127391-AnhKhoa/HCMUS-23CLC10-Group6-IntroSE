// src/components/CreateGigButton/ReviewPublish.jsx
import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  PencilIcon,
  TagIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const ReviewPublish = ({ gigData = {}, onInputChange, errors = {}, onPublish, isPublishing = false, isLoading = false }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Debug log to check props
  // console.log('ReviewPublish props:', { gigData, isPublishing, isLoading });

  // Calculate total price with surcharges (same logic as PricingCreGigs)
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(gigData?.price) || 0;
    const deliveryDays = parseInt(gigData?.delivery_days) || 7;
    const numOfEdits = parseInt(gigData?.num_of_edits) || 0;
    
    // Fast delivery surcharge
    let deliverySurcharge = 0;
    if (deliveryDays === 1) {
      deliverySurcharge = basePrice * 0.5; // 50% surcharge for 1-day delivery
    } else if (deliveryDays === 2) {
      deliverySurcharge = basePrice * 0.25; // 25% surcharge for 2-day delivery  
    } else if (deliveryDays === 3) {
      deliverySurcharge = basePrice * 0.1; // 10% surcharge for 3-day delivery
    }
    
    // Extra revisions fee (more than 3 revisions)
    let revisionFee = 0;
    if (numOfEdits > 3) {
      revisionFee = (numOfEdits - 3) * (basePrice * 0.1); // 10% of base price per extra revision
    }
    
    return basePrice + deliverySurcharge + revisionFee;
  };

  // Early return if no gigData provided
  if (!gigData || typeof gigData !== 'object') {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Review & Publish Your Gig
          </h1>
          <p className="text-base sm:text-lg text-red-600 dark:text-red-400">
            Error: No gig data available. Please go back and complete the previous steps.
          </p>
        </div>
      </div>
    );
  }

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get media count
  const getMediaCount = () => {
    let count = 0;
    if (gigData?.cover_image) count++;
    if (gigData?.additional_media && Array.isArray(gigData.additional_media) && gigData.additional_media.length > 0) {
      count += gigData.additional_media.length;
    }
    return count;
  };

  // Helper function to check if gig is ready to publish
  const isReadyToPublish = () => {
    if (!gigData) return false;
    
    const requiredFields = [
      'gigTitle',
      'category',
      'subcategory', 
      'cover_image',
      'description',
      'price',
      'delivery_days'
    ];
    
    return requiredFields.every(field => {
      const value = gigData[field];
      return value && value.toString().trim() !== '';
    }) && agreedToTerms;
  };

  // Get validation warnings
  const getValidationWarnings = () => {
    if (!gigData) return [];
    
    const warnings = [];
    
    if (!gigData.positiveKeywords || gigData.positiveKeywords.trim() === '') {
      warnings.push('No positive keywords added - this may affect discoverability');
    }
    
    if (!gigData.additional_media || !Array.isArray(gigData.additional_media) || gigData.additional_media.length === 0) {
      warnings.push('No additional media - consider adding more images or videos');
    }
    
    if (!gigData.faqs || !Array.isArray(gigData.faqs) || gigData.faqs.length === 0) {
      warnings.push('No FAQs added - this may lead to more buyer questions');
    }
    
    if (!gigData.searchTags || !Array.isArray(gigData.searchTags) || gigData.searchTags.length < 3) {
      warnings.push('Less than 3 search tags - add more for better visibility');
    }
    
    return warnings;
  };

  const handlePublish = () => {
    if (isReadyToPublish() && !isLoading && !isPublishing && onPublish) {
      onPublish();
    }
  };

  const warnings = getValidationWarnings();

  try {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-step-in">
        {/* Header */}
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Review & Publish Your Gig
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Take a final look at your gig before publishing it to the world
          </p>
        </div>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 animate-review-card">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Recommendations to improve your gig:
              </h3>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Review Content */}
        <div className="xl:col-span-2 space-y-6 order-2 xl:order-1">
          {/* Overview Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
            <div className="flex items-center mb-4">
              <TagIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Gig Overview
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 break-words">
                  {gigData?.gigTitle || 'Untitled Gig'}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {gigData?.category || 'No category'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                    {gigData?.subcategory || 'No subcategory'}
                  </span>
                </div>
                
                {gigData?.searchTags && Array.isArray(gigData.searchTags) && gigData.searchTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {gigData.searchTags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PhotoIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Media Gallery
                </h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getMediaCount()} file{getMediaCount() !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Cover Image */}
              {gigData?.cover_image && (
                <div className="relative group hover-scale">
                  <img 
                    src={gigData.cover_image} 
                    alt="Cover" 
                    className="w-full h-20 sm:h-24 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                </div>
              )}
              
              {/* Additional Media */}
              {gigData?.additional_media && Array.isArray(gigData.additional_media) && gigData.additional_media.map((url, index) => {
                const isVideo = url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('video'));
                
                return (
                  <div key={index} className="relative group hover-scale">
                    {isVideo ? (
                      <video 
                        src={url} 
                        className="w-full h-20 sm:h-24 object-cover rounded-lg"
                        controls
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Media ${index + 1}`} 
                        className="w-full h-20 sm:h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      {isVideo ? 'Video' : 'Image'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Description
              </h2>
            </div>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed break-words"
                dangerouslySetInnerHTML={{
                  __html: gigData?.description || 'No description provided'
                }}
              />
            </div>
          </div>

          {/* FAQs Section */}
          {gigData?.faqs && Array.isArray(gigData.faqs) && gigData.faqs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
              <div className="flex items-center mb-4">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Frequently Asked Questions
                </h2>
              </div>
              
              <div className="space-y-4">
                {gigData.faqs.map((faq, index) => (
                  <div key={index} className="border-l-4 border-indigo-200 dark:border-indigo-700 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 break-words">
                      {faq?.question || 'No question'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                      {faq?.answer || 'No answer'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 order-1 xl:order-2">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pricing & Delivery
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Price</span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    ${calculateTotalPrice().toFixed(2)}
                  </span>
                  {calculateTotalPrice() > (parseFloat(gigData?.price) || 0) && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Base: ${(parseFloat(gigData?.price) || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                <div className="flex items-center text-gray-900 dark:text-gray-100">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {gigData?.delivery_days || 0} day{(gigData?.delivery_days || 0) !== 1 ? 's' : ''}
                </div>
              </div>
              
              {gigData?.num_of_edits && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-gray-400">Revisions</span>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    {gigData.num_of_edits} revision{gigData.num_of_edits !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              {/* Price Breakdown - Show if there are extra fees */}
              {(() => {
                const totalPrice = calculateTotalPrice();
                const basePrice = parseFloat(gigData?.price) || 0;
                const deliveryDays = parseInt(gigData?.delivery_days) || 7;
                const numOfEdits = parseInt(gigData?.num_of_edits) || 0;
                
                // Calculate individual fees
                let deliverySurcharge = 0;
                if (deliveryDays === 1) {
                  deliverySurcharge = basePrice * 0.5;
                } else if (deliveryDays === 2) {
                  deliverySurcharge = basePrice * 0.25;
                } else if (deliveryDays === 3) {
                  deliverySurcharge = basePrice * 0.1;
                }
                
                let revisionFee = 0;
                if (numOfEdits > 3) {
                  revisionFee = (numOfEdits - 3) * (basePrice * 0.1);
                }
                
                const shouldShowBreakdown = deliverySurcharge > 0 || revisionFee > 0;
                
                return shouldShowBreakdown ? (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Price Breakdown:</h4>
                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>${basePrice.toFixed(2)}</span>
                      </div>
                      
                      {deliverySurcharge > 0 && (
                        <div className="flex justify-between">
                          <span>
                            {deliveryDays === 1 ? 'Express 1-day delivery (+50%)' : 
                             deliveryDays === 2 ? 'Fast 2-day delivery (+25%)' : 
                             'Quick 3-day delivery (+10%)'}:
                          </span>
                          <span>+${deliverySurcharge.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {revisionFee > 0 && (
                        <div className="flex justify-between">
                          <span>{numOfEdits - 3} extra revision{numOfEdits - 3 > 1 ? 's' : ''} (+10% each):</span>
                          <span>+${revisionFee.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between border-t border-blue-300 dark:border-blue-700 pt-1 mt-2 font-semibold">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Publish Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-review-card hover-scale">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ready to Publish?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Community Guidelines
                  </a>
                </label>
              </div>
              
              {/* Publish button removed as requested */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>✓ Your gig is ready to publish</p>
                <p>Use the "Save & Publish" button at the bottom to complete the process</p>
              </div>
              
              {!isReadyToPublish() && !isLoading && (
                <p className="text-xs text-red-600 dark:text-red-400 text-center animate-fade-in">
                  {!agreedToTerms 
                    ? 'Please agree to the terms to publish'
                    : 'Please complete all required fields'
                  }
                </p>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 sm:p-6 animate-review-card hover-scale">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
              💡 Publishing Tips
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Your gig will be live immediately after publishing</li>
              <li>• You can edit your gig anytime from your seller dashboard</li>
              <li>• High-quality images increase buyer interest by 40%</li>
              <li>• Detailed descriptions reduce buyer questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error in ReviewPublish component:', error);
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Review & Publish Your Gig
          </h1>
          <p className="text-base sm:text-lg text-red-600 dark:text-red-400">
            An error occurred while loading the review page. Please try refreshing or go back to the previous step.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }
};

export default ReviewPublish;
