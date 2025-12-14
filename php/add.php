<?php
session_start();
include("config.php");

if (!isset($_SESSION['user']) || $_SESSION['dept'] != 2) {
    header("Location: login.php");
    exit();
}

// Initialize variables for customer data
$customerData = [
    'firstname' => '',
    'lastname' => '',
    'businessname' => '',
    'address' => '',
    'phonenum' => '',
    'applicationid' => ''
];

// Check if application_id is provided in query parameter
if (isset($_GET['application_id'])) {
    $applicationId = intval($_GET['application_id']);
    
    // Fetch customer data from tblrequirements
    $stmt = $conn->prepare("
        SELECT ApplicationID, FirstName, LastName, BusinessName, CustomerAddress, PhoneNumber 
        FROM tblrequirements 
        WHERE ApplicationID = ?
    ");
    
    if ($stmt) {
        $stmt->bind_param("i", $applicationId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $customerData['applicationid'] = $row['ApplicationID'];
            $customerData['firstname'] = $row['FirstName'];
            $customerData['lastname'] = $row['LastName'];
            $customerData['businessname'] = $row['BusinessName'];
            $customerData['address'] = $row['CustomerAddress'];
            $customerData['phonenum'] = $row['PhoneNumber'];
        }
        
        $stmt->close();
    }
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName   = $_POST['firstname'] ?? '';
    $lastName    = $_POST['lastname'] ?? '';
    $business    = $_POST['businessname'] ?? '';
    $address     = $_POST['address'] ?? '';
    $phone       = $_POST['phonenum'] ?? '';
    $loanAmount  = floatval($_POST['loanamount'] ?? 0);
    $dueDate     = $_POST['duedate'] ?? '';
    $totalAmount = floatval($_POST['totalamount'] ?? 0);
    $perDay      = floatval($_POST['perday'] ?? 0);
    
    // Get secretary's name for notification
    $secretaryId = $_SESSION['user'];
    $stmt = $conn->prepare("SELECT FirstName, LastName FROM tblemployees WHERE EmpID = ?");
    $stmt->bind_param("i", $secretaryId);
    $stmt->execute();
    $result = $stmt->get_result();
    $secretary = $result->fetch_assoc();
    $secretaryName = $secretary['FirstName'] . ' ' . $secretary['LastName'];
    
    // Format the date safely
    if (!empty($dueDate)) {
        $dueDate = date('Y-m-d', strtotime($dueDate));
    }
    
    if (empty($firstName) || empty($lastName) || empty($business) || $loanAmount <= 0 || empty($dueDate)) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // 1. Insert into tblrequirements (pending approval)
        $stmt1 = $conn->prepare("
            INSERT INTO tblrequirements 
            (FirstName, LastName, BusinessName, CustomerAddress, PhoneNumber, 
             LoanAmount, DueDate, TotalAmount, PerDay, Status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        ");
        
        if (!$stmt1) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt1->bind_param("ssssdssdd", 
            $firstName, $lastName, $business, $address, $phone,
            $loanAmount, $dueDate, $totalAmount, $perDay
        );
        
        if (!$stmt1->execute()) {
            throw new Exception("Insert to requirements failed: " . $stmt1->error);
        }
        
        $applicationId = $conn->insert_id;
        $stmt1->close();
        
        // 2. Create notification for admin
        $notificationMsg = "New customer approval needed: $firstName $lastName ($business)";
        
        // Prepare meta data
        $metaData = [
            'application_id' => $applicationId,
            'customer_name' => "$firstName $lastName",
            'business_name' => $business,
            'phone' => $phone,
            'address' => $address,
            'loan_amount' => $loanAmount,
            'due_date' => $dueDate,
            'total_amount' => $totalAmount,
            'per_day' => $perDay,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'action_required' => 'customer_approval'
        ];
        
        $metaJson = json_encode($metaData);

        $stmt2 = $conn->prepare("
            INSERT INTO tblnotifications 
            (notif_msg, type, is_read, meta, created_by, created_at) 
            VALUES (?, 'customer_approval', 0, ?, ?, NOW())
        ");

        if (!$stmt2) {
            throw new Exception("Prepare notification failed: " . $conn->error);
        }

        // Make sure to use the variable, not the function call
        $stmt2->bind_param("sss", $notificationMsg, $metaJson, $secretaryName);
        
        if (!$stmt2->execute()) {
            throw new Exception("Insert notification failed: " . $stmt2->error);
        }
        
        $stmt2->close();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Customer request submitted for admin approval!"
        ]);
        
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        echo json_encode([
            "success" => false, 
            "message" => "Error: " . $e->getMessage()
        ]);
    }
    
    $conn->close();
    exit();
} else {
    // Render the HTML with customer data
    $html = file_get_contents("../html/add.html");
    
    // Pass customer data to JavaScript
    echo "<script>window.customerData = " . json_encode($customerData) . ";</script>";
    echo $html;
}
?>