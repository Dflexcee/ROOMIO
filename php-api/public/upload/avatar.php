<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['avatar'];
$userId = $_SESSION['user_id'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    json_response(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'], 400);
}

// Validate file size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    json_response(['error' => 'File too large. Maximum size is 5MB'], 400);
}

// Create uploads directory if it doesn't exist
$uploadDir = '../../uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    json_response(['error' => 'Failed to save file'], 500);
}

// Generate public URL
$publicUrl = 'http://localhost/roomio/php-api/uploads/avatars/' . $filename;

// Update user's avatar_url in database
try {
    $stmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
    $stmt->execute([$publicUrl, $userId]);
    
    json_response([
        'success' => true,
        'avatar_url' => $publicUrl
    ]);
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>