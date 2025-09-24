<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
require_auth();
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all ads
    try {
        $stmt = $pdo->prepare("
            SELECT id, title, image_url, target_link, active, created_at
            FROM ads 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        json_response([
            'success' => true,
            'ads' => $ads
        ]);
        
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new ad
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['title']) || empty($input['image_url']) || empty($input['target_link'])) {
        json_response(['error' => 'Title, image URL, and target link are required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO ads (title, image_url, target_link, active, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $input['title'],
            $input['image_url'],
            $input['target_link'],
            $input['active'] ? 1 : 0
        ]);
        
        $adId = $pdo->lastInsertId();
        
        // Get the created ad
        $stmt = $pdo->prepare("SELECT * FROM ads WHERE id = ?");
        $stmt->execute([$adId]);
        $ad = $stmt->fetch(PDO::FETCH_ASSOC);
        
        json_response([
            'success' => true,
            'ad' => $ad
        ]);
        
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update ad status
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id']) || !isset($input['active'])) {
        json_response(['error' => 'ID and active status are required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE ads SET active = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$input['active'] ? 1 : 0, $input['id']]);
        
        if ($stmt->rowCount() === 0) {
            json_response(['error' => 'Ad not found'], 404);
        }
        
        json_response([
            'success' => true,
            'message' => 'Ad status updated successfully'
        ]);
        
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
    
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
