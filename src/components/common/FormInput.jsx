import React from 'react';

/**
 * Reusable Form Input Component
 *
 * @param {string} label - Input label text
 * @param {string} type - Input type (text, email, number, tel, password, etc.)
 * @param {string} value - Input value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes
 * @param {object} ...props - Additional input props
 */
export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
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
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600'
        } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        placeholder={placeholder}
        required={required}
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
