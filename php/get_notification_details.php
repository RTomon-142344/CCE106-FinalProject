<?php
session_start();
require_once 'config.php';

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Notification ID required']);
    exit;
}

$notificationId = $_GET['id'];

try {
    $sql = "SELECT * FROM tblnotifications WHERE notif_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $notification = $result->fetch_assoc();
    
    if ($notification) {
        echo json_encode([
            'success' => true,
            'notification' => $notification
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Notification not found'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>