/**
 * URL Helper Utility
 * Centralizes URL handling to prevent hardcoded URLs
 */

import config from '../config/api';

/**
 * Convert relative image path to absolute URL
 * @param {string} path - Image path (can be relative or absolute)
 * @returns {string} - Absolute URL
 */
export const toAbsoluteImageUrl = (path) => {
  if (!path) return '';
  
  // Already an absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Relative path - convert using API base
  const apiBase = config.API_BASE || 'http://localhost/roomio/php-api/public';
  const baseUrl = apiBase.replace('/public', '');
  
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Get upload URL with optional path
 * @param {string} path - Optional path to append
 * @returns {string} - Full upload URL
 */
export const getUploadUrl = (path = '') => {
  const apiBase = config.API_BASE || 'http://localhost/roomio/php-api/public';
  const uploadBase = apiBase.replace('/public', '/uploads');
  return `${uploadBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Get frontend URL with optional path
 * @param {string} path - Optional path to append
 * @returns {string} - Full frontend URL
 */
export const getFrontendUrl = (path = '') => {
  const frontendBase = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  return `${frontendBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Get API URL for an endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => {
  return config.getUrl(endpoint);
};

export default {
  toAbsoluteImageUrl,
  getUploadUrl,
  getFrontendUrl,
  getApiUrl
};
