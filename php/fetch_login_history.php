<?php
session_start();
include("config.php");

header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$empId = isset($_GET['empid']) ? intval($_GET['empid']) : 0;
$month = isset($_GET['month']) ? $_GET['month'] : date('Y-m');

if ($empId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid employee ID']);
    exit();
}

try {
    // Get login history for the specified employee and month
    $sql = "SELECT 
                DATE(LogDate) as LogDate,
                TIME(TimeIn) as TimeIn,
                TIME(TimeOut) as TimeOut
            FROM tblloginhistory 
            WHERE EmpID = ? 
            AND DATE_FORMAT(LogDate, '%Y-%m') = ?
            ORDER BY LogDate DESC, TimeIn DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $empId, $month);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $history
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>