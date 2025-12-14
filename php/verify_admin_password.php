<?php
session_start();
include("config.php");
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $password = $_POST['password'];
    $adminId = $_SESSION['user']; // Assuming session stores admin user ID
    
    // Get admin's hashed password from database
    $sql = "SELECT PASSWORD FROM tblEmployees WHERE EmpID = ? AND DeptID = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Admin not found"]);
        exit();
    }
    
    $admin = $result->fetch_assoc();
    
    // Verify password
    if (password_verify($password, $admin['PASSWORD'])) {
        echo json_encode(["success" => true, "message" => "Password verified"]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
    }
    
    $stmt->close();
}
?>