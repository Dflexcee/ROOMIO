<?php
/**
 * Get Users with Their Posts (Rooms + Listings)
 * For Find Roommate page - shows profile + what they posted
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

try {
    /**
     * OPTIMIZED QUERY: Fixed N+1 query problem
     *
     * Old approach: 1 query for users + N queries for rooms + N queries for listings
     * New approach: 1 query for users + 1 query for all rooms + 1 query for all listings
     *
     * This reduces database roundtrips from (1 + 2N) to just 3 queries total,
     * dramatically improving performance when there are many users.
     */

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

    if (empty($users)) {
        json_response([
            'success' => true,
            'users' => [],
            'total' => 0
        ]);
        exit;
    }

    // Get all user IDs for batch queries
    $userIds = array_column($users, 'id');
    $placeholders = implode(',', array_fill(0, count($userIds), '?'));

    // Batch fetch ALL approved rooms for these users in ONE query
    $roomSql = "
        SELECT id, user_id, title, description, location, rent, gender_preference,
               role, images, amenities, status, created_at
        FROM rooms
        WHERE user_id IN ($placeholders) AND status = 'approved'
        ORDER BY created_at DESC
    ";
    $roomStmt = $pdo->prepare($roomSql);
    $roomStmt->execute($userIds);
    $allRooms = $roomStmt->fetchAll(PDO::FETCH_ASSOC);

    // Batch fetch ALL approved listings for these users in ONE query
    $listingSql = "
        SELECT id, user_id, type, title, description, price, location,
               images, specifications, contact_phone, contact_email,
               status, created_at
        FROM listings
        WHERE user_id IN ($placeholders) AND status = 'approved'
        ORDER BY created_at DESC
    ";
    $listingStmt = $pdo->prepare($listingSql);
    $listingStmt->execute($userIds);
    $allListings = $listingStmt->fetchAll(PDO::FETCH_ASSOC);

    // Group rooms and listings by user_id for efficient lookup
    $roomsByUser = [];
    foreach ($allRooms as $room) {
        // Decode JSON fields
        if (isset($room['images']) && is_string($room['images'])) {
            $room['images'] = json_decode($room['images'], true) ?: [];
        }
        if (isset($room['amenities']) && is_string($room['amenities'])) {
            $room['amenities'] = json_decode($room['amenities'], true) ?: [];
        }

        $userId = $room['user_id'];
        if (!isset($roomsByUser[$userId])) {
            $roomsByUser[$userId] = [];
        }
        $roomsByUser[$userId][] = $room;
    }

    $listingsByUser = [];
    foreach ($allListings as $listing) {
        // Decode JSON fields
        if (isset($listing['images']) && is_string($listing['images'])) {
            $listing['images'] = json_decode($listing['images'], true) ?: [];
        }
        if (isset($listing['specifications']) && is_string($listing['specifications'])) {
            $listing['specifications'] = json_decode($listing['specifications'], true) ?: [];
        }

        $userId = $listing['user_id'];
        if (!isset($listingsByUser[$userId])) {
            $listingsByUser[$userId] = [];
        }
        $listingsByUser[$userId][] = $listing;
    }

    // Attach rooms and listings to each user
    foreach ($users as &$user) {
        $userId = $user['id'];

        $rooms = $roomsByUser[$userId] ?? [];
        $listings = $listingsByUser[$userId] ?? [];

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
