import React from 'react';
import LoadingButton from './LoadingButton';

/**
 * Reusable Confirmation Dialog Component
 *
 * @param {boolean} isOpen - Whether dialog is open
 * @param {function} onClose - Close/cancel handler function
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} variant - Confirm button variant: 'primary', 'danger', 'success'
 * @param {boolean} loading - Whether confirm action is loading
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false
}) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            variant={variant}
            className="flex-1"
          >
            {confirmText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
