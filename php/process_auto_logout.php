<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$empId = $_POST['empid'] ?? null;
$isAutoLogout = $_POST['auto_logout'] ?? false;

if (!$empId) {
    echo json_encode(['success' => false, 'message' => 'Employee ID required']);
    exit;
}

try {
    // Using mysqli from config.php
    $conn = new mysqli($host, $user, $pass, $db);
    
    // Check connection
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed']));
    }
    
    // Get current date
    $today = date('Y-m-d');
    $logoutTime = '22:00:00';
    
    // Check if employee has logged in today but not logged out
    $checkQuery = "SELECT * FROM tblloginhistory WHERE EmpID = ? AND DATE(LogDate) = ? AND (TimeOut IS NULL OR TimeOut = '00:00:00')";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("is", $empId, $today);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $logEntry = $result->fetch_assoc();
    
    if ($logEntry) {
        // Update the log entry
        $updateQuery = "UPDATE tblloginhistory SET TimeOut = ? WHERE LogID = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("si", $logoutTime, $logEntry['LogID']);
        
        if ($updateStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Auto-logout processed']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update logout time: ' . $conn->error]);
        }
        
        $updateStmt->close();
    } else {
        // Try to insert a logout record if none exists
        $insertQuery = "INSERT INTO tblloginhistory (EmpID, LogDate, TimeOut) VALUES (?, ?, ?)";
        $insertStmt = $conn->prepare($insertQuery);
        $insertStmt->bind_param("iss", $empId, $today, $logoutTime);
        
        if ($insertStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Auto-logout record created']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No active session found and could not create logout record']);
        }
        
        $insertStmt->close();
    }
    
    $checkStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>