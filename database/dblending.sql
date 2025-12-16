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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblcustomeracc` */

insert  into `tblcustomeracc`(`CustomerID`,`FirstName`,`LastName`,`BusinessName`,`Address`,`PhoneNum`,`LoanAmount`,`AmountPaid`,`DueDate`,`TotalAmount`,`PerDay`,`Status`) values 
(6,'Christlyn','Tuasoc','Jollibee','Highway Tagum','9876543210',10000.00,700.00,'2025-12-31',10500.00,700.00,'Active');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblemployees` */

insert  into `tblemployees`(`EmpID`,`FirstName`,`LastName`,`Email`,`PASSWORD`,`DeptID`) values 
(1,'johnny','Doejali','admin@gmail.com','$2y$10$HF7tGQdAaq.f7AwpZ06NWeuV/sHTgoOwSlS.MtwQSw.y9hKFsOXF2',1),
(2,'johnny','Doejali','admin1@gmail.com','admin123',1),
(3,'Miss','Ssim','secretary2@gmail.com','secretary123',2),
(4,'jane','doe','collector3@gmail.com','collector123',3),
(9,'dsa','tiger','secretary@gmail.com','$2y$10$py4IV9LAhDD0QzTUSxq0D.soKjvKfCkM2aZjX2057NdallanxQcry',2),
(15,'test','collector','collector@gmail.com','$2y$10$7tKnBD.8PzFSBQG8KNyqsO5gYHXvEN1vZBueUb88AED3DJfP1M4CG',3);

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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblloginhistory` */

insert  into `tblloginhistory`(`LogID`,`EmpID`,`LogDate`,`TimeIn`,`TimeOut`,`CreatedAt`) values 
(16,1,'2025-12-16','12:07:14','12:09:30','2025-12-16 19:07:15'),
(17,9,'2025-12-16','12:09:41','12:10:59','2025-12-16 19:09:41'),
(18,1,'2025-12-16','12:11:08','12:13:20','2025-12-16 19:11:08'),
(19,9,'2025-12-16','12:13:34','12:37:02','2025-12-16 19:13:34'),
(20,1,'2025-12-16','12:37:11','12:38:00','2025-12-16 19:37:11'),
(21,15,'2025-12-16','12:38:07','16:07:00','2025-12-16 19:38:07'),
(22,9,'2025-12-16','16:07:10','16:14:34','2025-12-16 23:07:10'),
(23,1,'2025-12-16','16:14:39','16:16:14','2025-12-16 23:14:39'),
(24,9,'2025-12-16','16:16:26','17:15:02','2025-12-16 23:16:26'),
(25,1,'2025-12-16','17:15:11','17:15:39','2025-12-17 00:15:11'),
(26,9,'2025-12-16','17:15:49','17:16:11','2025-12-17 00:15:49');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblnotifications` */

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblpaymenthistory` */

insert  into `tblpaymenthistory`(`PaymentID`,`CustomerID`,`EmpID`,`Amount`,`PaymentDate`) values 
(1,6,15,700.00,'2025-12-16');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tblrequirements` */

insert  into `tblrequirements`(`ApplicationID`,`FirstName`,`LastName`,`BusinessName`,`PhoneNumber`,`CustomerAddress`,`LoanAmount`,`DueDate`,`TotalAmount`,`PerDay`,`Status`,`ApprovedBy`,`ApprovedAt`,`CustomerID`) values 
(8,'Christlyn','Tuasoc','Jollibee','9876543210','Highway Tagum',10000.00,'2025-12-31',10500.00,700.00,'Approved','johnny Doejali','2025-12-16 19:11:43',6);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
