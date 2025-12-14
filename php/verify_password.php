<?php
session_start();
require_once 'config.php'; // Use your existing config

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in', 'redirect' => 'login.php']);
    exit;
}

if (!isset($_POST['password'])) {
    echo json_encode(['success' => false, 'message' => 'Password required']);
    exit;
}

$inputPassword = $_POST['password'];
$userId = $_SESSION['user'];

try {
    $sql = "SELECT PASSWORD FROM tblEmployees WHERE EmpID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $employee = $result->fetch_assoc();
    
    if ($employee) {
        $stored_password = $employee['PASSWORD'];
        
        // Check if password is hashed or plain text
        if (strpos($stored_password, '$2y$') === 0) {
            // Hashed password
            $password_valid = password_verify($inputPassword, $stored_password);
        } else {
            // Plain text password (legacy)
            $password_valid = ($inputPassword === $stored_password);
        }
        
        if ($password_valid) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>