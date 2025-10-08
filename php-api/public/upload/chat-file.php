<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    $sender_id = $_POST['sender_id'] ?? null;
    $receiver_id = $_POST['receiver_id'] ?? null;

    if (!$sender_id || !$receiver_id) {
        json_response(['error' => 'Missing sender_id or receiver_id'], 400);
        exit;
    }

    if (!isset($_FILES['file'])) {
        json_response(['error' => 'No file uploaded'], 400);
        exit;
    }

    $file = $_FILES['file'];
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    $maxSize = 10 * 1024 * 1024; // 10MB

    if (!in_array($file['type'], $allowedTypes)) {
        json_response(['error' => 'Invalid file type'], 400);
        exit;
    }

    if ($file['size'] > $maxSize) {
        json_response(['error' => 'File too large. Maximum 10MB'], 400);
        exit;
    }

    $uploadDir = __DIR__ . '/../../../uploads/chat-files/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = uniqid() . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $newFileName;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        json_response(['error' => 'Failed to save file'], 500);
        exit;
    }

    $fileUrl = '/roomio/uploads/chat-files/' . $newFileName;

    json_response([
        'success' => true,
        'file_url' => $fileUrl,
        'file_name' => $file['name'],
        'file_type' => $file['type']
    ]);

} catch (Exception $e) {
    error_log("Chat upload error: " . $e->getMessage());
    json_response(['error' => 'Server error'], 500);
}
?>
