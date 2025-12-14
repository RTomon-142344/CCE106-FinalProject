<?php
include("config.php");

header('Content-Type: application/json');

$current_hour = date('H');
$today = date('Y-m-d');

if ($current_hour >= 22) {
    // Process auto-logout
    $update_sql = "UPDATE tblloginhistory 
                  SET TimeOut = '22:00:00' 
                  WHERE DATE(LogDate) = ? 
                  AND (TimeOut IS NULL OR TimeOut = '00:00:00')
                  AND TimeIn IS NOT NULL";
    
    $stmt = $conn->prepare($update_sql);
    $stmt->bind_param("s", $today);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Auto-logout processed']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to process auto-logout']);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'Not time for auto-logout']);
}

$conn->close();
?>