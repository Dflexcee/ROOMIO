<?php
require_once '../config.php';
require_once '../bootstrap.php';

header('Content-Type: application/json');

try {
    // Check if required columns exist
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $requiredColumns = [
        'can_post_rooms',
        'can_post_listings',
        'posting_suspended_reason',
        'verification_status'
    ];

    $missing = [];
    foreach ($requiredColumns as $col) {
        if (!in_array($col, $columns)) {
            $missing[] = $col;
        }
    }

    json_response([
        'success' => true,
        'all_columns' => $columns,
        'missing_columns' => $missing,
        'has_all_required' => empty($missing)
    ]);
} catch (PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>
