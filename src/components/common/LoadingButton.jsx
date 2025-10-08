import React from 'react';

/**
 * Reusable Button with Loading State
 *
 * @param {boolean} loading - Whether button is in loading state
 * @param {string} children - Button text/content
 * @param {string} loadingText - Text to show when loading
 * @param {string} variant - Button variant: 'primary', 'secondary', 'danger', 'success'
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} className - Additional CSS classes
 * @param {object} ...props - Additional button props
 */
export default function LoadingButton({
  loading = false,
  children,
  loadingText = 'Loading...',
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      disabled={loading || disabled}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
