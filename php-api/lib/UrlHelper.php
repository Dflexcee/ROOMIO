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
        if (str_starts_with($path, '/roomio/')) {
            return self::getUploadUrl(str_replace('/roomio/php-api/uploads/', '', $path));
        }
        
        if (str_starts_with($path, '/')) {
            return self::getUploadUrl($path);
        }
        
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
}
