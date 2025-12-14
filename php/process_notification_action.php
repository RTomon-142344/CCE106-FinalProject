<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if (!isset($_POST['notification_id']) || !isset($_POST['action'])) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

$notificationId = $_POST['notification_id'];
$action = $_POST['action'];

// Start transaction
$conn->begin_transaction();

try {
    // Get notification details
    $sql = "SELECT * FROM tblnotifications WHERE notif_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $notification = $result->fetch_assoc();
    
    if (!$notification) {
        throw new Exception("Notification not found");
    }
    
    // Parse meta data
    $meta = json_decode($notification['meta'], true);
    
    if ($action === 'approve') {
        // Get the application ID from meta
        $applicationId = $meta['application_id'] ?? 0;
        
        if ($applicationId <= 0) {
            throw new Exception("Application ID not found in notification");
        }
        
        // Get admin info
        $admin_sql = "SELECT FirstName, LastName FROM tblEmployees WHERE EmpID = ?";
        $admin_stmt = $conn->prepare($admin_sql);
        $admin_stmt->bind_param("i", $_SESSION['user']);
        $admin_stmt->execute();
        $admin_result = $admin_stmt->get_result();
        $admin = $admin_result->fetch_assoc();
        $created_by = $admin['FirstName'] . ' ' . $admin['LastName'];
        
        // Get customer details from tblrequirements
        $cust_sql = "SELECT * FROM tblrequirements WHERE ApplicationID = ?";
        $cust_stmt = $conn->prepare($cust_sql);
        $cust_stmt->bind_param("i", $applicationId);
        $cust_stmt->execute();
        $cust_result = $cust_stmt->get_result();
        $customer = $cust_result->fetch_assoc();
        
        if (!$customer) {
            throw new Exception("Customer not found in requirements");
        }
        
        // Insert into tblcustomeracc with all loan details
        $sql = "INSERT INTO tblcustomeracc 
                (FirstName, LastName, BusinessName, Address, PhoneNum, 
                 LoanAmount, AmountPaid, DueDate, TotalAmount, PerDay, Status) 
                VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, ?, ?, 'Active')";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "ssssdssdd",
            $customer['FirstName'],
            $customer['LastName'],
            $customer['BusinessName'],
            $customer['CustomerAddress'],
            $customer['PhoneNumber'],
            $customer['LoanAmount'],
            $customer['DueDate'],
            $customer['TotalAmount'],
            $customer['PerDay']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to add customer: " . $stmt->error);
        }
        
        $customerId = $stmt->insert_id;
        
        // Update tblrequirements status
        $update_sql = "UPDATE tblrequirements 
                      SET Status = 'Approved', 
                          ApprovedBy = ?, 
                          ApprovedAt = NOW(), 
                          CustomerID = ? 
                      WHERE ApplicationID = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("sii", $created_by, $customerId, $applicationId);
        $update_stmt->execute();
        
        // Create approval notification
        $approvalMsg = "Customer {$customer['FirstName']} {$customer['LastName']} approved. " .
                      "Loan: ₱" . number_format($customer['LoanAmount'], 2) . ", " .
                      "Due: {$customer['DueDate']}";
        
        $approvalMeta = [
            'application_id' => $applicationId,
            'customer_id' => $customerId,
            'action' => 'approved',
            'loan_amount' => $customer['LoanAmount'],
            'due_date' => $customer['DueDate']
        ];
        
        // Store JSON in variable first
        $approvalMetaJson = json_encode($approvalMeta);
        
        $notif_sql = "INSERT INTO tblnotifications 
                     (notif_msg, type, is_read, meta, created_by, created_at) 
                     VALUES (?, 'customer_approved', 0, ?, ?, NOW())";
        $notif_stmt = $conn->prepare($notif_sql);
        $notif_stmt->bind_param("sss", $approvalMsg, $approvalMetaJson, $created_by);
        $notif_stmt->execute();
        
        $message = "Customer approved and added to system!";
        
    } elseif ($action === 'reject') {
        // Reject - update requirement status
        $applicationId = $meta['application_id'] ?? 0;
        
        if ($applicationId > 0) {
            // Get admin info
            $admin_sql = "SELECT FirstName, LastName FROM tblEmployees WHERE EmpID = ?";
            $admin_stmt = $conn->prepare($admin_sql);
            $admin_stmt->bind_param("i", $_SESSION['user']);
            $admin_stmt->execute();
            $admin_result = $admin_stmt->get_result();
            $admin = $admin_result->fetch_assoc();
            $created_by = $admin['FirstName'] . ' ' . $admin['LastName'];
            
            $update_sql = "UPDATE tblrequirements 
                          SET Status = 'Rejected', 
                              ApprovedBy = ?, 
                              ApprovedAt = NOW() 
                          WHERE ApplicationID = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("si", $created_by, $applicationId);
            $update_stmt->execute();
            
            // Create rejection notification
            $rejectMsg = "Customer application rejected: {$meta['customer_name']} ({$meta['business_name']})";
            
            $rejectMeta = [
                'application_id' => $applicationId,
                'action' => 'rejected',
                'reason' => 'Admin rejected'
            ];
            
            // Store JSON in variable first
            $rejectMetaJson = json_encode($rejectMeta);
            
            $notif_sql = "INSERT INTO tblnotifications 
                         (notif_msg, type, is_read, meta, created_by, created_at) 
                         VALUES (?, 'customer_rejected', 0, ?, ?, NOW())";
            $notif_stmt = $conn->prepare($notif_sql);
            $notif_stmt->bind_param("sss", $rejectMsg, $rejectMetaJson, $created_by);
            $notif_stmt->execute();
        }
        
        $message = "Customer application rejected.";
    }
    
    // Mark original notification as read
    $sql = "UPDATE tblnotifications SET is_read = 1 WHERE notif_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => $message
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>