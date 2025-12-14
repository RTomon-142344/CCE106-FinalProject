<?php
session_start();

// Check if admin is logged in using YOUR system
if (!isset($_SESSION['user']) || !isset($_SESSION['dept'])) {
    // Store the requested URL for redirecting after login
    $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];
    header('Location: login.php');
    exit();
}

// Check if user is an Admin
// Check if user is an Admin (DeptID = 1 is Admin)
require_once 'config.php';

$user_id = $_SESSION['user'];
$dept_id = $_SESSION['dept'];

// Check if user is Admin (DeptID = 1)
if ($dept_id != 1) {
    // Not an admin, redirect to appropriate page
    header('Location: admin.php');
    exit();
}

// Get admin info for display
$sql = "SELECT FirstName, LastName FROM tblEmployees WHERE EmpID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();

$admin_name = $admin['FirstName'] . ' ' . $admin['LastName'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>All Notifications | Rean Ramz Lending Corp</title>
    <link rel="stylesheet" href="../css/notification.css">
    <link rel="icon" href="../assets/logo-dark.png">
</head>
<body>
    <header>
        <nav class="nav-bar">
            <div class="nav-left">
                <a href="admin.php">
                    <img class="logo" src="../assets/logo-light.png" alt="Rean Ramz Lending Corp">
                </a>
            </div>
            <div class="nav-right">
                <div id="themeToggle" class="theme-toggle"></div>
                <a class="home-btn" href="../php/admin.php">
                    <span>HOME</span>
                </a>
            </div>
        </nav>
    </header>

    <div class="notification-page">
        <div class="page-header">
            <div style="display: flex; align-items: center; gap: 15px;">
                <h2>All Notifications</h2>
                <div class="filter-controls">
                    <select id="filterStatus" class="filter-select">
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                    </select>
                    <button id="refreshAllBtn" class="refresh-btn">↻</button>
                </div>
            </div>
            <div class="action-buttons">
                <button id="markAllReadBtn" class="action-btn">Mark All as Read</button>
                <button id="clearAllBtn" class="action-btn delete-btn">Clear All Notifications</button>
            </div>
        </div>

        <div class="notifications-list-container">
            <div id="notificationsList" class="notifications-list">
                <!-- Notifications will be loaded here -->
                <div class="loading-message">
                    Loading notifications...
                </div>
            </div>
        </div>
    </div>

    <!-- View Notification Modal -->
    <div id="viewNotificationModal" class="modal view-notification-modal">
        <div class="modal-content">
            <!-- Content loaded dynamically -->
        </div>
    </div>

    <!-- Password Verification Modal -->
    <div id="passwordModal" class="modal password-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Verify Password</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <p>Please enter your password to confirm this action:</p>
                <input type="password" id="adminPassword" placeholder="Enter your password" class="password-input">
                <div id="passwordError" class="error-message"></div>
                <div class="modal-actions">
                    <button id="cancelPasswordBtn" class="action-btn">Cancel</button>
                    <button id="confirmPasswordBtn" class="action-btn">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/notification.js"></script>
    <script src="../js/dark_light_mode.js"></script>
</body>
</html>