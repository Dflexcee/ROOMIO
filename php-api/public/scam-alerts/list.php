<?php
require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../config.php";

$sql = "SELECT sa.*, u.email as reporter_email 
        FROM scam_alerts sa 
        LEFT JOIN users u ON sa.reported_by = u.id 
        ORDER BY sa.created_at DESC 
        LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$alerts = $stmt->fetchAll();

json_response(['alerts' => $alerts]);
