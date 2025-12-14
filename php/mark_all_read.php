<?php
session_start();
require_once 'config.php';

try {
    $sql = "UPDATE tblnotifications SET is_read = 1 WHERE is_read = 0";
    $conn->query($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'All notifications marked as read'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>