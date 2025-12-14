<?php
header("Content-Type: application/json");
include("config.php");

$sql = "SELECT 
            CustomerID, 
            FirstName, 
            LastName, 
            BusinessName, 
            PhoneNum, 
            Address, 
            LoanAmount, 
            IFNULL(AmountPaid, 0) AS AmountPaid, 
            DueDate, 
            TotalAmount, 
            PerDay,
            (TotalAmount - IFNULL(AmountPaid, 0)) as Balance,
            Status
        FROM tblCustomerAcc 
        ORDER BY FirstName, LastName";

$result = $conn->query($sql);
$customers = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Format data
        $row['LoanAmount'] = floatval($row['LoanAmount']);
        $row['TotalAmount'] = floatval($row['TotalAmount']);
        $row['AmountPaid'] = floatval($row['AmountPaid']);
        $row['Balance'] = floatval($row['Balance']);
        $row['PerDay'] = floatval($row['PerDay']);
        
        $customers[] = $row;
    }
}

echo json_encode($customers);
$conn->close();
?>