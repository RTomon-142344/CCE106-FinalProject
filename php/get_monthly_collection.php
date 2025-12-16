<?php
session_start();
include("config.php");
header('Content-Type: application/json');

// Check authorization
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 2) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Get month and year from query parameters (default to current month)
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

// Validate month and year
if ($month < 1 || $month > 12) {
    $month = date('n');
}
if ($year < 2020 || $year > 2100) {
    $year = date('Y');
}

try {
    // Query to get total collection for the month
    $sql = "SELECT COALESCE(SUM(Amount), 0) as total_collection
            FROM tblpaymenthistory
            WHERE YEAR(PaymentDate) = ?
            AND MONTH(PaymentDate) = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $month);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'month' => $month,
            'year' => $year,
            'total_collection' => floatval($row['total_collection'])
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'month' => $month,
            'year' => $year,
            'total_collection' => 0
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>