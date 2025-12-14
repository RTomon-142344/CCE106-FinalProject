<?php
session_start();
include("config.php");

if (isset($_SESSION['user'])) {
    // Record logout time for the current active session
    recordLogoutTime($_SESSION['user'], $conn);
}

// Clear session
$_SESSION = array();
session_destroy();

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login
header("Location: ../php/login.php");
exit();

// Function to record logout time
function recordLogoutTime($empId, $conn) {
    $today = date('Y-m-d');
    $logout_time = date('H:i:s');
    
    // Find the most recent login without logout for today
    $find_sql = "SELECT LogID FROM tblloginhistory 
                 WHERE EmpID = ? AND DATE(LogDate) = ? 
                 AND (TimeOut IS NULL OR TimeOut = '00:00:00')
                 ORDER BY TimeIn DESC 
                 LIMIT 1";
    
    $find_stmt = $conn->prepare($find_sql);
    $find_stmt->bind_param("is", $empId, $today);
    $find_stmt->execute();
    $find_result = $find_stmt->get_result();
    
    if ($find_result->num_rows > 0) {
        $row = $find_result->fetch_assoc();
        $update_sql = "UPDATE tblloginhistory SET TimeOut = ? WHERE LogID = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("si", $logout_time, $row['LogID']);
        $update_stmt->execute();
    }
}
?>