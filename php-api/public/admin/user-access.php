<?php
// Admin User Access API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock users data with payments
$users = [
    [
        'id' => 1,
        'user_id' => 1,
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890',
        'role' => 'user',
        'status' => 'active',
        'created_at' => '2024-01-15T10:30:00Z',
        'last_login' => '2024-01-20T14:20:00Z',
        'payments' => [
            [
                'payment_id' => 1,
                'feature_name' => 'Premium Listing',
                'unlock_price' => 5000,
                'paid_at' => '2024-01-15T10:30:00Z',
                'expires_at' => '2024-02-15T10:30:00Z',
                'status' => 'active'
            ],
            [
                'payment_id' => 2,
                'feature_name' => 'Priority Support',
                'unlock_price' => 2000,
                'paid_at' => '2024-01-10T09:15:00Z',
                'expires_at' => '2024-01-17T09:15:00Z',
                'status' => 'expired'
            ]
        ]
    ],
    [
        'id' => 2,
        'user_id' => 2,
        'full_name' => 'Jane Smith',
        'email' => 'jane@example.com',
        'phone' => '+1234567891',
        'role' => 'agent',
        'status' => 'active',
        'created_at' => '2024-01-14T09:15:00Z',
        'last_login' => '2024-01-19T16:45:00Z',
        'payments' => [
            [
                'payment_id' => 3,
                'feature_name' => 'Advanced Search',
                'unlock_price' => 1000,
                'paid_at' => '2024-01-14T09:15:00Z',
                'expires_at' => '2024-01-21T09:15:00Z',
                'status' => 'active'
            ]
        ]
    ],
    [
        'id' => 3,
        'user_id' => 3,
        'full_name' => 'Bob Wilson',
        'email' => 'bob@example.com',
        'phone' => '+1234567892',
        'role' => 'landlord',
        'status' => 'pending',
        'created_at' => '2024-01-13T11:30:00Z',
        'last_login' => '2024-01-18T10:15:00Z',
        'payments' => []
    ]
];

// Mock payments data
$payments = [
    [
        'id' => 1,
        'user_id' => 1,
        'amount' => 5000,
        'currency' => 'NGN',
        'status' => 'completed',
        'payment_method' => 'card',
        'created_at' => '2024-01-15T10:30:00Z'
    ],
    [
        'id' => 2,
        'user_id' => 2,
        'amount' => 2000,
        'currency' => 'NGN',
        'status' => 'pending',
        'payment_method' => 'bank_transfer',
        'created_at' => '2024-01-14T14:20:00Z'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'users' => $users,
        'payments' => $payments
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Mock save functionality
    echo json_encode([
        'success' => true,
        'message' => 'User access updated successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
