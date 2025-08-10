import React, { useState, useEffect } from 'react';

export default function InputModal({
  isOpen,
  title = 'Input',
  message = '',
  placeholder = '',
  defaultValue = '',
  confirmText = 'Submit',
  cancelText = 'Cancel',
  type = 'info',
  onClose,
  onSubmit,
}) {
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    if (isOpen) setValue(defaultValue || '');
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const typeStyles = {
    info: 'text-blue-700 bg-blue-100',
    success: 'text-green-700 bg-green-100',
    warning: 'text-yellow-800 bg-yellow-100',
    error: 'text-red-700 bg-red-100',
  }[type] || 'text-blue-700 bg-blue-100';

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleBackdrop}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {message ? (
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{message}</p>
            ) : null}
          </div>

          <div className={`rounded-md p-0`}>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[96px]"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => onSubmit?.(value)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
