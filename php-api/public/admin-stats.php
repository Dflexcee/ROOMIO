<?php
require_once __DIR__ . "/../bootstrap.php";
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/../lib/Auth.php";

$user = require_admin($pdo);

$stats = [
    "total_users" => 1,
    "verified_users" => 1,
    "total_rooms" => 0,
    "pending_verifications" => 0,
    "open_tickets" => 0,
    "flagged_rooms" => 0,
    "new_users" => 0,
    "last_broadcast" => null,
    "tenants" => 0,
    "landlords" => 1,
    "agents" => 0,
];

json_response($stats);
