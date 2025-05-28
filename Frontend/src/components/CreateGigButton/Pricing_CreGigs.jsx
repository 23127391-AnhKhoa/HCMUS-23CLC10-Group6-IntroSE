// src/components/CreateGigButton/Pricing_CreGigs.jsx
import React from 'react';

const PricingCreGigs = ({ gigData, onInputChange }) => {
  // eslint-disable-next-line no-unused-vars
  const handleLocalInputChange = (e) => {
    // Ví dụ: onInputChange(e.target.name, e.target.value);
    // Bạn sẽ thêm logic xử lý input cụ thể cho phần pricing ở đây
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-10">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-4">
        Scope & Pricing
      </h2>
      <div className="text-center py-10 bg-slate-50 rounded-lg">
        <p className="text-xl font-medium text-indigo-600">
          Pricing Section is now active!
        </p>
        <p className="text-md text-slate-700 mt-2">
          This is where you will define your gig's pricing, packages, and any add-ons.
        </p>
        {/* Hiển thị một phần dữ liệu từ gigData để kiểm tra */}
        {gigData.gigTitle && (
          <p className="mt-4 text-sm text-slate-500">
            (Data from Overview: Gig Title - "{gigData.gigTitle}")
          </p>
        )}
      </div>
      {/* 
        Các trường input và logic cụ thể cho phần pricing sẽ được thêm vào đây.
        Ví dụ:
        <div className="mt-6">
          <label htmlFor="basicPrice" className="block text-sm font-medium text-slate-700 mb-1">Basic Package Price</label>
          <input
            type="number"
            name="basicPrice" // Sẽ được thêm vào gigData
            id="basicPrice"
            value={gigData.basicPrice || ''}
            onChange={handleLocalInputChange}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 50"
          />
        </div>
      */}
      <div className="mt-6 p-4 border border-dashed border-blue-300 rounded-md bg-blue-50">
        <p className="text-sm text-blue-700">
          <strong>Placeholder:</strong> Detailed pricing fields and package options will be implemented here based on your next set of requirements.
        </p>
      </div>
    </div>
  );
};

export default PricingCreGigs;