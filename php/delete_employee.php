<?php
session_start();
include("config.php");
header('Content-Type: application/json');

// Check if admin is logged in
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verify admin password first
    $adminPassword = $_POST['admin_password'] ?? '';
    $empid = $_POST['empid'];
    
    // Get admin's hashed password
    $adminId = $_SESSION['user'];
    $check_sql = "SELECT PASSWORD FROM tblEmployees WHERE EmpID = ? AND DeptID = 1";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $adminId);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Admin not found"]);
        exit();
    }
    
    $admin = $result->fetch_assoc();
    $check_stmt->close();
    
    // Verify password
    if (!password_verify($adminPassword, $admin['PASSWORD'])) {
        echo json_encode(["success" => false, "message" => "Incorrect admin password"]);
        exit();
    }
    
    // Proceed with deletion
    $sql = "DELETE FROM tblEmployees WHERE EmpID=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $empid);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Employee deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Delete failed: " . $stmt->error]);
    }
    $stmt->close();
}
?>