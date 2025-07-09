import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';

// Create a toast container if it doesn't exist
if (typeof document !== 'undefined') {
  if (!document.getElementById('toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    document.body.appendChild(toastContainer);
  }
}

export const toastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

const icons = {
  [toastTypes.SUCCESS]: <CheckCircleOutlined />,
  [toastTypes.ERROR]: <CloseCircleOutlined />,
  [toastTypes.INFO]: <InfoCircleOutlined />,
  [toastTypes.WARNING]: <WarningOutlined />,
};

const bgColors = {
  [toastTypes.SUCCESS]: 'bg-green-100 border-green-400 text-green-700',
  [toastTypes.ERROR]: 'bg-red-100 border-red-400 text-red-700',
  [toastTypes.INFO]: 'bg-blue-100 border-blue-400 text-blue-700',
  [toastTypes.WARNING]: 'bg-yellow-100 border-yellow-400 text-yellow-700',
};

export const Toast = ({ message, type = toastTypes.INFO, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return createPortal(
    <div 
      className={`flex items-center rounded-md border px-4 py-3 mb-4 max-w-sm animate-slide-in ${bgColors[type]}`}
      role="alert"
    >
      <div className="mr-2">{icons[type]}</div>
      <div className="flex-1">{message}</div>
      <button 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>,
    document.getElementById('toast-container')
  );
};

// Toast manager to handle multiple toasts
const toasts = [];
let toastCount = 0;

export const showToast = (message, type, duration) => {
  if (typeof document === 'undefined') return null; // SSR check
  
  const id = toastCount++;
  const toastProps = { id, message, type, duration };
  toasts.push(toastProps);

  // Create a toast element for this notification
  const toastElement = document.createElement('div');
  toastElement.id = `toast-${id}`;
  document.getElementById('toast-container').appendChild(toastElement);

  // Render the Toast component into the element
  const removeToast = () => {
    const element = document.getElementById(`toast-${id}`);
    if (element) {
      element.remove();
    }
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
    }
  };

  // Manually create the Toast element
  const toast = <Toast 
    message={message} 
    type={type} 
    duration={duration} 
    onClose={removeToast}
  />;
  
  // Use ReactDOM to render it
  import('react-dom/client').then(ReactDOMClient => {
    try {
      // React 18 approach
      const container = document.getElementById(`toast-${id}`);
      if (container) {
        const root = ReactDOMClient.createRoot(container);
        root.render(toast);
      }
    } catch (err) {
      console.error('Error rendering toast:', err);
      // Fallback for any errors
      import('react-dom').then(ReactDOM => {
        const container = document.getElementById(`toast-${id}`);
        if (container && typeof ReactDOM.render === 'function') {
          ReactDOM.render(toast, container);
        }
      });
    }
  });

  return id;
};

// Helper functions
export const successToast = (message, duration) => showToast(message, toastTypes.SUCCESS, duration);
export const errorToast = (message, duration) => showToast(message, toastTypes.ERROR, duration);
export const infoToast = (message, duration) => showToast(message, toastTypes.INFO, duration);
export const warningToast = (message, duration) => showToast(message, toastTypes.WARNING, duration);
