<?php
header('Content-Type: application/json');
session_start();
include("config.php");

// Restrict to logged-in secretary
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 2) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Secretary only']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit();
}

$id = intval($_POST['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid customer ID']);
    exit();
}

// Fetch customer details
$stmt = $conn->prepare("
    SELECT ApplicationID, FirstName, LastName, BusinessName, PhoneNumber, CustomerAddress 
    FROM tblrequirements 
    WHERE ApplicationID = ? AND Status = 'Pending'
");
$stmt->bind_param("i", $id);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch customer']);
    exit();
}

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Customer not found or already processed']);
    exit();
}

$cust = $result->fetch_assoc();

// Notification message
$fullName = trim($cust['FirstName'] . ' ' . $cust['LastName']);
$msg = "New customer approval needed: " . $fullName . " (" . $cust['BusinessName'] . ")";

// Check for existing unread notification
$check = $conn->prepare("
    SELECT COUNT(*) 
    FROM tblnotifications 
    WHERE JSON_EXTRACT(meta, '$.application_id') = ? 
      AND is_read = 0
      AND type = 'customer_approval'
");
$check->bind_param("i", $id);

if (!$check->execute()) {
    // Fallback
    $check = $conn->prepare("
        SELECT COUNT(*) 
        FROM tblnotifications 
        WHERE notif_msg LIKE ? 
          AND is_read = 0
          AND type = 'customer_approval'
    ");
    $searchMsg = "%" . $fullName . "%";
    $check->bind_param("s", $searchMsg);
    $check->execute();
}

$check->bind_result($exists);
$check->fetch();
$check->close();

if ($exists > 0) {
    echo json_encode(['success' => false, 'message' => 'Notification already sent for this customer.']);
    exit();
}

// Insert notification
$meta = json_encode([
    'application_id' => $id,
    'customer_name' => $fullName,
    'business_name' => $cust['BusinessName'],
    'phone' => $cust['PhoneNumber'],
    'address' => $cust['CustomerAddress'],
    'action_required' => 'customer_approval'
]);

$secretaryName = $_SESSION['user'] ?? 'Secretary';

$insert = $conn->prepare("
    INSERT INTO tblnotifications (notif_msg, type, is_read, meta, created_by) 
    VALUES (?, 'customer_approval', 0, ?, ?)
");
$insert->bind_param("sss", $msg, $meta, $secretaryName);

if ($insert->execute()) {
    // Update requirement status
    $updateStmt = $conn->prepare("
        UPDATE tblrequirements 
        SET Status = 'Submitted' 
        WHERE ApplicationID = ?
    ");
    $updateStmt->bind_param("i", $id);
    $updateStmt->execute();
    $updateStmt->close();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Notification sent to admin for approval!'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send notification']);
}
?>