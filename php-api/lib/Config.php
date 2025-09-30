<?php

class Config {
    private static $config = null;
    
    public static function get($key, $default = null) {
        if (self::$config === null) {
            self::loadConfig();
        }
        
        return self::$config[$key] ?? $default;
    }
    
    public static function loadConfig() {
        self::$config = [];
        
        // Load from .env file if it exists
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            self::loadEnvFile($envFile);
        }
        
        // Load from config.env if it exists
        $configFile = __DIR__ . '/../config.env';
        if (file_exists($configFile)) {
            self::loadEnvFile($configFile);
        }
        
        // Set defaults for required values
        self::$config = array_merge([
            'DB_HOST' => '127.0.0.1',
            'DB_NAME' => 'roomio',
            'DB_USER' => 'ruser',
            'DB_PASS' => 'cord3001',
            'APP_URL' => 'http://localhost/roomio/php-api/public',
            'UPLOAD_BASE_URL' => 'http://localhost/roomio/php-api/uploads',
            'CORS_ORIGINS' => 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176',
            'ADMIN_EMAIL' => 'admin@roomio.com',
            'SUPPORT_EMAIL' => 'support@roomio.com',
            'SUPPORT_PHONE' => '+234 123 456 7890',
            'SESSION_SECURE' => 'false',
            'SESSION_HTTPONLY' => 'false',
            'SESSION_SAMESITE' => 'Lax'
        ], self::$config);
    }
    
    private static function loadEnvFile($file) {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
                list($key, $value) = explode('=', $line, 2);
                self::$config[trim($key)] = trim($value);
            }
        }
    }
    
    public static function getCorsOrigins() {
        $origins = self::get('CORS_ORIGINS', '');
        return array_filter(array_map('trim', explode(',', $origins)));
    }
    
    public static function getUploadUrl($path = '') {
        $baseUrl = self::get('UPLOAD_BASE_URL', 'http://localhost/roomio/php-api/uploads');
        return rtrim($baseUrl, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
    
    public static function getAppUrl($path = '') {
        $baseUrl = self::get('APP_URL', 'http://localhost/roomio/php-api/public');
        return rtrim($baseUrl, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
}

