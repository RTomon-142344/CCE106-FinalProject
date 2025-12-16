<?php
session_start();
include("config.php");
header('Content-Type: application/json');

// Check authorization
if (!isset($_SESSION['user']) || $_SESSION['dept'] != 3) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get the date from query parameter (default to today)
$selectedDate = isset($_GET['paymentDate']) ? $_GET['paymentDate'] : date('Y-m-d');
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';

try {
    // Query to get ONLY customers who made payments on the selected date
    $sql = "SELECT 
                c.CustomerID,
                c.FirstName,
                c.LastName,
                c.BusinessName,
                c.LoanAmount,
                c.TotalAmount,
                c.AmountPaid,
                c.PerDay,
                c.DueDate,
                c.Status,
                (c.TotalAmount - c.AmountPaid) AS Balance,
                (CURDATE() > c.DueDate AND (c.TotalAmount - c.AmountPaid) > 0) AS IsOverdue,
                ((c.TotalAmount - c.AmountPaid) <= 0) AS IsPaid,
                
                -- Get the total amount paid on the selected date
                COALESCE(SUM(ph.Amount), 0) AS AmountPaidOnDate,
                
                -- Get the actual payment date(s)
                GROUP_CONCAT(DATE(ph.PaymentDate)) AS PaymentDates,
                
                -- Count of payments on this date
                COUNT(ph.PaymentID) AS PaymentCount
                
            FROM tblcustomeracc c
            INNER JOIN tblpaymenthistory ph ON c.CustomerID = ph.CustomerID
            WHERE c.Status = 'Active'
            AND DATE(ph.PaymentDate) = ?";
    
    // Add search filter if provided
    if (!empty($search)) {
        $sql .= " AND (c.FirstName LIKE '%$search%' OR 
                      c.LastName LIKE '%$search%' OR 
                      c.BusinessName LIKE '%$search%')";
    }
    
    $sql .= " GROUP BY c.CustomerID, c.FirstName, c.LastName, c.BusinessName, 
                       c.LoanAmount, c.TotalAmount, c.AmountPaid, c.PerDay, 
                       c.DueDate, c.Status
              ORDER BY c.LastName, c.FirstName";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $selectedDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = [
            'CustomerID' => $row['CustomerID'],
            'FirstName' => $row['FirstName'],
            'LastName' => $row['LastName'],
            'BusinessName' => $row['BusinessName'],
            'LoanAmount' => $row['LoanAmount'],
            'TotalAmount' => $row['TotalAmount'],
            'AmountPaid' => $row['AmountPaid'],
            'PerDay' => $row['PerDay'],
            'DueDate' => $row['DueDate'],
            'Balance' => $row['Balance'],
            'IsOverdue' => (bool)$row['IsOverdue'],
            'IsPaid' => (bool)$row['IsPaid'],
            'AmountPaidOnDate' => $row['AmountPaidOnDate'],
            'PaymentCount' => $row['PaymentCount'],
            'PaidOnDate' => true // Always true since we're filtering by payment date
        ];
    }
    
    echo json_encode($customers);
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>