<?php
session_start();
include("config.php");

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = "Username and password are required";
    } else {
        // Check login hours (5 AM to 10 PM only)
        $current_hour = date('H');
        if ($current_hour >= 22 || $current_hour < 5) {
            $error = "Login is only allowed between 5:00 AM and 10:00 PM";
        } else {
            // Check user credentials
            $sql = "SELECT EmpID, FirstName, LastName, DeptID, PASSWORD FROM tblEmployees WHERE Email=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $stored_password = $row['PASSWORD'];
                
                $password_valid = false;
                
                // Check password (with backward compatibility)
                if (strpos($stored_password, '$2y$') === 0) {
                    $password_valid = password_verify($password, $stored_password);
                } else {
                    $password_valid = ($password === $stored_password);
                    
                    // Upgrade to hashed password if using plain text
                    if ($password_valid) {
                        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
                        $update_sql = "UPDATE tblEmployees SET PASSWORD=? WHERE EmpID=?";
                        $update_stmt = $conn->prepare($update_sql);
                        $update_stmt->bind_param("si", $hashed_password, $row['EmpID']);
                        $update_stmt->execute();
                    }
                }

                if ($password_valid) {
                    // Record login time
                    recordLoginTime($row['EmpID'], $conn);
                    
                    // Set session variables
                    session_regenerate_id(true);
                    $_SESSION['user'] = $row['EmpID'];
                    $_SESSION['dept'] = $row['DeptID'];
                    $_SESSION['first_name'] = $row['FirstName'];
                    $_SESSION['last_name'] = $row['LastName'];
                    
                    // Redirect based on department
                    $dept_sql = "SELECT DeptName FROM tblDepartment WHERE DeptID=?";
                    $dept_stmt = $conn->prepare($dept_sql);
                    $dept_stmt->bind_param("i", $row['DeptID']);
                    $dept_stmt->execute();
                    $dept_res = $dept_stmt->get_result();
                    $dept = $dept_res->fetch_assoc();
                    
                    if ($dept['DeptName'] === "Admin") {
                        header("Location: admin.php");
                    } else if ($dept['DeptName'] === "Secretary") {
                        header("Location: secretary.php");
                    } else {
                        header("Location: collector.php");
                    }
                    exit();
                } else {
                    $error = "Invalid username or password";
                }
            } else {
                $error = "Invalid username or password";
            }
        }
    }
}

// Function to record login time
function recordLoginTime($empId, $conn) {
    $today = date('Y-m-d');
    $login_time = date('H:i:s');
    
    // Check if employee already has an active session today (logged in but not out)
    $check_sql = "SELECT LogID FROM tblloginhistory 
                  WHERE EmpID = ? AND DATE(LogDate) = ? 
                  AND (TimeOut IS NULL OR TimeOut = '00:00:00')";
    
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("is", $empId, $today);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows == 0) {
        // No active session, create new record
        $insert_sql = "INSERT INTO tblloginhistory (EmpID, LogDate, TimeIn) VALUES (?, ?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param("iss", $empId, $today, $login_time);
        $insert_stmt->execute();
    }
    // If already has active session, don't create new record (prevents multiple TimeIns)
}

// Display login form
include("../html/login.html");
?>