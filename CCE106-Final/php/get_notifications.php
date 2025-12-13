<?php
header('Content-Type: application/json');
session_start();
include("config.php");

if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access. Must be logged in as an Admin.'
    ]);
    exit();
}

$all = isset($_GET['all']) && $_GET['all'] == '1';

if ($all) {
    $sql = "SELECT notif_id, notif_msg, type, is_read, meta, created_at, created_by 
            FROM tblnotifications 
            ORDER BY created_at DESC";
} else {
    $sql = "SELECT notif_id, notif_msg, type, is_read, meta, created_at, created_by 
            FROM tblnotifications 
            WHERE is_read = 0 
            ORDER BY 
                CASE 
                    WHEN type = 'customer_approval' THEN 1
                    ELSE 2 
                END,
                created_at DESC";
}

$res = $conn->query($sql);
$notifs = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        if (!empty($row['meta'])) {
            $row['meta'] = json_decode($row['meta'], true);
        } else {
            $row['meta'] = null;
        }
        $notifs[] = $row;
    }
    $res->free();
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database query failed: ' . $conn->error
    ]);
    exit();
}

$conn->close();

echo json_encode([
    'success' => true,
    'notifications' => $notifs
]);
?>