<?php
session_start();
require_once 'config.php';

try {
    $sql = "DELETE FROM tblnotifications";
    $conn->query($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'All notifications cleared'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>