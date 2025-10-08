import React from 'react';

/**
 * Reusable Form Select Component
 *
 * @param {string} label - Select label text
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler function
 * @param {array} options - Array of {value, label} objects
 * @param {string} placeholder - Placeholder option text
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes
 * @param {object} ...props - Additional select props
 */
export default function FormSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
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
      <select
        value={value}
        onChange={onChange}
        className={`w-full p-3 border ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600'
        } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
