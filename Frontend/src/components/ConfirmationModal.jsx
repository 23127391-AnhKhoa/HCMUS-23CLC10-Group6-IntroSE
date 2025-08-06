import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      default:
        return {
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          confirmBtn: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        };
    }
  };

  const styles = getTypeStyles();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center animate-backdrop-in"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-modal-in">
        {/* Modal Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg}`}>
              {type === 'danger' && (
                <svg className={`h-6 w-6 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {type === 'warning' && (
                <svg className={`h-6 w-6 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {type === 'info' && (
                <svg className={`h-6 w-6 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
