<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required',
        'redirect' => 'login.php'
    ]);
    exit();
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
$all = isset($_GET['all']) ? true : false;

try {
    if ($all) {
        $sql = "SELECT * FROM tblnotifications ORDER BY created_at DESC";
        if ($filter === 'unread') {
            $sql = "SELECT * FROM tblnotifications WHERE is_read = 0 ORDER BY created_at DESC";
        } elseif ($filter === 'read') {
            $sql = "SELECT * FROM tblnotifications WHERE is_read = 1 ORDER BY created_at DESC";
        }
    } else {
        $sql = "SELECT * FROM tblnotifications WHERE is_read = 0 ORDER BY created_at DESC";
        if ($limit > 0) {
            $sql .= " LIMIT " . $limit;
        }
    }
    
    $result = $conn->query($sql);
    $notifications = [];
    
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $notifications[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>