<?php
session_start();
include("config.php");

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

// Check if user is admin (adjust based on your needs)
if ($_SESSION['dept'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

try {
    // Process auto-logout if it's after 10 PM
    $current_hour = date('H');
    if ($current_hour >= 22) {
        processAutoLogout($conn);
    }
    
    // Get all employees with their login status
    $sql = "SELECT 
                e.EmpID,
                e.FirstName,
                e.LastName,
                CONCAT(e.FirstName, ' ', e.LastName) as FullName,
                e.Email,
                d.DeptName,
                d.DeptID,
                -- Get first login time of the day
                COALESCE(
                    (SELECT MIN(TimeIn) 
                     FROM tblloginhistory lh 
                     WHERE lh.EmpID = e.EmpID 
                     AND DATE(lh.LogDate) = CURDATE()
                     AND lh.TimeIn IS NOT NULL
                     AND lh.TimeIn != '00:00:00'),
                    '--'
                ) as FirstTimeIn,
                -- Get last logout time of the day
                COALESCE(
                    (SELECT MAX(TimeOut) 
                     FROM tblloginhistory lh 
                     WHERE lh.EmpID = e.EmpID 
                     AND DATE(lh.LogDate) = CURDATE()
                     AND lh.TimeOut IS NOT NULL
                     AND lh.TimeOut != '00:00:00'),
                    '--'
                ) as LastTimeOut,
                -- Check if currently active (logged in but not out)
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM tblloginhistory lh 
                        WHERE lh.EmpID = e.EmpID 
                        AND DATE(lh.LogDate) = CURDATE()
                        AND (lh.TimeOut IS NULL OR lh.TimeOut = '00:00:00')
                        AND lh.TimeIn IS NOT NULL
                    ) THEN 'Active'
                    ELSE 'Inactive'
                END as CurrentStatus
            FROM tblemployees e
            LEFT JOIN tbldepartment d ON e.DeptID = d.DeptID
            ORDER BY e.LastName, e.FirstName";
    
    $result = $conn->query($sql);
    
    $employees = [];
    while ($row = $result->fetch_assoc()) {
        // Adjust status based on time of day
        $current_hour = date('H');
        if ($current_hour >= 22 || $current_hour < 5) {
            // After 10 PM or before 5 AM, everyone is inactive
            $row['CurrentStatus'] = 'Inactive';
        }
        $employees[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $employees,
        'current_time' => date('H:i:s')
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Function to process auto-logout at 10 PM
function processAutoLogout($conn) {
    $today = date('Y-m-d');
    
    // Set logout time to 22:00:00 for all active sessions
    $update_sql = "UPDATE tblloginhistory 
                  SET TimeOut = '22:00:00' 
                  WHERE DATE(LogDate) = ? 
                  AND (TimeOut IS NULL OR TimeOut = '00:00:00')
                  AND TimeIn IS NOT NULL";
    
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("s", $today);
    $update_stmt->execute();
}

$conn->close();
?>