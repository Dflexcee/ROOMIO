<?php
/**
 * URL Helper - Centralized URL management
 * Prevents hardcoded URLs throughout the application
 */

require_once __DIR__ . '/Config.php';

class UrlHelper {
    /**
     * Get frontend URL with optional path
     */
    public static function getFrontendUrl($path = '') {
        $baseUrl = Config::get('FRONTEND_URL', 'http://localhost:5173');
        return rtrim($baseUrl, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
    
    /**
     * Get upload URL with optional path
     */
    public static function getUploadUrl($path = '') {
        $baseUrl = Config::get('UPLOAD_BASE_URL', 'http://localhost/roomio/php-api/uploads');
        return rtrim($baseUrl, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
    
    /**
     * Get app/API URL with optional path
     */
    public static function getAppUrl($path = '') {
        $baseUrl = Config::get('APP_URL', 'http://localhost/roomio/php-api/public');
        return rtrim($baseUrl, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
    
    /**
     * Convert relative path to absolute URL
     * Handles both upload paths and external URLs
     */
    public static function toAbsoluteUrl($path) {
        if (empty($path)) {
            return '';
        }

        // Already an absolute URL
        if (preg_match('/^https?:\/\//', $path)) {
            return $path;
        }

        // Relative path - convert to absolute
        // Handle both /roomio/php-api/uploads/ (local) and /php-api/uploads/ (production)
        $path = ltrim($path, '/');

        // Remove /roomio/ prefix if present (local development)
        if (str_starts_with($path, 'roomio/')) {
            $path = substr($path, 7); // Remove 'roomio/'
        }

        // Remove /php-api/uploads/ prefix if present
        if (str_starts_with($path, 'php-api/uploads/')) {
            $path = substr($path, 16); // Remove 'php-api/uploads/'
        }

        // Remove uploads/ prefix if present
        if (str_starts_with($path, 'uploads/')) {
            $path = substr($path, 8); // Remove 'uploads/'
        }

        // Now path should be like 'avatars/123.jpg' or 'rooms/456.jpg'
        return self::getUploadUrl('/' . $path);
    }
    
    /**
     * Get CORS headers for API responses
     */
    public static function getCorsHeaders() {
        $origins = Config::getCorsOrigins();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $origins)) {
            return [
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
            ];
        }
        
        // Fallback to first origin in development
        if (count($origins) > 0 && Config::get('APP_ENV') === 'development') {
            return [
                'Access-Control-Allow-Origin' => $origins[0],
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
            ];
        }
        
        return [];
    }
    
    /**
     * Apply CORS headers to response
     */
    public static function applyCorsHeaders() {
        $headers = self::getCorsHeaders();
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
    }

    /**
     * Convert image URLs in an array to absolute URLs
     * Searches for common image field names and converts them
     *
     * @param array $data - Single record or array of records
     * @param array $imageFields - Field names to convert (default: common image fields)
     * @return array - Data with converted URLs
     */
    public static function convertImageUrls($data, $imageFields = null) {
        if (empty($data)) {
            return $data;
        }

        // Default image fields to convert
        if ($imageFields === null) {
            $imageFields = [
                'avatar_url',
                'image_url',
                'profile_picture',
                'id_card_url',
                'id_card_front_url',
                'id_card_back_url',
                'business_license_url',
                'poster_avatar',
                'user_avatar',
                'thumbnail_url'
            ];
        }

        // Check if it's a single record or array of records
        if (isset($data[0]) && is_array($data[0])) {
            // Array of records
            foreach ($data as &$record) {
                $record = self::convertImageUrls($record, $imageFields);
            }
        } else {
            // Single record
            foreach ($imageFields as $field) {
                if (isset($data[$field]) && !empty($data[$field]) && is_string($data[$field])) {
                    $data[$field] = self::toAbsoluteUrl($data[$field]);
                }
            }
        }

        return $data;
    }
}
