<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Set connection charset
    $pdo->exec("SET NAMES utf8mb4");

    $symbols = [
        'NGN' => '₦',
        'EUR' => '€',
        'GBP' => '£',
        'CNY' => '¥',
        'JPY' => '¥',
        'INR' => '₹'
    ];

    foreach ($symbols as $code => $symbol) {
        $stmt = $pdo->prepare("UPDATE currency_settings SET currency_symbol = ? WHERE currency_code = ?");
        $stmt->execute([$symbol, $code]);
    }

    // Verify NGN symbol
    $stmt = $pdo->prepare("SELECT currency_code, currency_symbol FROM currency_settings WHERE currency_code = 'NGN'");
    $stmt->execute();
    $ngn = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Currency symbols updated successfully',
        'ngn_symbol' => $ngn['currency_symbol'],
        'updated' => count($symbols)
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
