<?php
session_start();
include("config.php");

// Check login and admin
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    header("Location: login.php");
    exit();
}

// If GET request, show the form
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    include("../html/add-employee.html");
    exit();
}

// Handle POST request
header('Content-Type: application/json');

try {
    // Validate input
    $required_fields = ['firstname', 'lastname', 'email', 'password', 'deptid'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("All fields are required");
        }
    }

    $firstname = trim($_POST["firstname"]);
    $lastname = trim($_POST["lastname"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);
    $deptid = intval($_POST["deptid"]);

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Check password length
    if (strlen($password) < 8) {
        throw new Exception("Password must be at least 8 characters long");
    }

    // Check duplicate email
    $check = $conn->prepare("SELECT EmpID FROM tblEmployees WHERE Email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();
    
    if ($check->num_rows > 0) {
        throw new Exception("Email already exists");
    }
    $check->close();

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Insert employee
    $stmt = $conn->prepare("INSERT INTO tblEmployees (FirstName, LastName, Email, PASSWORD, DeptID) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $firstname, $lastname, $email, $hashed_password, $deptid);
    
    if (!$stmt->execute()) {
        throw new Exception("Database insert failed: " . $stmt->error);
    }
    
    // Commit transaction
    $conn->commit();
    $stmt->close();
    
    echo json_encode([
        "success" => true,
        "message" => "Employee added successfully"
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->rollback();
    }
    
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>