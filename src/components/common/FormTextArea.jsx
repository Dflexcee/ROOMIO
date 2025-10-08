import React from 'react';

/**
 * Reusable Form TextArea Component
 *
 * @param {string} label - Textarea label text
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {number} rows - Number of rows
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes
 * @param {object} ...props - Additional textarea props
 */
export default function FormTextArea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  rows = 4,
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full p-3 border ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600'
        } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y`}
        placeholder={placeholder}
        required={required}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
