<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$userId = $_SESSION['user_id'];

// Pagination parameters for scalability
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50; // Default 50 messages per page
$offset = ($page - 1) * $limit;

// Optional conversation filter (get messages with specific user)
$otherUserId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

try {
    // Check which columns exist in messages table
    $stmt = $pdo->query("SHOW COLUMNS FROM messages");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Build SELECT query based on existing columns
    $selectFields = ['m.id', 'm.sender_id', 'm.receiver_id', 'm.content', 'm.is_read', 'm.created_at'];

    if (in_array('file_name', $columns)) {
        $selectFields[] = 'm.file_name';
    }
    if (in_array('file_type', $columns)) {
        $selectFields[] = 'm.file_type';
    }
    if (in_array('file_url', $columns)) {
        $selectFields[] = 'm.file_url';
    }

    $selectFields[] = 's.full_name as sender_name';
    $selectFields[] = 's.avatar_url as sender_avatar';
    $selectFields[] = 'r.full_name as receiver_name';
    $selectFields[] = 'r.avatar_url as receiver_avatar';

    $selectStr = implode(', ', $selectFields);

    // Build WHERE clause for message filtering
    $whereConditions = [];
    $params = [];

    // Filter by conversation with specific user if requested
    if ($otherUserId) {
        $whereConditions[] = "((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))";
        $params = [$userId, $otherUserId, $otherUserId, $userId];
    } else {
        $whereConditions[] = "(m.sender_id = ? OR m.receiver_id = ?)";
        $params = [$userId, $userId];
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Get total count for pagination metadata
    $countSql = "SELECT COUNT(*) as total FROM messages m WHERE {$whereClause}";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalRecords = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPages = ceil($totalRecords / $limit);

    // Get paginated messages for this user (both sent and received)
    $sql = "
        SELECT $selectStr
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        WHERE {$whereClause}
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'messages' => $messages,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_records' => $totalRecords,
            'total_pages' => $totalPages,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ]);

} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
