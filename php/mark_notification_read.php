<?php
session_start();
require_once 'config.php';

if (!isset($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'Notification ID required']);
    exit;
}

$notificationId = $_POST['id'];

try {
    $sql = "UPDATE tblnotifications SET is_read = 1 WHERE notif_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Notification marked as read'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>