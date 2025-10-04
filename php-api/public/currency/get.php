<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    // Get the default/active currency from currency_settings
    $stmt = $pdo->prepare("
        SELECT currency_code, currency_symbol, currency_name
        FROM currency_settings
        WHERE is_default = TRUE OR is_active = TRUE
        ORDER BY is_default DESC
        LIMIT 1
    ");
    $stmt->execute();
    $currency = $stmt->fetch(PDO::FETCH_ASSOC);

    // Fallback to NGN if no currency is set
    if (!$currency) {
        $currency = [
            'currency_code' => 'NGN',
            'currency_symbol' => '₦',
            'currency_name' => 'Nigerian Naira'
        ];
    }

    json_response([
        'success' => true,
        'currency' => $currency
    ]);

} catch (PDOException $e) {
    error_log("Currency get error: " . $e->getMessage());
    // Return default currency on error
    json_response([
        'success' => true,
        'currency' => [
            'currency_code' => 'NGN',
            'currency_symbol' => '₦',
            'currency_name' => 'Nigerian Naira'
        ]
    ]);
}
?>
