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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblcustomeracc` */

insert  into `tblcustomeracc`(`CustomerID`,`FirstName`,`LastName`,`BusinessName`,`Address`,`PhoneNum`,`LoanAmount`,`AmountPaid`,`DueDate`,`TotalAmount`,`PerDay`,`Status`) values 
(5,'Christlyn','tiger','Jollibee','Highway Tagum','987654321',56789.00,0.00,'2026-01-02',59628.45,3138.34,'Active');

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblemployees` */

insert  into `tblemployees`(`EmpID`,`FirstName`,`LastName`,`Email`,`PASSWORD`,`DeptID`) values 
(1,'johnny','Doejali','admin@gmail.com','$2y$10$HF7tGQdAaq.f7AwpZ06NWeuV/sHTgoOwSlS.MtwQSw.y9hKFsOXF2',1),
(6,'Miss','Ssim','TestCollector@gmail.com','$2y$10$1mbW6MMZsfr7rDEtX61R2egJ5g41Rr4bXYEu7Cwf9OubLITTe5N3e',3),
(8,'jane','doe','jane@gmail.com','$2y$10$6VHR082WJSPSpfYUDRrHCe9XX.mG8GO6y0gp5ZT6Sdh2BMQDNgrA2',2),
(9,'dsa','tiger','secretary@gmail.com','$2y$10$py4IV9LAhDD0QzTUSxq0D.soKjvKfCkM2aZjX2057NdallanxQcry',2),
(10,'Christlyn','Tuasoc','christlyn@gmail.com','$2y$10$7brw3kiFP6uAjghhoGqLN.PCSJn/QLlZTnlDRwtaQV5pPckyKi4QS',3),
(14,'johnny','tiger','secretary1@gmail.com','$2y$10$tR0eERDAL6JOxnv9adHJ9ei6w9LYQLnxSQ9L8afLBIGpnkgoYK43u',2);

/*Table structure for table `tblloginhistory` */

DROP TABLE IF EXISTS `tblloginhistory`;

CREATE TABLE `tblloginhistory` (
  `LogID` int(11) NOT NULL AUTO_INCREMENT,
  `EmpID` int(11) DEFAULT NULL,
  `LogDate` date DEFAULT NULL,
  `TimeIn` time DEFAULT NULL,
  `TimeOut` time DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`LogID`),
  KEY `EmpID` (`EmpID`),
  KEY `LogDate` (`LogDate`),
  KEY `EmpID_LogDate` (`EmpID`,`LogDate`),
  CONSTRAINT `tblloginhistory_ibfk_1` FOREIGN KEY (`EmpID`) REFERENCES `tblemployees` (`EmpID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblloginhistory` */

insert  into `tblloginhistory`(`LogID`,`EmpID`,`LogDate`,`TimeIn`,`TimeOut`,`CreatedAt`) values 
(1,1,'2025-12-14','08:30:00','12:00:00','2025-12-14 15:54:11'),
(2,1,'2025-12-14','13:00:00','08:59:58','2025-12-14 15:54:11'),
(3,6,'2025-12-14','09:15:00','17:30:00','2025-12-14 15:54:11'),
(4,8,'2025-12-14','08:45:00',NULL,'2025-12-14 15:54:11'),
(5,6,'2025-12-14','09:00:20','09:00:28','2025-12-14 16:00:20'),
(6,1,'2025-12-14','09:00:38','09:02:10','2025-12-14 16:00:38'),
(7,14,'2025-12-14','09:02:19','09:02:41','2025-12-14 16:02:19'),
(8,1,'2025-12-14','09:02:48','09:03:03','2025-12-14 16:02:48'),
(9,14,'2025-12-14','09:03:18','09:12:17','2025-12-14 16:03:18'),
(10,1,'2025-12-14','09:12:23','09:48:33','2025-12-14 16:12:23'),
(11,1,'2025-12-14','09:50:28','11:26:54','2025-12-14 16:50:28'),
(12,1,'2025-12-14','11:27:02','12:06:46','2025-12-14 18:27:02'),
(13,9,'2025-12-14','12:06:56','13:55:26','2025-12-14 19:06:56'),
(14,1,'2025-12-14','13:55:35','13:56:17','2025-12-14 20:55:35'),
(15,14,'2025-12-14','13:56:26','13:58:22','2025-12-14 20:56:26');

/*Table structure for table `tblnotifications` */

DROP TABLE IF EXISTS `tblnotifications`;

CREATE TABLE `tblnotifications` (
  `notif_id` int(11) NOT NULL AUTO_INCREMENT,
  `notif_msg` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `meta` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`notif_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblnotifications` */

insert  into `tblnotifications`(`notif_id`,`notif_msg`,`type`,`is_read`,`meta`,`created_by`,`created_at`,`status`,`description`) values 
(10,'New customer approval needed: Christlyn tiger (Jollibee)','customer_approval',1,'{\"application_id\":7,\"customer_name\":\"Christlyn tiger\",\"business_name\":\"Jollibee\",\"phone\":\"0987654321\",\"address\":\"Highway Tagum\",\"loan_amount\":56789,\"due_date\":\"2026-01-02\",\"total_amount\":59628.45,\"per_day\":3138.34,\"first_name\":\"Christlyn\",\"last_name\":\"tiger\",\"action_required\":\"customer_approval\"}','dsa tiger','2025-12-14 20:29:39',NULL,NULL),
(11,'Customer Christlyn tiger approved. Loan: ₱56,789.00, Due: 2026-01-02','customer_approved',0,'{\"application_id\":7,\"customer_id\":5,\"action\":\"approved\",\"loan_amount\":\"56789.00\",\"due_date\":\"2026-01-02\"}','johnny Doejali','2025-12-14 20:55:52',NULL,NULL);

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
  `LoanAmount` decimal(10,2) DEFAULT NULL,
  `DueDate` date DEFAULT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `PerDay` decimal(10,2) DEFAULT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'Pending',
  `ApprovedBy` varchar(100) DEFAULT NULL,
  `ApprovedAt` datetime DEFAULT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ApplicationID`),
  KEY `fk_requirements_customer` (`CustomerID`),
  CONSTRAINT `fk_requirements_customer` FOREIGN KEY (`CustomerID`) REFERENCES `tblcustomeracc` (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblrequirements` */

insert  into `tblrequirements`(`ApplicationID`,`FirstName`,`LastName`,`BusinessName`,`PhoneNumber`,`CustomerAddress`,`LoanAmount`,`DueDate`,`TotalAmount`,`PerDay`,`Status`,`ApprovedBy`,`ApprovedAt`,`CustomerID`) values 
(6,'christ','lyn','lol','09876543212','tagum',NULL,NULL,NULL,NULL,'Pending',NULL,NULL,NULL),
(7,'Christlyn','tiger','Jollibee','987654321','Highway Tagum',56789.00,'2026-01-02',59628.45,3138.34,'Approved','johnny Doejali','2025-12-14 20:55:52',5);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
