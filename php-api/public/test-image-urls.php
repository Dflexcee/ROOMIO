<?php
/**
 * Test Image URL Conversion
 * This will help diagnose if UrlHelper is working correctly
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../lib/UrlHelper.php';
require_once __DIR__ . '/../lib/Config.php';

// Test various image paths
$testPaths = [
    '/roomio/php-api/uploads/rooms/test.jpg',
    '/php-api/uploads/avatars/user.jpg',
    'uploads/listings/listing.jpg',
    'rooms/room123.jpg',
    'avatars/avatar456.jpg',
    'https://example.com/image.jpg'
];

$results = [];

// Test Config values
$results['config'] = [
    'UPLOAD_BASE_URL' => Config::get('UPLOAD_BASE_URL'),
    'APP_URL' => Config::get('APP_URL'),
    'DB_NAME' => Config::get('DB_NAME'),
    'CORS_ORIGINS' => Config::get('CORS_ORIGINS')
];

// Test URL conversions
$results['conversions'] = [];
foreach ($testPaths as $path) {
    $results['conversions'][] = [
        'input' => $path,
        'output' => UrlHelper::toAbsoluteUrl($path)
    ];
}

// Test with sample room data
$sampleRoom = [
    'id' => 1,
    'title' => 'Test Room',
    'images' => ['/roomio/php-api/uploads/rooms/test1.jpg', 'uploads/rooms/test2.jpg'],
    'poster_avatar' => '/php-api/uploads/avatars/user1.jpg'
];

$results['sample_room_before'] = $sampleRoom;

// Convert images
$sampleRoom['images'] = array_map(function($img) {
    return UrlHelper::toAbsoluteUrl($img);
}, $sampleRoom['images']);

$sampleRoom['poster_avatar'] = UrlHelper::toAbsoluteUrl($sampleRoom['poster_avatar']);

$results['sample_room_after'] = $sampleRoom;

echo json_encode($results, JSON_PRETTY_PRINT);
?>
