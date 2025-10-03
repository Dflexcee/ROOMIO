<?php
/**
 * Get Users with Their Posts (Rooms + Listings)
 * For Find Roommate page - shows profile + what they posted
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

try {
    // Get all users who have posted either rooms or listings
    $sql = "
        SELECT DISTINCT
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.avatar_url,
            u.gender,
            u.religion,
            u.lifestyle,
            u.university,
            u.budget_range,
            u.about_me,
            u.created_at
        FROM users u
        WHERE u.role != 'admin'
        AND u.role != 'banned'
        AND (
            EXISTS (SELECT 1 FROM rooms WHERE user_id = u.id AND status = 'approved')
            OR EXISTS (SELECT 1 FROM listings WHERE user_id = u.id AND status = 'approved')
        )
        ORDER BY u.created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each user, get their posts
    foreach ($users as &$user) {
        // Get approved rooms
        $roomStmt = $pdo->prepare("
            SELECT id, title, description, location, rent, gender_preference,
                   role, images, amenities, status, created_at
            FROM rooms
            WHERE user_id = ? AND status = 'approved'
            ORDER BY created_at DESC
        ");
        $roomStmt->execute([$user['id']]);
        $rooms = $roomStmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON fields for rooms
        foreach ($rooms as &$room) {
            if (isset($room['images']) && is_string($room['images'])) {
                $room['images'] = json_decode($room['images'], true) ?: [];
            }
            if (isset($room['amenities']) && is_string($room['amenities'])) {
                $room['amenities'] = json_decode($room['amenities'], true) ?: [];
            }
        }

        // Get approved listings
        $listingStmt = $pdo->prepare("
            SELECT id, type, title, description, price, location,
                   images, specifications, contact_phone, contact_email,
                   status, created_at
            FROM listings
            WHERE user_id = ? AND status = 'approved'
            ORDER BY created_at DESC
        ");
        $listingStmt->execute([$user['id']]);
        $listings = $listingStmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON fields for listings
        foreach ($listings as &$listing) {
            if (isset($listing['images']) && is_string($listing['images'])) {
                $listing['images'] = json_decode($listing['images'], true) ?: [];
            }
            if (isset($listing['specifications']) && is_string($listing['specifications'])) {
                $listing['specifications'] = json_decode($listing['specifications'], true) ?: [];
            }
        }

        // Add to user object
        $user['rooms'] = $rooms;
        $user['listings'] = $listings;
        $user['total_rooms'] = count($rooms);
        $user['total_listings'] = count($listings);
        $user['total_posts'] = count($rooms) + count($listings);

        // Create post summary for display
        $postTypes = [];
        if (count($rooms) > 0) $postTypes[] = count($rooms) . ' room' . (count($rooms) > 1 ? 's' : '');
        if (count($listings) > 0) $postTypes[] = count($listings) . ' listing' . (count($listings) > 1 ? 's' : '');
        $user['posts_summary'] = implode(' & ', $postTypes);
    }

    json_response([
        'success' => true,
        'users' => $users,
        'total' => count($users)
    ]);

} catch (Exception $e) {
    error_log('Users with posts fetch error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
