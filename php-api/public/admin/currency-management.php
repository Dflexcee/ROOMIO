<?php
// Currency Management API
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Allow both development ports
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5174');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all currencies
        $stmt = $pdo->query("
            SELECT 
                id, currency_code, currency_name, currency_symbol, 
                is_active, is_default, created_at, updated_at
            FROM currency_settings 
            ORDER BY is_default DESC, currency_name ASC
        ");
        $currencies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get current system currency setting
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'default_currency'");
        $stmt->execute();
        $currentCurrency = $stmt->fetchColumn() ?: 'NGN';
        
        // Get currency display format
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'currency_display_format'");
        $stmt->execute();
        $displayFormat = $stmt->fetchColumn() ?: 'symbol_amount';
        
        echo json_encode([
            'success' => true,
            'currencies' => $currencies,
            'current_currency' => $currentCurrency,
            'display_format' => $displayFormat
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'];
        
        if ($action === 'set_default_currency') {
            $currencyCode = $input['currency_code'];
            
            // Update system settings
            $stmt = $pdo->prepare("
                INSERT INTO system_settings (setting_key, setting_value, description) 
                VALUES ('default_currency', ?, 'Default currency for the application')
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP
            ");
            $stmt->execute([$currencyCode]);
            
            // Remove default flag from all currencies
            $stmt = $pdo->prepare("UPDATE currency_settings SET is_default = FALSE");
            $stmt->execute();
            
            // Set new default currency
            $stmt = $pdo->prepare("UPDATE currency_settings SET is_default = TRUE WHERE currency_code = ?");
            $stmt->execute([$currencyCode]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Default currency updated successfully',
                'currency_code' => $currencyCode
            ]);
            
        } else if ($action === 'set_display_format') {
            $format = $input['display_format'];
            
            $stmt = $pdo->prepare("
                INSERT INTO system_settings (setting_key, setting_value, description) 
                VALUES ('currency_display_format', ?, 'How to display currency')
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP
            ");
            $stmt->execute([$format]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Display format updated successfully',
                'display_format' => $format
            ]);
            
        } else if ($action === 'toggle_currency') {
            $currencyId = (int)$input['currency_id'];
            $isActive = (bool)$input['is_active'];
            
            $stmt = $pdo->prepare("UPDATE currency_settings SET is_active = ? WHERE id = ?");
            $stmt->execute([$isActive, $currencyId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Currency status updated successfully'
            ]);
        }
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'];
        
        if ($action === 'add_currency') {
            $currencyCode = strtoupper(trim($input['currency_code']));
            $currencyName = trim($input['currency_name']);
            $currencySymbol = trim($input['currency_symbol']);
            
            $stmt = $pdo->prepare("
                INSERT INTO currency_settings (currency_code, currency_name, currency_symbol, is_active) 
                VALUES (?, ?, ?, TRUE)
            ");
            $stmt->execute([$currencyCode, $currencyName, $currencySymbol]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Currency added successfully'
            ]);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
