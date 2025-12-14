<?php
session_start();
include("config.php");

header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['dept']) || $_SESSION['dept'] != 1) {
    echo json_encode([
        "success" => false, 
        "message" => "Unauthorized access. Only admin can delete records.",
        "type" => "error"
    ]);
    exit();
}

// Get POST data
$id = intval($_POST['id'] ?? 0);
$password = $_POST['password'] ?? '';

if ($id <= 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid customer ID.",
        "type" => "error"
    ]);
    exit();
}

if (empty($password)) {
    echo json_encode([
        "success" => false, 
        "message" => "Password is required.",
        "type" => "error"
    ]);
    exit();
}

// Get admin EmpID from session (from login.php, $_SESSION['user'] contains EmpID)
$adminEmpID = $_SESSION['user'] ?? 0;

if ($adminEmpID <= 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Admin session not found. Please login again.",
        "type" => "error"
    ]);
    exit();
}

// Get customer info for logging/notification
$customerName = "Unknown Customer";
try {
    $customerStmt = $conn->prepare("SELECT FirstName, LastName FROM tblcustomeracc WHERE CustomerID = ?");
    if ($customerStmt) {
        $customerStmt->bind_param("i", $id);
        $customerStmt->execute();
        $customerResult = $customerStmt->get_result();
        
        if ($customerResult->num_rows > 0) {
            $customerRow = $customerResult->fetch_assoc();
            $customerName = $customerRow['FirstName'] . ' ' . $customerRow['LastName'];
        }
        $customerStmt->close();
    }
} catch (Exception $e) {
    // Continue even if customer fetch fails
}

// Verify admin password using EmpID
try {
    $stmt = $conn->prepare("SELECT EmpID, FirstName, LastName, Password, DeptID, Email FROM tblemployees WHERE EmpID = ?");
    if (!$stmt) {
        throw new Exception("Database query preparation failed.");
    }
    
    $stmt->bind_param("i", $adminEmpID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false, 
            "message" => "Admin account not found. Please check your session.",
            "type" => "error"
        ]);
        exit();
    }

    $row = $result->fetch_assoc();
    $hashedPassword = $row['Password'];
    $adminName = $row['FirstName'] . ' ' . $row['LastName'];
    $adminId = $row['EmpID'];
    $adminDept = $row['DeptID'];
    $adminEmail = $row['Email'];

    // Check if user is actually an admin
    if ($adminDept != 1) {
        echo json_encode([
            "success" => false, 
            "message" => "You do not have admin privileges to delete records.",
            "type" => "error"
        ]);
        exit();
    }

    // Verify password
    if (!password_verify($password, $hashedPassword)) {
        echo json_encode([
            "success" => false, 
            "message" => "Incorrect password. Deletion canceled.",
            "type" => "error"
        ]);
        exit();
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Database error: " . $e->getMessage(),
        "type" => "error"
    ]);
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    // First, delete from dependent tables
    $deletePaymentHistory = $conn->prepare("DELETE FROM tblpaymenthistory WHERE CustomerID = ?");
    if (!$deletePaymentHistory) {
        throw new Exception("Failed to prepare payment history deletion.");
    }
    $deletePaymentHistory->bind_param("i", $id);
    $deletePaymentHistory->execute();
    $deletePaymentHistory->close();
    
    $deleteRequirements = $conn->prepare("DELETE FROM tblrequirements WHERE CustomerID = ?");
    if (!$deleteRequirements) {
        throw new Exception("Failed to prepare requirements deletion.");
    }
    $deleteRequirements->bind_param("i", $id);
    $deleteRequirements->execute();
    $deleteRequirements->close();
    
    // Then delete from main table
    $deleteCustomer = $conn->prepare("DELETE FROM tblcustomeracc WHERE CustomerID = ?");
    if (!$deleteCustomer) {
        throw new Exception("Failed to prepare customer deletion.");
    }
    $deleteCustomer->bind_param("i", $id);
    
    if ($deleteCustomer->execute()) {
        // Create a notification about the deletion
        try {
            $notificationMsg = "Customer '$customerName' was deleted by admin $adminName.";
            $notificationMeta = json_encode([
                "customer_id" => $id,
                "customer_name" => $customerName,
                "admin_id" => $adminId,
                "admin_name" => $adminName,
                "action" => "customer_deleted",
                "timestamp" => date("Y-m-d H:i:s")
            ]);
            
            $notificationStmt = $conn->prepare("INSERT INTO tblnotifications (notif_msg, type, meta, created_by) VALUES (?, 'customer_deleted', ?, ?)");
            if ($notificationStmt) {
                $notificationStmt->bind_param("sss", $notificationMsg, $notificationMeta, $adminEmail);
                $notificationStmt->execute();
                $notificationStmt->close();
            }
        } catch (Exception $e) {
            // Continue even if notification fails
        }
        
        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Customer '$customerName' has been permanently deleted.",
            "type" => "success"
        ]);
    } else {
        throw new Exception("Failed to delete customer record.");
    }
    
    $deleteCustomer->close();
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage(),
        "type" => "error"
    ]);
}

$conn->close();
?>