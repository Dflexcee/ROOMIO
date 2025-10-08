import React from 'react';

/**
 * Reusable Alert Component
 *
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {string} message - Alert message
 * @param {function} onClose - Optional close handler
 * @param {string} className - Additional CSS classes
 */
export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300',
    info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`border px-4 py-3 rounded-lg mb-4 flex items-start gap-3 ${styles[type]} ${className}`}>
      <span className="text-xl font-bold flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-xl font-bold hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
