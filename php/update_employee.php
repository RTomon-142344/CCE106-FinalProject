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
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $email = $_POST['email'];
    $deptid = $_POST['deptid'];
    
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
    
    // Check if email already exists for another employee
    $check_sql = "SELECT EmpID FROM tblEmployees WHERE Email = ? AND EmpID != ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $email, $empid);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists for another employee"]);
        exit();
    }
    $check_stmt->close();
    
    // Build update query
    $sql = "UPDATE tblEmployees SET FirstName = ?, LastName = ?, Email = ?, DeptID = ?";
    $params = [$firstname, $lastname, $email, $deptid];
    $types = "sssi";
    
    // Add password if provided
    if (!empty($_POST['password'])) {
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $sql .= ", PASSWORD = ?";
        $params[] = $password;
        $types .= "s";
    }
    
    $sql .= " WHERE EmpID = ?";
    $params[] = $empid;
    $types .= "i";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Employee updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed: " . $stmt->error]);
    }
    $stmt->close();
}
?>