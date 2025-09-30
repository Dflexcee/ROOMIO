<?php
// Add real sample listings that match the actual database structure
// Run this in phpMyAdmin → roomio database → SQL tab

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // First, check what columns exist in the rooms table
    $stmt = $pdo->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Available columns in rooms table: " . implode(', ', $columns) . "\n";
    
    // Check if we have any users to assign rooms to
    $stmt = $pdo->query("SELECT id, email, full_name FROM users LIMIT 5");
    $users = $stmt->fetchAll();
    
    if (empty($users)) {
        echo "No users found! Please create some users first.\n";
        exit;
    }
    
    echo "Found " . count($users) . " users to assign rooms to.\n";
    
    // Check current room count
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
    $currentCount = $stmt->fetch()['count'];
    echo "Current rooms in database: $currentCount\n";
    
    if ($currentCount > 0) {
        echo "Database already has rooms. Skipping sample data insertion.\n";
        exit;
    }
    
    // Sample listings data
    $sampleListings = [
        [
            'title' => 'Beautiful 2BR Apartment in Victoria Island',
            'description' => 'Spacious 2-bedroom apartment with modern amenities, located in the heart of Victoria Island. Perfect for young professionals working in the area.',
            'location' => 'Victoria Island, Lagos',
            'rent' => 450000,
            'status' => 'active',
            'user_id' => $users[0]['id'],
            'bedrooms' => 2,
            'bathrooms' => 2,
            'area' => '1200 sq ft',
            'amenities' => 'Parking, Security, Gym, Swimming Pool',
            'images' => 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Apartment+1,https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Living+Room',
            'contact_phone' => '+234-123-456-7890',
            'contact_email' => $users[0]['email']
        ],
        [
            'title' => 'Cozy Studio Apartment in Lekki',
            'description' => 'Furnished studio apartment with all utilities included. Great for students or young professionals starting their career.',
            'location' => 'Lekki Phase 1, Lagos',
            'rent' => 180000,
            'status' => 'pending',
            'user_id' => isset($users[1]) ? $users[1]['id'] : $users[0]['id'],
            'bedrooms' => 1,
            'bathrooms' => 1,
            'area' => '600 sq ft',
            'amenities' => 'WiFi, Air Conditioning, Furnished',
            'images' => 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Studio+1',
            'contact_phone' => '+234-987-654-3210',
            'contact_email' => isset($users[1]) ? $users[1]['email'] : $users[0]['email']
        ],
        [
            'title' => 'Luxury 3BR Villa in Ikoyi',
            'description' => 'Stunning 3-bedroom villa with private garden and modern kitchen. Perfect for families looking for comfort and luxury.',
            'location' => 'Ikoyi, Lagos',
            'rent' => 850000,
            'status' => 'active',
            'user_id' => isset($users[2]) ? $users[2]['id'] : $users[0]['id'],
            'bedrooms' => 3,
            'bathrooms' => 3,
            'area' => '2000 sq ft',
            'amenities' => 'Private Garden, Security, Maid Quarters, Swimming Pool',
            'images' => 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Villa+1,https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Garden,https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Kitchen',
            'contact_phone' => '+234-555-123-4567',
            'contact_email' => isset($users[2]) ? $users[2]['email'] : $users[0]['email']
        ],
        [
            'title' => 'Shared Room in Surulere',
            'description' => 'Shared room in a 4-bedroom house. Great for students or young professionals on a budget.',
            'location' => 'Surulere, Lagos',
            'rent' => 75000,
            'status' => 'flagged',
            'user_id' => isset($users[3]) ? $users[3]['id'] : $users[0]['id'],
            'bedrooms' => 1,
            'bathrooms' => 1,
            'area' => '300 sq ft',
            'amenities' => 'Shared Kitchen, WiFi, Security',
            'images' => 'https://via.placeholder.com/400x300/7C2D12/FFFFFF?text=Shared+Room',
            'contact_phone' => '+234-444-555-6666',
            'contact_email' => isset($users[3]) ? $users[3]['email'] : $users[0]['email'],
            'flagged_reason' => 'Suspicious pricing - under review'
        ],
        [
            'title' => 'Modern 1BR Apartment in Abuja',
            'description' => 'Newly built 1-bedroom apartment in a secure estate. Close to major business districts and shopping centers.',
            'location' => 'Asokoro, Abuja',
            'rent' => 320000,
            'status' => 'active',
            'user_id' => isset($users[4]) ? $users[4]['id'] : $users[0]['id'],
            'bedrooms' => 1,
            'bathrooms' => 1,
            'area' => '800 sq ft',
            'amenities' => 'Security, Gym, 24/7 Power, Parking',
            'images' => 'https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=Abuja+Apt,https://via.placeholder.com/400x300/374151/FFFFFF?text=Interior',
            'contact_phone' => '+234-777-888-9999',
            'contact_email' => isset($users[4]) ? $users[4]['email'] : $users[0]['email']
        ]
    ];
    
    // Insert sample listings
    $insertedCount = 0;
    foreach ($sampleListings as $listing) {
        // Build dynamic INSERT query based on existing columns
        $insertFields = [];
        $values = [];
        $placeholders = [];
        
        // Map the listing data to available columns
        $fieldMapping = [
            'title' => $listing['title'],
            'description' => $listing['description'],
            'location' => $listing['location'],
            'rent' => $listing['rent'],
            'price' => $listing['rent'], // Some schemas use 'price' instead of 'rent'
            'status' => $listing['status'],
            'user_id' => $listing['user_id'],
            'bedrooms' => $listing['bedrooms'],
            'bathrooms' => $listing['bathrooms'],
            'area' => $listing['area'],
            'amenities' => $listing['amenities'],
            'images' => $listing['images'],
            'contact_phone' => $listing['contact_phone'],
            'contact_email' => $listing['contact_email'],
            'flagged_reason' => $listing['flagged_reason'] ?? null
        ];
        
        // Only include fields that exist in the database
        foreach ($fieldMapping as $field => $value) {
            if (in_array($field, $columns) && $value !== null) {
                $insertFields[] = $field;
                $values[] = $value;
                $placeholders[] = '?';
            }
        }
        
        // Add created_at if it exists
        if (in_array('created_at', $columns)) {
            $insertFields[] = 'created_at';
            $values[] = date('Y-m-d H:i:s');
            $placeholders[] = '?';
        }
        
        // Add posted_at if it exists
        if (in_array('posted_at', $columns)) {
            $insertFields[] = 'posted_at';
            $values[] = date('Y-m-d H:i:s');
            $placeholders[] = '?';
        }
        
        if (!empty($insertFields)) {
            $sql = "INSERT INTO rooms (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            $insertedCount++;
            echo "Inserted listing: {$listing['title']}\n";
        }
    }
    
    echo "\n✅ Successfully inserted $insertedCount sample listings!\n";
    
    // Show final count
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
    $finalCount = $stmt->fetch()['count'];
    echo "Total rooms in database now: $finalCount\n";
    
    // Show listings by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM rooms GROUP BY status");
    $statusCounts = $stmt->fetchAll();
    echo "Listings by status:\n";
    foreach ($statusCounts as $status) {
        echo "- {$status['status']}: {$status['count']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
