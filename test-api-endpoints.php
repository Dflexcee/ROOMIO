<?php
/**
 * API Endpoint Tester
 * Tests all the fixed endpoints to verify they work
 */

// Test configuration
$baseUrl = 'http://localhost';
$apiBase = '/roomio/php-api/public';

// Test results
$results = [];

function testEndpoint($name, $url, $method = 'GET', $data = null, $requiresAuth = false) {
    global $results;

    $ch = curl_init();
    $fullUrl = $url;

    curl_setopt($ch, CURLOPT_URL, $fullUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);

    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    if ($requiresAuth) {
        // For testing, we'd need to handle session cookies
        curl_setopt($ch, CURLOPT_COOKIEFILE, '');
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    $success = ($httpCode >= 200 && $httpCode < 300);
    $responseData = json_decode($response, true);

    $results[] = [
        'name' => $name,
        'url' => $fullUrl,
        'method' => $method,
        'http_code' => $httpCode,
        'success' => $success,
        'error' => $error,
        'response' => $responseData
    ];

    return $success;
}

echo "<h1>Roomio API Endpoint Tests</h1>";
echo "<style>
    body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
    h1 { color: #0ff; }
    .success { color: #0f0; }
    .error { color: #f00; }
    .test { margin: 10px 0; padding: 10px; border: 1px solid #333; background: #000; }
    .test-name { font-weight: bold; color: #ff0; }
    .details { margin-left: 20px; font-size: 12px; }
</style>";

// Test 1: Rooms List (public endpoint)
testEndpoint(
    'Get Rooms List',
    "http://localhost/roomio/php-api/public/rooms/list.php",
    'GET'
);

// Test 2: Users List
testEndpoint(
    'Get Users List (requires auth)',
    "http://localhost/roomio/php-api/public/users/list.php",
    'GET',
    null,
    true
);

// Test 3: Check if posting access endpoint exists
testEndpoint(
    'Admin Posting Access Endpoint',
    "http://localhost/roomio/php-api/public/admin/posting-access.php",
    'GET',
    null,
    true
);

// Test 4: Check rooms management endpoint
testEndpoint(
    'Admin Rooms Management Endpoint',
    "http://localhost/roomio/php-api/public/admin/rooms-management.php",
    'GET',
    null,
    true
);

// Test 5: Check SMTP settings endpoint
testEndpoint(
    'Admin SMTP Settings Endpoint',
    "http://localhost/roomio/php-api/public/admin/smtp-settings.php",
    'GET',
    null,
    true
);

// Test 6: Check ads management endpoint
testEndpoint(
    'Admin Ads Management Endpoint',
    "http://localhost/roomio/php-api/public/admin/ads-management.php",
    'GET',
    null,
    true
);

// Display results
echo "<h2>Test Results</h2>";
$passCount = 0;
$failCount = 0;

foreach ($results as $result) {
    $statusClass = $result['success'] ? 'success' : 'error';
    $statusText = $result['success'] ? '✓ PASS' : '✗ FAIL';

    if ($result['success']) $passCount++;
    else $failCount++;

    echo "<div class='test'>";
    echo "<div class='test-name'>{$statusText} - {$result['name']}</div>";
    echo "<div class='details'>";
    echo "URL: {$result['url']}<br>";
    echo "Method: {$result['method']}<br>";
    echo "HTTP Code: <span class='{$statusClass}'>{$result['http_code']}</span><br>";

    if ($result['error']) {
        echo "Error: <span class='error'>{$result['error']}</span><br>";
    }

    if ($result['response']) {
        if (isset($result['response']['error'])) {
            echo "API Error: <span class='error'>{$result['response']['error']}</span><br>";
        }
        if (isset($result['response']['rooms'])) {
            echo "Rooms Count: " . count($result['response']['rooms']) . "<br>";
        }
        if (isset($result['response']['users'])) {
            echo "Users Count: " . count($result['response']['users']) . "<br>";
        }
    }

    echo "</div>";
    echo "</div>";
}

echo "<div class='test'>";
echo "<h3>Summary</h3>";
echo "<div class='success'>Passed: {$passCount}</div>";
echo "<div class='error'>Failed: {$failCount}</div>";
echo "</div>";

// File existence checks
echo "<h2>File Existence Checks</h2>";

$filesToCheck = [
    'php-api/public/rooms/create.php' => 'Room Creation Endpoint',
    'php-api/public/rooms/list.php' => 'Room List Endpoint',
    'php-api/public/admin/posting-access.php' => 'Posting Access Management',
    'php-api/public/admin/rooms-management.php' => 'Admin Room Management',
    'php-api/public/admin/smtp-settings.php' => 'SMTP Settings',
    'php-api/public/admin/ads-management.php' => 'Ads Management',
    'php-api/public/tickets/create.php' => 'Ticket Creation',
    'php-api/public/tickets/reply.php' => 'Ticket Reply',
    'php-api/lib/EmailSender.php' => 'Email Sender Class'
];

foreach ($filesToCheck as $file => $name) {
    $fullPath = __DIR__ . '/' . $file;
    $exists = file_exists($fullPath);
    $statusClass = $exists ? 'success' : 'error';
    $statusText = $exists ? '✓ EXISTS' : '✗ MISSING';

    echo "<div class='test'>";
    echo "<span class='{$statusClass}'>{$statusText}</span> - {$name}<br>";
    echo "<span style='color: #888;'>{$file}</span>";
    echo "</div>";
}

// Database table checks
echo "<h2>Database Table Checks</h2>";

try {
    require_once __DIR__ . '/php-api/bootstrap.php';
    require_once __DIR__ . '/php-api/config.php';

    $tables = ['rooms', 'listings', 'tickets', 'ticket_responses', 'smtp_settings', 'ads', 'system_logs', 'users'];

    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->rowCount() > 0;
        $statusClass = $exists ? 'success' : 'error';
        $statusText = $exists ? '✓ EXISTS' : '✗ MISSING';

        echo "<div class='test'>";
        echo "<span class='{$statusClass}'>{$statusText}</span> - Table: {$table}";

        if ($exists) {
            $countStmt = $pdo->query("SELECT COUNT(*) as cnt FROM $table");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
            echo " <span style='color: #0ff;'>({$count} records)</span>";
        }

        echo "</div>";
    }

    // Check critical columns
    echo "<h2>Critical Column Checks</h2>";

    $stmt = $pdo->query("SHOW COLUMNS FROM users WHERE Field IN ('can_post_rooms', 'can_post_listings', 'posting_suspended_reason')");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $col) {
        echo "<div class='test'>";
        echo "<span class='success'>✓ EXISTS</span> - users.{$col['Field']} ({$col['Type']})";
        echo "</div>";
    }

    $stmt = $pdo->query("SHOW COLUMNS FROM rooms WHERE Field IN ('status_changed_by', 'status_changed_at')");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $col) {
        echo "<div class='test'>";
        echo "<span class='success'>✓ EXISTS</span> - rooms.{$col['Field']} ({$col['Type']})";
        echo "</div>";
    }

} catch (Exception $e) {
    echo "<div class='test'>";
    echo "<span class='error'>Database Error: {$e->getMessage()}</span>";
    echo "</div>";
}

echo "<h2>✅ Testing Complete!</h2>";
echo "<p style='color: #0ff;'>Check the results above to identify any issues.</p>";
?>
