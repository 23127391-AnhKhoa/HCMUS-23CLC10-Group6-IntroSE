// src/components/CreateGigButton/Pricing_CreGigs.jsx
import React, { useEffect } from 'react';

const PricingCreGigs = ({ gigData, onInputChange, errors = {} }) => {
  // Force re-render when gigData changes
  useEffect(() => {
    // gigData updated
  }, [gigData]);
  
  // Calculate total price based on delivery days and revisions
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(gigData.price) || 0;
    const deliveryDays = parseInt(gigData.delivery_days) || 7;
    const numOfEdits = parseInt(gigData.num_of_edits) || 0;
    
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

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      onInputChange('price', value);
    }
  };

  const handleDeliveryDaysChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
       onInputChange('delivery_days', value);
    }
  };

  const handleEditsChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onInputChange('num_of_edits', value);
    }
  };

  const inputBaseClasses = "block w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelClasses = "block text-lg font-semibold text-slate-800 mb-2";

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">
        Scope & Pricing
      </h2>
      
      <div className="space-y-8">
        {/* Basic Package Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-800 mb-4">Basic Package</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className={labelClasses}>
                Base Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="1.00"
                  min="1"
                  step="0.01"
                  value={gigData.price || ''}
                  onChange={handlePriceChange}
                  className={`${inputBaseClasses} pl-8 py-3 ${errors.price ? 'border-red-500 ring-red-300' : ''}`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Delivery Days */}
            <div className="space-y-2">
              <label htmlFor="delivery_days" className={labelClasses}>
                Delivery Time
              </label>
              <select
                id="delivery_days"
                name="delivery_days"
                value={gigData.delivery_days || 7}
                onChange={handleDeliveryDaysChange}
                className={`${inputBaseClasses} py-3 ${errors.delivery_days ? 'border-red-500 ring-red-300' : ''}`}
              >
                <option value={1}>1 day (+50%)</option>
                <option value={2}>2 days (+25%)</option>
                <option value={3}>3 days (+10%)</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
              </select>
              {errors.delivery_days && (
                <p className="mt-1 text-sm text-red-600">{errors.delivery_days}</p>
              )}
            </div>

            {/* Response Time */}
            <div className="space-y-2">
              <label htmlFor="response_time_hours" className={labelClasses}>
                Response Time (Hours)
              </label>
              <select
                id="response_time_hours"
                name="response_time_hours"
                value={gigData.response_time_hours || 24}
                onChange={(e) => onInputChange('response_time_hours', parseInt(e.target.value))}
                className={`${inputBaseClasses} py-3`}
              >
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
                <option value={168}>1 week</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Time allowed for buyer to respond after delivery download
              </p>
            </div>

            {/* Number of Edits */}
            <div className="space-y-2">
              <label htmlFor="num_of_edits" className={labelClasses}>
                Revisions Included
              </label>
              <select
                id="num_of_edits"
                name="num_of_edits"
                value={gigData.num_of_edits || 3}
                onChange={handleEditsChange}
                className={`${inputBaseClasses} py-3 ${errors.num_of_edits ? 'border-red-500 ring-red-300' : ''}`}
              >
                <option value={0}>0 revisions</option>
                <option value={1}>1 revision</option>
                <option value={2}>2 revisions</option>
                <option value={3}>3 revisions</option>
                <option value={5}>5 revisions (+10% each extra)</option>
                <option value={10}>10 revisions (+10% each extra)</option>
                <option value={-1}>Unlimited</option>
              </select>
            </div>

            {/* Response Time */}
            <div className="space-y-2 md:col-span-3">
              <label htmlFor="response_time_hours" className={labelClasses}>
                Buyer Response Time (for delivery acceptance)
              </label>
              <select
                id="response_time_hours"
                name="response_time_hours"
                value={gigData.response_time_hours || 24}
                onChange={(e) => onInputChange('response_time_hours', parseInt(e.target.value))}
                className={`${inputBaseClasses} py-3`}
              >
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (1 day)</option>
                <option value={48}>48 hours (2 days)</option>
                <option value={72}>72 hours (3 days)</option>
                <option value={168}>1 week</option>
              </select>
              <p className="text-xs text-gray-600">
                Time allowed for buyer to respond after delivery. If no response, payment will be automatically processed.
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
          <strong>Debug Info:</strong><br/>
          Base Price: {gigData.price} (type: {typeof gigData.price})<br/>
          Delivery Days: {gigData.delivery_days} (type: {typeof gigData.delivery_days})<br/>
          Num of Edits: {gigData.num_of_edits} (type: {typeof gigData.num_of_edits})<br/>
          Calculated Total: {calculateTotalPrice()}
        </div>
        
        {/* Preview Section */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Package Preview</h3>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div>
              <h4 className="font-medium text-slate-800">
                {gigData.gigTitle || 'Your Gig Title'}
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {gigData.num_of_edits === -1 ? 'Unlimited' : gigData.num_of_edits || 3} revision{(gigData.num_of_edits !== 1) ? 's' : ''} • 
                {gigData.delivery_days === 1 ? ' 1 day delivery' : ` ${gigData.delivery_days || 7} days delivery`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                ${calculateTotalPrice().toFixed(2)}
              </div>
              {calculateTotalPrice() > (parseFloat(gigData.price) || 0) && (
                <div className="text-xs text-slate-500">
                  Base: ${(parseFloat(gigData.price) || 0).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          
          {/* Price Breakdown - Always show if there are extra fees */}
          {(() => {
            const totalPrice = calculateTotalPrice();
            const basePrice = parseFloat(gigData.price) || 0;
            const deliveryDays = parseInt(gigData.delivery_days) || 7;
            const numOfEdits = parseInt(gigData.num_of_edits) || 0;
            
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
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Price Breakdown:</h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Delivery surcharge */}
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
                  
                  {/* Revision fee */}
                  {revisionFee > 0 && (
                    <div className="flex justify-between">
                      <span>{numOfEdits - 3} extra revision{numOfEdits - 3 > 1 ? 's' : ''} (+10% each):</span>
                      <span>+${revisionFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between border-t border-blue-300 pt-1 mt-2 font-semibold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                No additional fees applied. Standard delivery (7+ days) and basic revisions (≤3) are included.
              </div>
            );
          })()}
        </div>

        {/* Additional Info */}
        <div className="flex items-start p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
          <svg className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Pricing tip:</span> Fast delivery and extra revisions will automatically increase your total price. Base price starts from $1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCreGigs;
