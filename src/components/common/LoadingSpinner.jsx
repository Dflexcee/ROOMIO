import React from 'react';

/**
 * Reusable Loading Spinner Component
 *
 * @param {string} size - Spinner size: 'sm', 'md', 'lg'
 * @param {string} message - Loading message text
 * @param {boolean} centered - Whether to center the spinner
 * @param {string} className - Additional CSS classes
 */
export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  centered = true,
  className = ''
}) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinnerContent = (
    <>
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]} mx-auto`}></div>
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">{message}</p>
      )}
    </>
  );

  if (centered) {
    return (
      <div className={`text-center py-12 ${className}`}>
        {spinnerContent}
      </div>
    );
  }

  return <div className={className}>{spinnerContent}</div>;
}
