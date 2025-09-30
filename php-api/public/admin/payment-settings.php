<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'admin') {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get payment settings
    try {
        $stmt = $pdo->query("SELECT * FROM admin_payment_settings ORDER BY feature_name");
        $settings = $stmt->fetchAll();
        
        json_response(['settings' => $settings]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create or update payment setting
    $input = read_json_body();
    
    if (!isset($input['feature_name']) || !isset($input['label'])) {
        json_response(['error' => 'Missing required fields'], 400);
        exit;
    }
    
    try {
        if (isset($input['id']) && $input['id']) {
            // Update existing setting
            $stmt = $pdo->prepare("
                UPDATE admin_payment_settings 
                SET feature_name = ?, feature_label = ?, description = ?, unlock_price = ?, 
                    is_locked = ?, duration_type = ?, duration_value = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([
                $input['feature_name'], $input['feature_label'], $input['description'] ?? '',
                $input['unlock_price'] ?? 0, $input['is_locked'] ?? true,
                $input['duration_type'] ?? 'days', $input['duration_value'] ?? 30,
                $input['id']
            ]);
        } else {
            // Create new setting
            $stmt = $pdo->prepare("
                INSERT INTO admin_payment_settings (feature_name, feature_label, description, unlock_price, is_locked, duration_type, duration_value) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $input['feature_name'], $input['feature_label'], $input['description'] ?? '',
                $input['unlock_price'] ?? 0, $input['is_locked'] ?? true,
                $input['duration_type'] ?? 'days', $input['duration_value'] ?? 30
            ]);
        }
        
        json_response(['success' => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate key error
            json_response(['error' => 'Feature name already exists'], 400);
        } else {
            json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete payment setting
    $input = read_json_body();
    
    if (!isset($input['id'])) {
        json_response(['error' => 'Setting ID required'], 400);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM admin_payment_settings WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
