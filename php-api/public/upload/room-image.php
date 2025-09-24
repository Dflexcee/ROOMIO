<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['image'];
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
$uploadDir = '../../uploads/room-images/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'room_' . $userId . '_' . time() . '_' . uniqid() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    json_response(['error' => 'Failed to save file'], 500);
}

// Generate public URL
$publicUrl = 'http://localhost/roomio/php-api/uploads/room-images/' . $filename;

json_response([
    'success' => true,
    'image_url' => $publicUrl
]);
?>
