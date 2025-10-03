<?php
// Clean users API - from scratch
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Allow both development ports
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174'];
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
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get users with their status and additional fields
        $stmt = $pdo->query("
            SELECT
                u.id,
                u.email,
                u.full_name,
                u.role,
                u.status,
                u.is_verified,
                u.email_confirmed,
                u.university,
                u.department,
                u.phone,
                u.age,
                u.gender,
                u.about_me,
                u.avatar_url,
                u.status_reason,
                u.status_changed_at,
                u.status_changed_by,
                u.verification_status,
                u.account_type,
                u.created_at,
                u.can_post_rooms,
                u.can_post_listings,
                u.verified_for_rooms,
                u.verified_for_listings
            FROM users u
            ORDER BY u.created_at DESC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $cleanedUsers = [];
        foreach ($users as $user) {
            $cleanedUsers[] = [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'] ?: 'No Name',
                'phone' => $user['phone'] ?: '',
                'role' => $user['role'] ?: 'user',
                'status' => $user['status'] ?: 'active',
                'is_verified' => (int)$user['is_verified'],
                'email_confirmed' => (int)$user['email_confirmed'],
                'university' => $user['university'] ?: '',
                'department' => $user['department'] ?: '',
                'age' => $user['age'] ? (int)$user['age'] : null,
                'gender' => $user['gender'] ?: null,
                'about_me' => $user['about_me'] ?: '',
                'avatar_url' => $user['avatar_url'] ?: '',
                'status_reason' => $user['status_reason'] ?: '',
                'status_changed_at' => $user['status_changed_at'] ?: null,
                'status_changed_by' => $user['status_changed_by'] ? (int)$user['status_changed_by'] : null,
                'verification_status' => $user['verification_status'] ?: 'unverified',
                'account_type' => $user['account_type'] ?: 'individual',
                'created_at' => $user['created_at'],
                'can_post_rooms' => isset($user['can_post_rooms']) ? (int)$user['can_post_rooms'] : null,
                'can_post_listings' => isset($user['can_post_listings']) ? (int)$user['can_post_listings'] : null,
                'verified_for_rooms' => isset($user['verified_for_rooms']) ? (int)$user['verified_for_rooms'] : 0,
                'verified_for_listings' => isset($user['verified_for_listings']) ? (int)$user['verified_for_listings'] : 0
            ];
        }
        
        echo json_encode([
            'success' => true,
            'users' => $cleanedUsers
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = (int)$input['user_id'];
        $action = $input['action'];
        $reason = isset($input['reason']) ? trim($input['reason']) : '';
        $admin_id = isset($input['admin_id']) ? (int)$input['admin_id'] : 1; // Default admin ID
        
        // Handle different actions
        if ($action === 'verify') {
            $stmt = $pdo->prepare("UPDATE users SET is_verified = 1, verification_status = 'verified', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'reject') {
            $stmt = $pdo->prepare("UPDATE users SET is_verified = 0, verification_status = 'rejected', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'activate') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'active', verification_status = 'verified', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'suspend') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'suspended', verification_status = 'suspended', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'ban') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'banned', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'deactivate') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'inactive', status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $user_id]);
        } else if ($action === 'check_online') {
            // Check if user is online (simplified - you can enhance this)
            $stmt = $pdo->prepare("SELECT last_login FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $isOnline = $user && $user['last_login'] && strtotime($user['last_login']) > (time() - 300); // 5 minutes
            echo json_encode([
                'success' => true,
                'message' => $isOnline ? "User is online" : "User is offline",
                'is_online' => $isOnline,
                'user_id' => $user_id,
                'action' => $action
            ]);
            exit;
        } else if ($action === 'update_profile') {
            $field = $input['field'];
            
            if ($field === 'bulk_update') {
                // Handle bulk update of profile data
                $profile_data = $input['profile_data'];
                
                // Update multiple fields at once
                $updateFields = [];
                $values = [];
                
                $allowedFields = [
                    'full_name', 'email', 'phone', 'age', 'gender', 'university', 
                    'department', 'about_me', 'avatar_url', 'role', 'status', 
                    'is_verified', 'email_confirmed'
                ];
                
                foreach ($allowedFields as $allowedField) {
                    if (isset($profile_data[$allowedField])) {
                        $updateFields[] = "$allowedField = ?";
                        $values[] = $profile_data[$allowedField];
                    }
                }
                
                if (!empty($updateFields)) {
                    $values[] = $user_id; // Add user_id for WHERE clause
                    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($values);
                }
            } else {
                // Handle single field update (legacy support)
                $value = $input['value'];
                $stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE id = ?");
                $stmt->execute([$value, $user_id]);
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => "User $action successful",
            'user_id' => $user_id,
            'action' => $action
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
