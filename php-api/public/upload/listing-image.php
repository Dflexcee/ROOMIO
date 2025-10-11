<?php
/**
 * Upload listing images
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';
require_once '../../lib/UrlHelper.php';

// Require authentication
$user = require_auth($pdo);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        json_response(['error' => 'No image uploaded or upload error'], 400);
        exit;
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    // Validate file type
    if (!in_array($file['type'], $allowedTypes)) {
        json_response(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP allowed'], 400);
        exit;
    }

    // Validate file size
    if ($file['size'] > $maxSize) {
        json_response(['error' => 'File too large. Maximum size is 5MB'], 400);
        exit;
    }

    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/listing-images/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'listing_' . $user['id'] . '_' . time() . '_' . uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        json_response(['error' => 'Failed to save image'], 500);
        exit;
    }

    // Return URL
    $imageUrl = UrlHelper::getUploadUrl('/listing-images/' . $filename);

    json_response([
        'success' => true,
        'image_url' => $imageUrl,
        'filename' => $filename
    ]);

} catch (Exception $e) {
    error_log("Image upload error: " . $e->getMessage());
    json_response(['error' => 'Upload failed: ' . $e->getMessage()], 500);
}
?>