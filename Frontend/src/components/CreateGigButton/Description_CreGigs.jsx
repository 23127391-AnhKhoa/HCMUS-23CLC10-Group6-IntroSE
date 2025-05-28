// src/components/CreateGigButton/Description_CreGigs.jsx
import React from 'react';

const DescriptionCreGigs = ({ gigData, onInputChange }) => {
  // eslint-disable-next-line no-unused-vars
  const handleLocalInputChange = (e) => {
    // Ví dụ: onInputChange(e.target.name, e.target.value);
    // Bạn sẽ thêm logic xử lý input cụ thể cho phần description & FAQ ở đây
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 md:p-10">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        Description & FAQ
      </h2>
      <div className="text-center py-10 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <p className="text-xl font-medium text-indigo-600 dark:text-indigo-400">
          Description & FAQ Section is now active!
        </p>
        <p className="text-md text-slate-700 dark:text-slate-300 mt-2">
          This is where you will provide a detailed description of your gig and add frequently asked questions.
        </p>
        {/* Hiển thị một phần dữ liệu từ gigData để kiểm tra */}
        {gigData.gigTitle && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            (Data from previous steps: Gig Title - "{gigData.gigTitle}")
          </p>
        )}
      </div>
      {/* 
        Các trường input và logic cụ thể cho phần description & FAQ sẽ được thêm vào đây.
        Ví dụ:
        <div className="mt-6">
          <label htmlFor="gigDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gig Description</label>
          <textarea
            id="gigDescription"
            name="gigDescription" // Sẽ được thêm vào gigData
            rows={6}
            value={gigData.gigDescription || ''}
            onChange={handleLocalInputChange}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="Describe what you are offering..."
          />
        </div>
      */}
      <div className="mt-6 p-4 border border-dashed border-blue-300 dark:border-blue-700 rounded-md bg-blue-50 dark:bg-blue-900/30">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Placeholder:</strong> Rich text editor for description and FAQ management will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default DescriptionCreGigs;