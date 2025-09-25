<?php
require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../config.php";
require_once __DIR__ . "/../../lib/Auth.php";

$user = require_admin($pdo);

// Get user stats
$stmt = $pdo->query("SELECT COUNT(*) as total_users FROM users");
$totalUsers = $stmt->fetch()["total_users"];

$stmt = $pdo->query("SELECT COUNT(*) as verified_users FROM users WHERE role = \"admin\"");
$verifiedUsers = $stmt->fetch()["verified_users"];

$stmt = $pdo->query("SELECT COUNT(*) as new_users FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)");
$newUsers = $stmt->fetch()["new_users"];

// Get room stats
$stmt = $pdo->query("SELECT COUNT(*) as total_rooms FROM rooms");
$totalRooms = $stmt->fetch()["total_rooms"];

$stmt = $pdo->query("SELECT COUNT(*) as flagged_rooms FROM rooms WHERE status = \"flagged\"");
$flaggedRooms = $stmt->fetch()["flagged_rooms"];

$stmt = $pdo->query("SELECT COUNT(*) as pending_rooms FROM rooms WHERE status = \"pending\"");
$pendingRooms = $stmt->fetch()["pending_rooms"];

// Get role breakdown
$stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
$roleStats = $stmt->fetchAll();
$tenants = 0;
$landlords = 0;
$agents = 0;
foreach ($roleStats as $stat) {
    if ($stat["role"] === "user") $tenants = $stat["count"];
    if ($stat["role"] === "admin") $landlords = $stat["count"];
    if ($stat["role"] === "manager") $agents = $stat["count"];
}

$stats = [
    "total_users" => (int)$totalUsers,
    "verified_users" => (int)$verifiedUsers,
    "total_rooms" => (int)$totalRooms,
    "pending_verifications" => (int)$pendingRooms,
    "open_tickets" => 0,
    "flagged_rooms" => (int)$flaggedRooms,
    "new_users" => (int)$newUsers,
    "last_broadcast" => null,
    "tenants" => (int)$tenants,
    "landlords" => (int)$landlords,
    "agents" => (int)$agents,
];

json_response($stats);
