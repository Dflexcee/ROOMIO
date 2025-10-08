<?php
/**
 * Rate Limiting Middleware
 *
 * Prevents brute force attacks and API abuse by limiting the number of requests
 * a user can make within a specific time window.
 *
 * Features:
 * - IP-based rate limiting
 * - User-based rate limiting (for authenticated requests)
 * - Configurable limits per endpoint
 * - Automatic cleanup of expired entries
 *
 * Usage:
 * require_once __DIR__ . '/../middleware/rate-limiter.php';
 * check_rate_limit($pdo, 'login', 5, 300); // 5 attempts per 5 minutes
 */

/**
 * Check if the current request exceeds the rate limit
 *
 * @param PDO $pdo Database connection
 * @param string $action Action identifier (e.g., 'login', 'register', 'api_call')
 * @param int $maxAttempts Maximum number of attempts allowed
 * @param int $windowSeconds Time window in seconds
 * @param string|null $identifier Custom identifier (defaults to IP address or user ID)
 * @return void Exits with 429 response if limit exceeded
 */
function check_rate_limit(PDO $pdo, string $action, int $maxAttempts = 5, int $windowSeconds = 300, ?string $identifier = null): void {
    // Get identifier (user ID if logged in, otherwise IP address)
    if ($identifier === null) {
        $identifier = isset($_SESSION['user_id'])
            ? 'user_' . $_SESSION['user_id']
            : 'ip_' . get_client_ip();
    }

    $key = "{$action}:{$identifier}";
    $expiresAt = time() + $windowSeconds;

    try {
        // Create rate_limit table if it doesn't exist
        create_rate_limit_table($pdo);

        // Clean up expired entries (run periodically)
        if (rand(1, 100) === 1) { // 1% chance to cleanup
            cleanup_expired_rate_limits($pdo);
        }

        // Count recent attempts within the time window
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as attempt_count
            FROM rate_limits
            WHERE rate_key = ? AND expires_at > ?
        ");
        $stmt->execute([$key, time()]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $attemptCount = $result['attempt_count'] ?? 0;

        // Check if limit exceeded
        if ($attemptCount >= $maxAttempts) {
            // Get time until next allowed attempt
            $stmt = $pdo->prepare("
                SELECT MIN(expires_at) as earliest_expiry
                FROM rate_limits
                WHERE rate_key = ? AND expires_at > ?
            ");
            $stmt->execute([$key, time()]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $retryAfter = $result['earliest_expiry'] ? ($result['earliest_expiry'] - time()) : $windowSeconds;

            header('Retry-After: ' . $retryAfter);
            json_response([
                'error' => 'Too many attempts. Please try again later.',
                'retry_after' => $retryAfter,
                'max_attempts' => $maxAttempts,
                'window_seconds' => $windowSeconds
            ], 429);
            exit;
        }

        // Record this attempt
        $stmt = $pdo->prepare("
            INSERT INTO rate_limits (rate_key, expires_at, created_at)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$key, $expiresAt]);

    } catch (PDOException $e) {
        // Log error but don't block the request if rate limiting fails
        error_log("Rate limit error: " . $e->getMessage());
    }
}

/**
 * Create the rate_limits table if it doesn't exist
 *
 * @param PDO $pdo Database connection
 * @return void
 */
function create_rate_limit_table(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            rate_key VARCHAR(255) NOT NULL,
            expires_at INT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rate_key (rate_key),
            INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

/**
 * Clean up expired rate limit entries
 *
 * @param PDO $pdo Database connection
 * @return void
 */
function cleanup_expired_rate_limits(PDO $pdo): void {
    try {
        $pdo->exec("DELETE FROM rate_limits WHERE expires_at < " . time());
    } catch (PDOException $e) {
        error_log("Rate limit cleanup error: " . $e->getMessage());
    }
}

/**
 * Get the client's IP address (handles proxies and load balancers)
 *
 * @return string Client IP address
 */
function get_client_ip(): string {
    $ip = '';

    // Check for IP from various headers (in order of reliability)
    $headers = [
        'HTTP_CF_CONNECTING_IP',  // Cloudflare
        'HTTP_X_REAL_IP',         // Nginx proxy
        'HTTP_X_FORWARDED_FOR',   // Standard proxy header
        'REMOTE_ADDR'             // Direct connection
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = $_SERVER[$header];
            // Handle comma-separated IPs (X-Forwarded-For can have multiple IPs)
            if (strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                $ip = trim($ips[0]); // Get the first IP
            }
            break;
        }
    }

    // Validate and sanitize IP
    $ip = filter_var($ip, FILTER_VALIDATE_IP) ?: '0.0.0.0';

    return $ip;
}

/**
 * Reset rate limit for a specific action and identifier
 * Useful for administrative purposes or after successful verification
 *
 * @param PDO $pdo Database connection
 * @param string $action Action identifier
 * @param string|null $identifier Custom identifier (defaults to IP or user ID)
 * @return void
 */
function reset_rate_limit(PDO $pdo, string $action, ?string $identifier = null): void {
    if ($identifier === null) {
        $identifier = isset($_SESSION['user_id'])
            ? 'user_' . $_SESSION['user_id']
            : 'ip_' . get_client_ip();
    }

    $key = "{$action}:{$identifier}";

    try {
        $stmt = $pdo->prepare("DELETE FROM rate_limits WHERE rate_key = ?");
        $stmt->execute([$key]);
    } catch (PDOException $e) {
        error_log("Rate limit reset error: " . $e->getMessage());
    }
}

/**
 * Get remaining attempts before rate limit is triggered
 *
 * @param PDO $pdo Database connection
 * @param string $action Action identifier
 * @param int $maxAttempts Maximum attempts allowed
 * @param int $windowSeconds Time window in seconds
 * @param string|null $identifier Custom identifier
 * @return int Number of remaining attempts
 */
function get_remaining_attempts(PDO $pdo, string $action, int $maxAttempts, int $windowSeconds, ?string $identifier = null): int {
    if ($identifier === null) {
        $identifier = isset($_SESSION['user_id'])
            ? 'user_' . $_SESSION['user_id']
            : 'ip_' . get_client_ip();
    }

    $key = "{$action}:{$identifier}";

    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as attempt_count
            FROM rate_limits
            WHERE rate_key = ? AND expires_at > ?
        ");
        $stmt->execute([$key, time()]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $attemptCount = $result['attempt_count'] ?? 0;

        return max(0, $maxAttempts - $attemptCount);
    } catch (PDOException $e) {
        error_log("Get remaining attempts error: " . $e->getMessage());
        return $maxAttempts; // Return max on error to avoid blocking
    }
}
