import React from 'react';

const typeStyles = {
  info: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    titleText: 'text-blue-700',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
  success: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    titleText: 'text-green-700',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    titleText: 'text-red-700',
    buttonBg: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-700',
    titleText: 'text-yellow-800',
    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
  }
};

export default function AlertModal({ isOpen, title, message, type = 'info', onClose }) {
  if (!isOpen) return null;
  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {/* Simple icon dot */}
                <span className={`h-3 w-3 rounded-full ${styles.iconText}`}></span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className={`text-lg leading-6 font-medium ${styles.titleText}`} id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-line">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${styles.buttonBg}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
