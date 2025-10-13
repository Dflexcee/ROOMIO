<?php
require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../config.php";
require_once __DIR__ . "/../../lib/Auth.php";
require_once __DIR__ . "/../../lib/UrlHelper.php";

$user = require_auth($pdo);

$sql = "SELECT id, title, description, location, rent, status, user_id, images, amenities, created_at, updated_at
        FROM rooms WHERE user_id = ?
        ORDER BY created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user["id"]]);
$rows = $stmt->fetchAll();

// Decode JSON columns if present
foreach ($rows as &$row) {
    if (isset($row["images"]) && $row["images"] !== null && $row["images"] !== "") {
        $decoded = json_decode($row["images"], true);
        $row["images"] = $decoded !== null ? $decoded : [];
        // Convert image paths to absolute URLs
        $row["images"] = array_map(function($img) {
            return UrlHelper::toAbsoluteUrl($img);
        }, $row["images"]);
    } else {
        $row["images"] = [];
    }
    if (isset($row["amenities"]) && $row["amenities"] !== null && $row["amenities"] !== "") {
        $decoded = json_decode($row["amenities"], true);
        $row["amenities"] = $decoded !== null ? $decoded : [];
    } else {
        $row["amenities"] = [];
    }
}

json_response(["rooms" => $rows]);
