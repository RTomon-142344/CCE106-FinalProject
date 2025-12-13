/*
SQLyog Community v13.3.1 (64 bit)
MySQL - 10.4.32-MariaDB : Database - dblending
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`dblending` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `dblending`;

/*Table structure for table `tblcustomeracc` */

DROP TABLE IF EXISTS `tblcustomeracc`;

CREATE TABLE `tblcustomeracc` (
  `CustomerID` int(11) NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `BusinessName` varchar(50) NOT NULL,
  `Address` varchar(100) DEFAULT NULL,
  `PhoneNum` varchar(15) DEFAULT NULL,
  `LoanAmount` decimal(10,2) DEFAULT NULL,
  `AmountPaid` decimal(10,2) DEFAULT NULL,
  `DueDate` date DEFAULT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `PerDay` decimal(10,2) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Active',
  `Balance` decimal(10,2) GENERATED ALWAYS AS (`TotalAmount` - `AmountPaid`) STORED,
  PRIMARY KEY (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblcustomeracc` */

insert  into `tblcustomeracc`(`CustomerID`,`FirstName`,`LastName`,`BusinessName`,`Address`,`PhoneNum`,`LoanAmount`,`AmountPaid`,`DueDate`,`TotalAmount`,`PerDay`,`Status`) values 
(1,'Mari','Jose','ChristmasStore','MaynilaTunga','09875643121',99999999.99,0.00,'2120-12-25',99999999.99,24154.62,'Active'),
(2,'Mike','Top','Sari Sari','Prk Durian','0905456263',5000.00,0.00,'2025-12-31',5250.00,296.61,'Active');

/*Table structure for table `tbldepartment` */

DROP TABLE IF EXISTS `tbldepartment`;

CREATE TABLE `tbldepartment` (
  `DeptID` int(11) NOT NULL AUTO_INCREMENT,
  `DeptName` varchar(50) NOT NULL,
  PRIMARY KEY (`DeptID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tbldepartment` */

insert  into `tbldepartment`(`DeptID`,`DeptName`) values 
(1,'Admin'),
(2,'Secretary'),
(3,'Collector');

/*Table structure for table `tblemployees` */

DROP TABLE IF EXISTS `tblemployees`;

CREATE TABLE `tblemployees` (
  `EmpID` int(11) NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `DeptID` int(11) DEFAULT NULL,
  PRIMARY KEY (`EmpID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DeptID` (`DeptID`),
  CONSTRAINT `tblemployees_ibfk_1` FOREIGN KEY (`DeptID`) REFERENCES `tbldepartment` (`DeptID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblemployees` */

insert  into `tblemployees`(`EmpID`,`FirstName`,`LastName`,`Email`,`PASSWORD`,`DeptID`) values 
(1,'johnny','Doejali','admin@gmail.com','$2y$10$HF7tGQdAaq.f7AwpZ06NWeuV/sHTgoOwSlS.MtwQSw.y9hKFsOXF2',1),
(6,'Miss','Ssim','TestCollector@gmail.com','$2y$10$1mbW6MMZsfr7rDEtX61R2egJ5g41Rr4bXYEu7Cwf9OubLITTe5N3e',3),
(8,'jane','doe','jane@gmail.com','$2y$10$6VHR082WJSPSpfYUDRrHCe9XX.mG8GO6y0gp5ZT6Sdh2BMQDNgrA2',2);

/*Table structure for table `tblloginhistory` */

DROP TABLE IF EXISTS `tblloginhistory`;

CREATE TABLE `tblloginhistory` (
  `LogID` int(11) NOT NULL AUTO_INCREMENT,
  `EmpID` int(11) DEFAULT NULL,
  `LogDate` date DEFAULT NULL,
  `TimeIn` time DEFAULT NULL,
  `TimeOut` time DEFAULT NULL,
  PRIMARY KEY (`LogID`),
  KEY `EmpID` (`EmpID`),
  CONSTRAINT `tblloginhistory_ibfk_1` FOREIGN KEY (`EmpID`) REFERENCES `tblemployees` (`EmpID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblloginhistory` */

/*Table structure for table `tblnotifications` */

DROP TABLE IF EXISTS `tblnotifications`;

CREATE TABLE `tblnotifications` (
  `notif_id` int(11) NOT NULL AUTO_INCREMENT,
  `notif_msg` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notif_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblnotifications` */

insert  into `tblnotifications`(`notif_id`,`notif_msg`,`type`,`is_read`,`meta`,`created_by`,`created_at`) values 
(3,'New customer approval needed: Mike Top (Sari Sari)','customer_approval',1,'{\"application_id\":2,\"customer_name\":\"Mike Top\",\"business_name\":\"Sari Sari\",\"phone\":\"0905456263\",\"address\":\"Prk Durian\",\"action_required\":\"customer_approval\"}','8','2025-12-13 14:10:49'),
(4,'Customer Mike Top approved. Loan: ₱5,000.00, Due: 2025-12-31','customer_approved',0,'{\"application_id\":2,\"customer_id\":2,\"action\":\"approved\",\"loan_amount\":5000,\"due_date\":\"2025-12-31\"}','1','2025-12-13 14:11:39');

/*Table structure for table `tblpaymenthistory` */

DROP TABLE IF EXISTS `tblpaymenthistory`;

CREATE TABLE `tblpaymenthistory` (
  `PaymentID` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerID` int(11) DEFAULT NULL,
  `EmpID` int(11) DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `PaymentDate` date DEFAULT NULL,
  PRIMARY KEY (`PaymentID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `EmpID` (`EmpID`),
  CONSTRAINT `tblpaymenthistory_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `tblcustomeracc` (`CustomerID`),
  CONSTRAINT `tblpaymenthistory_ibfk_2` FOREIGN KEY (`EmpID`) REFERENCES `tblemployees` (`EmpID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblpaymenthistory` */

/*Table structure for table `tblrequirements` */

DROP TABLE IF EXISTS `tblrequirements`;

CREATE TABLE `tblrequirements` (
  `ApplicationID` int(100) NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `BusinessName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `CustomerAddress` varchar(150) NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'Pending',
  `ApprovedBy` varchar(100) DEFAULT NULL,
  `ApprovedAt` datetime DEFAULT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ApplicationID`),
  KEY `fk_requirements_customer` (`CustomerID`),
  CONSTRAINT `fk_requirements_customer` FOREIGN KEY (`CustomerID`) REFERENCES `tblcustomeracc` (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblrequirements` */

insert  into `tblrequirements`(`ApplicationID`,`FirstName`,`LastName`,`BusinessName`,`PhoneNumber`,`CustomerAddress`,`Status`,`ApprovedBy`,`ApprovedAt`,`CustomerID`) values 
(2,'Mike','Top','Sari Sari','0905456263','Prk Durian','Approved','1','2025-12-13 14:11:39',2);

/* Procedure structure for procedure `ProcessPayment` */

/*!50003 DROP PROCEDURE IF EXISTS  `ProcessPayment` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `ProcessPayment`(
    IN p_CustomerID INT,
    IN p_Amount DECIMAL(10,2),
    IN p_EmpID INT,
    OUT p_PaymentID INT,
    OUT p_Success BOOLEAN,
    OUT p_Message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_TotalAmount DECIMAL(10,2);
    DECLARE v_CurrentAmountPaid DECIMAL(10,2) DEFAULT 0;
    DECLARE v_NewAmountPaid DECIMAL(10,2);
    DECLARE v_CustomerExists BOOLEAN DEFAULT FALSE;
    DECLARE v_NextPaymentID INT;
    
    -- Error handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_Success = FALSE;
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, 
                                   @errno = MYSQL_ERRNO, 
                                   @text = MESSAGE_TEXT;
        SET p_Message = CONCAT('Database error: ', @errno, ' (', @sqlstate, '): ', @text);
    END;
    
    -- Check if customer exists and get current amounts
    SELECT 
        COUNT(*),
        COALESCE(TotalAmount, 0),
        COALESCE(AmountPaid, 0)
    INTO 
        v_CustomerExists,
        v_TotalAmount,
        v_CurrentAmountPaid
    FROM tblCustomerAcc 
    WHERE CustomerID = p_CustomerID
    LOCK IN SHARE MODE;
    
    -- Validate customer and amount
    IF v_CustomerExists = 0 THEN
        SET p_Success = FALSE;
        SET p_Message = 'Customer not found';
        LEAVE proc_label;
    END IF;
    
    -- Calculate new amount paid
    SET v_NewAmountPaid = v_CurrentAmountPaid + p_Amount;
    
    -- Validate payment amount
    IF p_Amount <= 0 THEN
        SET p_Success = FALSE;
        SET p_Message = 'Payment amount must be greater than zero';
        LEAVE proc_label;
    END IF;
    
    IF v_NewAmountPaid > v_TotalAmount THEN
        SET p_Success = FALSE;
        SET p_Message = 'Payment amount exceeds total loan amount';
        LEAVE proc_label;
    END IF;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Manually calculate the next PaymentID for a consistent, gapless sequence
    SELECT COALESCE(MAX(PaymentID), 0) + 1 INTO v_NextPaymentID FROM tblpaymenthistory;

    -- Insert payment record with the manually calculated ID
    INSERT INTO tblpaymenthistory (PaymentID, CustomerID, EmpID, Amount, PaymentDate)
    VALUES (v_NextPaymentID, p_CustomerID, p_EmpID, p_Amount, CURDATE());

    -- Set the output PaymentID
    SET p_PaymentID = v_NextPaymentID;
    
    -- Update customer's amount paid
    UPDATE tblCustomerAcc 
    SET AmountPaid = v_NewAmountPaid 
    WHERE CustomerID = p_CustomerID;
    
    -- Commit transaction
    COMMIT;
    
    -- Set success response
    SET p_Success = TRUE;
    SET p_Message = 'Payment processed successfully';
    
END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
