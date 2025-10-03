<?php
/**
 * Create Room - Handles both FormData and JSON
 */
require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../config.php";
require_once __DIR__ . "/../../lib/Auth.php";

$user = require_auth($pdo);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    // Admins bypass all checks
    $isAdmin = in_array($user['role'] ?? '', ['admin', 'manager']);

    if (!$isAdmin) {
        // Read app settings for verification requirements
        $requirePosting = 1;
        $requireRooms = 0;
        try {
            $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE category = 'app' AND setting_key IN ('require_verification_posting','require_verification_rooms')");
            $stmt->execute();
            $kv = [];
            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) { $kv[$row['setting_key']] = (int)$row['setting_value']; }
            $requirePosting = $kv['require_verification_posting'] ?? 1;
            $requireRooms = $kv['require_verification_rooms'] ?? 0;
        } catch (Throwable $e) { /* defaults */ }
        // Check posting access FIRST (before verification)
        if (isset($user['can_post_rooms']) && $user['can_post_rooms'] == 0) {
            json_response([
                'error' => 'You do not have permission to post rooms',
                'reason' => $user['posting_suspended_reason'] ?? 'Permission denied',
                'status_code' => 'POSTING_RESTRICTED'
            ], 403);
            exit;
        }

        // Check verification status if required
        $hasPerType = (int)($user['verified_for_rooms'] ?? 0) === 1;
        $isGloballyVerified = isset($user['verification_status']) && in_array($user['verification_status'], ['verified', 'approved']);
        if (($requirePosting || $requireRooms) && !($isGloballyVerified || $hasPerType)) {
            json_response([
                'error' => 'You must be verified to post rooms',
                'verification_status' => $user['verification_status'] ?? 'unverified',
                'verified_for_rooms' => (bool)($user['verified_for_rooms'] ?? 0),
                'status_code' => 'VERIFICATION_REQUIRED'
            ], 403);
            exit;
        }
    }

    // Handle both FormData and JSON
    $isFormData = !empty($_FILES);

    if ($isFormData) {
        // Get form fields from $_POST
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $location = trim($_POST['location'] ?? '');
        $rent = floatval($_POST['rent'] ?? 0);
        $gender_preference = $_POST['gender_preference'] ?? 'any';
        $role = $_POST['role'] ?? '';
        $conditions = $_POST['conditions'] ?? '';
        $amenities = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];

        // Upload images if present
        $imageUrls = [];
        if (!empty($_FILES['images'])) {
            $uploadDir = __DIR__ . '/../../uploads/room-images/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $files = $_FILES['images'];
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;

            for ($i = 0; $i < $fileCount; $i++) {
                $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $fileTmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $fileError = is_array($files['error']) ? $files['error'][$i] : $files['error'];
                $fileSize = is_array($files['size']) ? $files['size'][$i] : $files['size'];

                if ($fileError === UPLOAD_ERR_OK) {
                    // Validate file
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mimeType = finfo_file($finfo, $fileTmpName);
                    finfo_close($finfo);

                    if (!in_array($mimeType, $allowedTypes)) {
                        continue;
                    }

                    if ($fileSize > 5 * 1024 * 1024) { // 5MB max
                        continue;
                    }

                    // Generate unique filename
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $newFileName = 'room_' . $user['id'] . '_' . time() . '_' . uniqid() . '.' . $extension;
                    $filePath = $uploadDir . $newFileName;

                    if (move_uploaded_file($fileTmpName, $filePath)) {
                        $imageUrls[] = 'http://localhost/roomio/php-api/uploads/room-images/' . $newFileName;
                    }
                }
            }
        }
    } else {
        // Get JSON data
        $body = read_json_body();
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $location = trim($body['location'] ?? '');
        $rent = floatval($body['rent'] ?? 0);
        $gender_preference = $body['gender_preference'] ?? 'any';
        $role = $body['role'] ?? '';
        $conditions = $body['conditions'] ?? '';
        $imageUrls = $body['images'] ?? [];
        $amenities = $body['amenities'] ?? [];
    }

    // Validate required fields
    if (empty($title) || empty($location) || $rent <= 0) {
        json_response(['error' => 'Title, location, and rent are required'], 400);
        exit;
    }

    if (empty($gender_preference)) {
        json_response(['error' => 'Gender preference is required'], 400);
        exit;
    }

    if (empty($role)) {
        json_response(['error' => 'Role is required'], 400);
        exit;
    }

    // Insert into database
    $stmt = $pdo->prepare("
        INSERT INTO rooms (
            user_id, title, description, location, rent,
            gender_preference, role, conditions, images, amenities,
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $user['id'],
        $title,
        $description,
        $location,
        $rent,
        $gender_preference,
        $role,
        $conditions,
        json_encode($imageUrls),
        json_encode($amenities)
    ]);

    $roomId = $pdo->lastInsertId();

    // Fetch the created room
    $stmt = $pdo->prepare("
        SELECT r.*, u.full_name as poster_name, u.email as poster_email, u.avatar_url as poster_avatar
        FROM rooms r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($room) {
        $room['images'] = json_decode($room['images'], true) ?: [];
        $room['amenities'] = json_decode($room['amenities'], true) ?: [];
    }

    // Log action
    $logStmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'room_created', ?, ?, NOW())
    ");
    $logStmt->execute([
        $user['id'],
        json_encode(['room_id' => $roomId, 'title' => $title]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response([
        'success' => true,
        'room' => $room,
        'message' => 'Room posted successfully and is pending approval'
    ]);

} catch (PDOException $e) {
    error_log('Room creation error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
