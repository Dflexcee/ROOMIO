<?php
session_start();
$_SESSION['user_id'] = 3; // Simulate logged-in user

$pdo = new PDO('mysql:host=localhost;dbname=roomio', 'root', '');

echo "=== TESTING CLICK TRACKING ===\n\n";

// Get current click counts
$stmt = $pdo->query("SELECT id, title, ad_type, clicks FROM ads ORDER BY id");
echo "BEFORE TEST:\n";
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Ad #{$row['id']} ({$row['ad_type']}): {$row['title']} - {$row['clicks']} clicks\n";
}

// Simulate clicks for each ad type
$adTypes = ['banner', 'popup', 'sidebar'];
foreach ($adTypes as $type) {
    $stmt = $pdo->prepare("SELECT id FROM ads WHERE ad_type = ? LIMIT 1");
    $stmt->execute([$type]);
    $ad = $stmt->fetch();
    
    if ($ad) {
        // Simulate API call
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost/roomio/php-api/public/ads/track-click.php");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['ad_id' => $ad['id']]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Cookie: PHPSESSID=' . session_id()
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        echo "\nTracked click for $type ad (ID: {$ad['id']}): $response\n";
    }
}

echo "\n\nAFTER TEST:\n";
$stmt = $pdo->query("SELECT id, title, ad_type, clicks FROM ads ORDER BY id");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Ad #{$row['id']} ({$row['ad_type']}): {$row['title']} - {$row['clicks']} clicks\n";
}

echo "\n✅ Click tracking test complete!\n";
