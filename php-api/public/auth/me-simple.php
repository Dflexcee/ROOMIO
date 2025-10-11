<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

echo json_encode(['user' => null, 'test' => 'simple response working']);
?>
