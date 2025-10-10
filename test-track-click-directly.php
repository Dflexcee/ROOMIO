<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing track-click.php directly...\n\n";

// Simulate the request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'Test Browser';

// Start session
session_start();
$_SESSION['user_id'] = 3; // Logged in user

// Set POST data
$_POST = ['ad_id' => 2];

// Include the track-click file
try {
    ob_start();
    include 'php-api/public/ads/track-click.php';
    $output = ob_get_clean();
    echo "Output: $output\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
