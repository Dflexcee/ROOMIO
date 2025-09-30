<?php
// Admin Listings Management API - Comprehensive Version
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Allow both development ports
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5174');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all listings with comprehensive data
        error_log("Listings API: Starting to fetch listings");
        
        // First, check what columns exist in the rooms table
        $stmt = $pdo->query("DESCRIBE rooms");
        $roomColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        error_log("Listings API: Available room columns: " . implode(', ', $roomColumns));
        
        // Check if profiles table exists and its structure
        $stmt = $pdo->query("SHOW TABLES LIKE 'profiles'");
        $profilesExists = $stmt->rowCount() > 0;
        $profileColumns = [];
        if ($profilesExists) {
            $stmt = $pdo->query("DESCRIBE profiles");
            $profileColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            error_log("Listings API: Available profile columns: " . implode(', ', $profileColumns));
        }
        
        // Build dynamic SELECT query based on available columns
        $selectFields = [
            'r.id',
            'r.title',
            'r.description', 
            'r.location',
            'COALESCE(r.rent, r.price, 0) as rent',
            'COALESCE(r.status, "pending") as status',
            'r.user_id'
        ];
        
        // Add optional fields if they exist
        if (in_array('created_at', $roomColumns)) {
            $selectFields[] = 'r.created_at';
        }
        if (in_array('updated_at', $roomColumns)) {
            $selectFields[] = 'r.updated_at';
        }
        if (in_array('posted_at', $roomColumns)) {
            $selectFields[] = 'r.posted_at';
        }
        if (in_array('bedrooms', $roomColumns)) {
            $selectFields[] = 'r.bedrooms';
        }
        if (in_array('bathrooms', $roomColumns)) {
            $selectFields[] = 'r.bathrooms';
        }
        if (in_array('area', $roomColumns)) {
            $selectFields[] = 'r.area';
        }
        if (in_array('amenities', $roomColumns)) {
            $selectFields[] = 'r.amenities';
        }
        if (in_array('images', $roomColumns)) {
            $selectFields[] = 'r.images';
        }
        if (in_array('contact_phone', $roomColumns)) {
            $selectFields[] = 'r.contact_phone';
        }
        if (in_array('contact_email', $roomColumns)) {
            $selectFields[] = 'r.contact_email';
        }
        if (in_array('flagged_reason', $roomColumns)) {
            $selectFields[] = 'r.flagged_reason';
        }
        if (in_array('flagged_at', $roomColumns)) {
            $selectFields[] = 'r.flagged_at';
        }
        if (in_array('flagged_by', $roomColumns)) {
            $selectFields[] = 'r.flagged_by';
        }
        
        // Add user information
        $selectFields[] = 'COALESCE(u.email, "No Email") as owner_email';
        $selectFields[] = 'COALESCE(u.full_name, "Unknown User") as owner_name';
        
        // Add profile information if profiles table exists
        if ($profilesExists) {
            if (in_array('user_id', $profileColumns)) {
                $selectFields[] = 'COALESCE(p.phone, "N/A") as owner_phone';
            } elseif (in_array('id', $profileColumns)) {
                $selectFields[] = 'COALESCE(p.phone, "N/A") as owner_phone';
            }
        }
        
        $sql = "SELECT " . implode(', ', $selectFields) . " FROM rooms r LEFT JOIN users u ON r.user_id = u.id";
        
        if ($profilesExists) {
            if (in_array('user_id', $profileColumns)) {
                $sql .= " LEFT JOIN profiles p ON u.id = p.user_id";
            } elseif (in_array('id', $profileColumns)) {
                $sql .= " LEFT JOIN profiles p ON u.id = p.id";
            }
        }
        
        $sql .= " ORDER BY " . (in_array('created_at', $roomColumns) ? 'r.created_at' : 'r.id') . " DESC";
        
        error_log("Listings API: Executing query: " . $sql);
        
        $stmt = $pdo->query($sql);
        $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("Listings API: Found " . count($listings) . " listings");
        
        // Process listings data
        $processedListings = [];
        foreach ($listings as $listing) {
            $processedListing = [
                'id' => (int)$listing['id'],
                'title' => $listing['title'] ?: 'Untitled Listing',
                'description' => $listing['description'] ?: 'No description provided',
                'location' => $listing['location'] ?: 'Location not specified',
                'rent' => (int)$listing['rent'],
                'status' => $listing['status'] ?: 'pending',
                'user_id' => (int)$listing['user_id'],
                'owner_name' => $listing['owner_name'] ?: 'Unknown',
                'owner_email' => $listing['owner_email'] ?: 'Unknown',
            ];
            
            // Add optional fields if they exist in the data
            if (isset($listing['created_at'])) {
                $processedListing['created_at'] = $listing['created_at'];
            }
            if (isset($listing['updated_at'])) {
                $processedListing['updated_at'] = $listing['updated_at'];
            }
            if (isset($listing['posted_at'])) {
                $processedListing['posted_date'] = $listing['posted_at'];
            } elseif (isset($listing['created_at'])) {
                $processedListing['posted_date'] = $listing['created_at'];
            }
            
            if (isset($listing['bedrooms'])) {
                $processedListing['bedrooms'] = (int)($listing['bedrooms'] ?: 0);
            }
            if (isset($listing['bathrooms'])) {
                $processedListing['bathrooms'] = (int)($listing['bathrooms'] ?: 0);
            }
            if (isset($listing['area'])) {
                $processedListing['area'] = $listing['area'] ?: 'Not specified';
            }
            
            // Handle amenities
            if (isset($listing['amenities'])) {
                if (is_string($listing['amenities'])) {
                    // Try to decode as JSON first, then fall back to comma-separated
                    $decoded = json_decode($listing['amenities'], true);
                    $processedListing['amenities'] = $decoded ?: explode(',', $listing['amenities']);
                } else {
                    $processedListing['amenities'] = $listing['amenities'] ?: [];
                }
            } else {
                $processedListing['amenities'] = [];
            }
            
            // Handle images
            if (isset($listing['images'])) {
                if (is_string($listing['images'])) {
                    // Try to decode as JSON first, then fall back to comma-separated
                    $decoded = json_decode($listing['images'], true);
                    $processedListing['images'] = $decoded ?: explode(',', $listing['images']);
                } else {
                    $processedListing['images'] = $listing['images'] ?: [];
                }
            } else {
                $processedListing['images'] = [];
            }
            
            if (isset($listing['contact_phone'])) {
                $processedListing['contact_phone'] = $listing['contact_phone'] ?: 'N/A';
            }
            if (isset($listing['contact_email'])) {
                $processedListing['contact_email'] = $listing['contact_email'] ?: 'N/A';
            }
            if (isset($listing['flagged_reason'])) {
                $processedListing['flagged_reason'] = $listing['flagged_reason'] ?: null;
            }
            if (isset($listing['flagged_at'])) {
                $processedListing['flagged_at'] = $listing['flagged_at'] ?: null;
            }
            if (isset($listing['flagged_by'])) {
                $processedListing['flagged_by'] = $listing['flagged_by'] ?: null;
            }
            if (isset($listing['owner_phone'])) {
                $processedListing['owner_phone'] = $listing['owner_phone'] ?: 'N/A';
            }
            
            $processedListings[] = $processedListing;
        }
        
        error_log("Listings API: Returning " . count($processedListings) . " processed listings");
        
        echo json_encode([
            'success' => true,
            'listings' => $processedListings,
            'debug' => [
                'total_found' => count($listings),
                'total_processed' => count($processedListings),
                'api_version' => '1.0'
            ]
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $listing_id = (int)$input['listing_id'];
        $action = $input['action'];
        $reason = isset($input['reason']) ? trim($input['reason']) : '';
        $admin_id = isset($input['admin_id']) ? (int)$input['admin_id'] : 1;
        
        // Handle different actions
        if ($action === 'activate') {
            $stmt = $pdo->prepare("UPDATE rooms SET status = 'active', flagged_reason = ?, flagged_at = NOW(), flagged_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $listing_id]);
        } else if ($action === 'flag') {
            $stmt = $pdo->prepare("UPDATE rooms SET status = 'flagged', flagged_reason = ?, flagged_at = NOW(), flagged_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $listing_id]);
        } else if ($action === 'pending') {
            $stmt = $pdo->prepare("UPDATE rooms SET status = 'pending', flagged_reason = ?, flagged_at = NOW(), flagged_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $listing_id]);
        } else if ($action === 'reject') {
            $stmt = $pdo->prepare("UPDATE rooms SET status = 'rejected', flagged_reason = ?, flagged_at = NOW(), flagged_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin_id, $listing_id]);
        } else if ($action === 'update_listing') {
            $field = $input['field'];
            
            if ($field === 'bulk_update') {
                // Handle bulk update of listing data
                $listing_data = $input['listing_data'];
                
                // Update multiple fields at once
                $updateFields = [];
                $values = [];
                
                $allowedFields = [
                    'title', 'description', 'location', 'rent', 'bedrooms', 
                    'bathrooms', 'area', 'amenities', 'contact_phone', 'contact_email'
                ];
                
                foreach ($allowedFields as $allowedField) {
                    if (isset($listing_data[$allowedField])) {
                        $updateFields[] = "$allowedField = ?";
                        $values[] = $listing_data[$allowedField];
                    }
                }
                
                if (!empty($updateFields)) {
                    $values[] = $listing_id; // Add listing_id for WHERE clause
                    $sql = "UPDATE rooms SET " . implode(', ', $updateFields) . " WHERE id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($values);
                }
            } else {
                // Handle single field update (legacy support)
                $value = $input['value'];
                $stmt = $pdo->prepare("UPDATE rooms SET $field = ? WHERE id = ?");
                $stmt->execute([$value, $listing_id]);
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => "Listing $action successful",
            'listing_id' => $listing_id,
            'action' => $action
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
