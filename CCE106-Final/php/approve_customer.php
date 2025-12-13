<?php
header('Content-Type: application/json');
session_start();
include("config.php");

// Only admin can approve
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Admin only']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit();
}

// Get data
$applicationId = intval($_POST['application_id'] ?? 0);
$action = trim($_POST['action'] ?? ''); // 'approve' or 'reject'
$loanAmount = floatval($_POST['loan_amount'] ?? 0);
$dueDate = trim($_POST['due_date'] ?? '');
$reason = trim($_POST['reason'] ?? '');
$notificationId = intval($_POST['notification_id'] ?? 0);

if ($applicationId <= 0 || !in_array($action, ['approve', 'reject'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    // 1. Get customer details from requirements
    $stmt = $conn->prepare("
        SELECT FirstName, LastName, BusinessName, PhoneNumber, CustomerAddress 
        FROM tblrequirements 
        WHERE ApplicationID = ? AND Status = 'Submitted'
    ");
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Application not found or already processed");
    }
    
    $customer = $result->fetch_assoc();
    $stmt->close();
    
    if ($action === 'approve') {
        // Validate loan data
        if ($loanAmount <= 0) {
            throw new Exception("Loan amount must be greater than 0");
        }
        
        if (empty($dueDate)) {
            throw new Exception("Due date is required");
        }
        
        // Calculate total amount with 5% interest
        $interest = $loanAmount * 0.05;
        $totalAmount = $loanAmount + $interest;
        
        // Calculate per day (assuming 30-day month)
        $daysDiff = max(1, (strtotime($dueDate) - time()) / (60 * 60 * 24));
        $perDay = $totalAmount / $daysDiff;
        
        // 2. Insert into tblcustomeracc
        $insertCustomer = $conn->prepare("
            INSERT INTO tblcustomeracc 
            (FirstName, LastName, BusinessName, Address, PhoneNum, LoanAmount, 
             AmountPaid, DueDate, TotalAmount, PerDay, Status) 
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'Active')
        ");
        $insertCustomer->bind_param(
            "sssssdssd", 
            $customer['FirstName'],
            $customer['LastName'],
            $customer['BusinessName'],
            $customer['CustomerAddress'],
            $customer['PhoneNumber'],
            $loanAmount,
            $dueDate,
            $totalAmount,
            $perDay
        );
        
        if (!$insertCustomer->execute()) {
            throw new Exception("Failed to add customer: " . $conn->error);
        }
        
        $customerId = $insertCustomer->insert_id;
        $insertCustomer->close();
        
        // 3. Update requirement status
        $updateReq = $conn->prepare("
            UPDATE tblrequirements 
            SET Status = 'Approved', 
                ApprovedBy = ?, 
                ApprovedAt = NOW(),
                CustomerID = ?
            WHERE ApplicationID = ?
        ");
        $adminName = $_SESSION['user'];
        $updateReq->bind_param("sii", $adminName, $customerId, $applicationId);
        $updateReq->execute();
        $updateReq->close();
        
        // 4. Create success notification for secretary
        $msg = "Customer " . $customer['FirstName'] . " " . $customer['LastName'] . 
               " approved. Loan: ₱" . number_format($loanAmount, 2) . 
               ", Due: " . $dueDate;
        
        $meta = json_encode([
            'application_id' => $applicationId,
            'customer_id' => $customerId,
            'action' => 'approved',
            'loan_amount' => $loanAmount,
            'due_date' => $dueDate
        ]);
        
        $notifStmt = $conn->prepare("
            INSERT INTO tblnotifications (notif_msg, type, is_read, meta, created_by) 
            VALUES (?, 'customer_approved', 0, ?, ?)
        ");
        $notifStmt->bind_param("sss", $msg, $meta, $_SESSION['user']);
        $notifStmt->execute();
        $notifStmt->close();
        
        $message = "Customer approved! Added to system with Customer ID: " . $customerId;
        
    } else {
        // Reject action
        $updateReq = $conn->prepare("
            UPDATE tblrequirements 
            SET Status = 'Rejected', 
                ApprovedBy = ?, 
                ApprovedAt = NOW()
            WHERE ApplicationID = ?
        ");
        $adminName = $_SESSION['user'];
        $updateReq->bind_param("si", $adminName, $applicationId);
        $updateReq->execute();
        $updateReq->close();
        
        // Create rejection notification for secretary
        $msg = "Customer " . $customer['FirstName'] . " " . $customer['LastName'] . 
               " was rejected. Reason: " . ($reason ?: 'No reason provided');
        
        $meta = json_encode([
            'application_id' => $applicationId,
            'action' => 'rejected',
            'reason' => $reason
        ]);
        
        $notifStmt = $conn->prepare("
            INSERT INTO tblnotifications (notif_msg, type, is_read, meta, created_by) 
            VALUES (?, 'customer_rejected', 0, ?, ?)
        ");
        $notifStmt->bind_param("sss", $msg, $meta, $_SESSION['user']);
        $notifStmt->execute();
        $notifStmt->close();
        
        $message = "Customer application rejected";
    }
    
    // 5. Mark the original notification as read
    if ($notificationId > 0) {
        $markRead = $conn->prepare("
            UPDATE tblnotifications 
            SET is_read = 1 
            WHERE notif_id = ?
        ");
        $markRead->bind_param("i", $notificationId);
        $markRead->execute();
        $markRead->close();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'customer_id' => isset($customerId) ? $customerId : null
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    
    error_log("Approve customer error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>