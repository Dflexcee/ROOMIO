<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['file'];
$userId = $_SESSION['user_id'];

// Validate file size (max 10MB for chat files)
if ($file['size'] > 10 * 1024 * 1024) {
    json_response(['error' => 'File too large. Maximum size is 10MB'], 400);
}

// Create uploads directory if it doesn't exist
$uploadDir = '../../uploads/chat-files/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'chat_' . $userId . '_' . time() . '_' . uniqid() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    json_response(['error' => 'Failed to save file'], 500);
}

// Generate public URL
$publicUrl = Config::getUploadUrl('chat-files/' . $filename);

json_response([
    'success' => true,
    'file_url' => $publicUrl
]);
?>
