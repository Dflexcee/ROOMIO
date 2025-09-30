<?php
require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../config.php";
require_once __DIR__ . "/../../lib/Auth.php";

$user = require_auth($pdo);

$body = read_json_body();
$title = isset($body["title"]) ? trim($body["title"]) : "";
$description = isset($body["description"]) ? trim($body["description"]) : "";
$location = isset($body["location"]) ? trim($body["location"]) : "";
$rent = isset($body["rent"]) ? floatval($body["rent"]) : 0;
$images = isset($body["images"]) && is_array($body["images"]) ? $body["images"] : [];
$amenities = isset($body["amenities"]) && is_array($body["amenities"]) ? $body["amenities"] : [];
$status = isset($body["status"]) ? $body["status"] : "pending";

if ($title === "" || $location === "" || $rent <= 0) {
    json_response(["error" => "Title, location, and rent are required"], 400);
    exit;
}

try {
    // Check what columns exist in rooms table
    $stmt = $pdo->query("SHOW COLUMNS FROM rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Build dynamic INSERT query based on existing columns
    $insertFields = [];
    $values = [];
    $placeholders = [];
    
    // Core required fields
    if (in_array('title', $columns)) {
        $insertFields[] = 'title';
        $values[] = $title;
        $placeholders[] = '?';
    }
    
    if (in_array('description', $columns)) {
        $insertFields[] = 'description';
        $values[] = $description;
        $placeholders[] = '?';
    }
    
    if (in_array('location', $columns)) {
        $insertFields[] = 'location';
        $values[] = $location;
        $placeholders[] = '?';
    }
    
    if (in_array('rent', $columns)) {
        $insertFields[] = 'rent';
        $values[] = $rent;
        $placeholders[] = '?';
    }
    
    if (in_array('user_id', $columns)) {
        $insertFields[] = 'user_id';
        $values[] = $user["id"];
        $placeholders[] = '?';
    }
    
    // Optional fields
    if (in_array('images', $columns)) {
        $insertFields[] = 'images';
        $values[] = json_encode($images);
        $placeholders[] = '?';
    }
    
    if (in_array('amenities', $columns)) {
        $insertFields[] = 'amenities';
        $values[] = json_encode($amenities);
        $placeholders[] = '?';
    }
    
    if (in_array('status', $columns)) {
        $insertFields[] = 'status';
        $values[] = $status;
        $placeholders[] = '?';
    }
    
    // Add created_at if it exists (using posted_at as fallback)
    if (in_array('created_at', $columns)) {
        $insertFields[] = 'created_at';
        $values[] = date('Y-m-d H:i:s');
        $placeholders[] = '?';
    } elseif (in_array('posted_at', $columns)) {
        $insertFields[] = 'posted_at';
        $values[] = date('Y-m-d H:i:s');
        $placeholders[] = '?';
    }
    
    if (empty($insertFields)) {
        json_response(["error" => "No valid database columns found"], 500);
        exit;
    }
    
    $sql = "INSERT INTO rooms (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $roomId = $pdo->lastInsertId();
    
    // Fetch the created room with dynamic columns
    $selectFields = ['id'];
    foreach (['title', 'description', 'location', 'rent', 'status', 'user_id', 'images', 'amenities', 'created_at', 'posted_at', 'updated_at'] as $field) {
        if (in_array($field, $columns)) {
            $selectFields[] = $field;
        }
    }
    
    $sql = "SELECT " . implode(', ', $selectFields) . " FROM rooms WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    
    if ($room) {
        // Decode JSON columns if present
        if (isset($room["images"]) && $room["images"]) {
            $room["images"] = json_decode($room["images"], true) ?: [];
        } else {
            $room["images"] = [];
        }
        
        if (isset($room["amenities"]) && $room["amenities"]) {
            $room["amenities"] = json_decode($room["amenities"], true) ?: [];
        } else {
            $room["amenities"] = [];
        }
        
        // Use posted_at as created_at if needed
        if (!isset($room["created_at"]) && isset($room["posted_at"])) {
            $room["created_at"] = $room["posted_at"];
        }
    }
    
    json_response([
        "success" => true,
        "room" => $room,
        "message" => "Room created successfully",
        "available_columns" => $columns
    ]);
    
} catch (Exception $e) {
    error_log("Room creation error: " . $e->getMessage());
    json_response(["error" => "Database error: " . $e->getMessage()], 500);
}
?>
