<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check authentication
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    if (!isset($_FILES['id_image']) || $_FILES['id_image']['error'] !== UPLOAD_ERR_OK) {
        json_response(['error' => 'No file uploaded or upload error'], 400);
        exit;
    }

    $file = $_FILES['id_image'];
    $userId = $_SESSION['user_id'];

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    $fileType = mime_content_type($file['tmp_name']);

    if (!in_array($fileType, $allowedTypes)) {
        json_response(['error' => 'Invalid file type. Only images allowed'], 400);
        exit;
    }

    // Validate file size (5MB max)
    if ($file['size'] > 5 * 1024 * 1024) {
        json_response(['error' => 'File too large. Maximum 5MB'], 400);
        exit;
    }

    // Create upload directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/id-cards/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'id_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $imageUrl = '/roomio/php-api/uploads/id-cards/' . $filename;

        json_response([
            'success' => true,
            'image_url' => $imageUrl,
            'message' => 'ID card uploaded successfully'
        ]);
    } else {
        json_response(['error' => 'Failed to save file'], 500);
    }

} catch (Exception $e) {
    error_log("ID Upload Error: " . $e->getMessage());
    json_response(['error' => 'Upload failed: ' . $e->getMessage()], 500);
}
?>
