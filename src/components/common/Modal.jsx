import React, { useEffect } from 'react';

/**
 * Reusable Modal Component
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close handler function
 * @param {string} title - Modal title
 * @param {node} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} showCloseButton - Whether to show X close button
 * @param {string} className - Additional CSS classes for modal content
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  className = ''
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden flex flex-col ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            {title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
