// admin.js - Fixed with working logout and enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // --- Logout Functionality ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                // Redirect to logout.php
                window.location.href = '../php/logout.php';
            }
        });
    }

    // --- Theme Toggle (Fixed) ---
    const themeToggle = document.getElementById('themeToggle');
    
    // Initialize theme from localStorage
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeToggleButton(true);
            updateThemeImages('dark');
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeToggleButton(false);
            updateThemeImages('light');
        }
    }
    
    // Update toggle button image
    function updateThemeToggleButton(isDark) {
        if (themeToggle) {
            themeToggle.style.backgroundImage = isDark 
                ? "url('../assets/light_mode.png')"
                : "url('../assets/dark_mode.png')";
        }
    }
    
    // Initialize theme on page load
    initTheme();
    
    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                // Switch to light mode
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                updateThemeToggleButton(false);
                updateThemeImages('light');
            } else {
                // Switch to dark mode
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                updateThemeToggleButton(true);
                updateThemeImages('dark');
            }
        });
    }
    
    // Update images based on theme
    function updateThemeImages(theme) {
        // Update logo
        const logos = document.querySelectorAll('.logo');
        logos.forEach(logo => {
            logo.src = `../assets/logo-${theme}.png`;
        });
        
        // Update service icons
        document.querySelectorAll('.add-customer').forEach(icon => {
            icon.src = `../assets/addcustomer-${theme}.png`;
        });
        
        document.querySelectorAll('.login-status').forEach(icon => {
            icon.src = `../assets/login-${theme}.png`;
        });
        
        document.querySelectorAll('.check-records').forEach(icon => {
            icon.src = `../assets/record-${theme}.png`;
        });
    }

    // --- Notifications System with Auto-Refresh ---
    const viewAllBtn = document.getElementById('viewAllBtn');
    const notificationModal = document.getElementById('notificationModal');
    const closeModalBtn = document.querySelector('.close-btn');
    
    // --- Auto Refresh Variables ---
    let refreshInterval;
    let lastNotificationCount = 0;
    let isModalOpen = false;
    
    // Load initial notifications
    loadNotifications();
    
    // Start auto-refresh for notifications (every 10 seconds)
    startAutoRefresh();
    
    // View All Notifications button
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            if (notificationModal) {
                notificationModal.style.display = 'block';
                isModalOpen = true;
                loadAllNotifications();
            }
        });
    }
    
    // Close modal
    if (closeModalBtn && notificationModal) {
        closeModalBtn.addEventListener('click', function() {
            notificationModal.style.display = 'none';
            isModalOpen = false;
        });
        
        // Close when clicking outside modal
        window.addEventListener('click', function(event) {
            if (event.target === notificationModal) {
                notificationModal.style.display = 'none';
                isModalOpen = false;
            }
        });
    }
    
    // --- Auto-Refresh Functions ---
    function startAutoRefresh() {
        // Clear any existing interval
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        // Set new interval (refresh every 10 seconds)
        refreshInterval = setInterval(function() {
            // Only refresh if modal is not open to avoid disrupting user
            if (!isModalOpen) {
                loadNotifications();
            }
            
            // Also check for new notifications count for badge update
            checkNewNotifications();
        }, 10000); // 10 seconds
    }
    
    async function checkNewNotifications() {
        try {
            const response = await fetch('../php/get_notifications.php');
            const data = await response.json();
            
            if (data.success && data.notifications) {
                const unreadCount = data.notifications.filter(n => !n.is_read).length;
                
                // If there's a change in notification count, update display
                if (unreadCount !== lastNotificationCount) {
                    lastNotificationCount = unreadCount;
                    
                    // Update notification count badge if exists
                    updateNotificationBadge(unreadCount);
                    
                    // Update main notifications display
                    displayNotifications(data.notifications);
                }
            }
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }
    
    function updateNotificationBadge(count) {
        // Create or update badge on view all button
        let badge = document.querySelector('.notification-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                `;
                viewAllBtn.style.position = 'relative';
                viewAllBtn.appendChild(badge);
            }
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }
    
    // --- Functions ---
    
    // Load notifications for dashboard
    async function loadNotifications() {
        try {
            const response = await fetch('../php/get_notifications.php');
            const data = await response.json();
            
            if (data.success && data.notifications) {
                // Update notification count
                const unreadCount = data.notifications.filter(n => !n.is_read).length;
                lastNotificationCount = unreadCount;
                updateNotificationBadge(unreadCount);
                
                displayNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    // Load all notifications for modal
    async function loadAllNotifications() {
        try {
            const response = await fetch('../php/get_notifications.php?all=1');
            const data = await response.json();
            
            if (data.success && data.notifications) {
                displayAllNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error loading all notifications:', error);
        }
    }
    
    // Display notifications in dashboard
    function displayNotifications(notifications) {
        const container = document.querySelector('.notifications-container');
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="notify-box">
                    No new notifications
                </div>
            `;
            return;
        }
        
        // Filter to show only unread notifications on dashboard
        const unreadNotifications = notifications.filter(n => !n.is_read);
        
        if (unreadNotifications.length === 0) {
            container.innerHTML = `
                <div class="notify-box">
                    No new notifications
                </div>
            `;
            return;
        }
        
        // Show only first 3 unread notifications
        const limitedNotifications = unreadNotifications.slice(0, 3);
        container.innerHTML = '';
        
        limitedNotifications.forEach(notif => {
            const notifBox = document.createElement('div');
            notifBox.className = 'notify-box';
            
            if (notif.type === 'customer_approval') {
                notifBox.classList.add('customer-approval');
            }
            
            // Format time
            const timeAgo = getTimeAgo(notif.created_at);
            
            notifBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <div style="font-weight: bold;">${notif.notif_msg}</div>
                        <div style="font-size: 0.8em; color: #666; margin-top: 4px;">
                            ${timeAgo} • ${notif.created_by || 'System'}
                        </div>
                    </div>
                    ${notif.type === 'customer_approval' ? 
                        `<button class="action-btn review-btn" data-id="${notif.notif_id}" 
                                data-meta='${JSON.stringify(notif.meta || {})}'
                                style="margin-left: 10px; background: #28a745;">
                            Review
                        </button>` : 
                        ''}
                </div>
            `;
            
            container.appendChild(notifBox);
        });
        
        // If there are more than 3 unread notifications, show a "more" indicator
        if (unreadNotifications.length > 3) {
            const moreBox = document.createElement('div');
            moreBox.className = 'notify-box';
            moreBox.style.textAlign = 'center';
            moreBox.style.cursor = 'pointer';
            moreBox.innerHTML = `+${unreadNotifications.length - 3} more notifications`;
            moreBox.addEventListener('click', function() {
                if (notificationModal) {
                    notificationModal.style.display = 'block';
                    isModalOpen = true;
                    loadAllNotifications();
                }
            });
            container.appendChild(moreBox);
        }
        
        // Add event listeners to review buttons
        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                const meta = JSON.parse(this.getAttribute('data-meta'));
                if (meta && meta.application_id) {
                    handleCustomerApproval(notificationId, meta.application_id, meta);
                }
            });
        });
    }
    
    // Display all notifications in modal
    function displayAllNotifications(notifications) {
        const container = document.getElementById('allNotificationsList');
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-color);">
                    No notifications found
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        // Group notifications by date
        const groupedNotifications = {};
        notifications.forEach(notif => {
            const date = new Date(notif.created_at);
            const dateKey = date.toLocaleDateString();
            
            if (!groupedNotifications[dateKey]) {
                groupedNotifications[dateKey] = [];
            }
            groupedNotifications[dateKey].push(notif);
        });
        
        // Display grouped notifications
        Object.keys(groupedNotifications).reverse().forEach(dateKey => {
            // Add date header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.style.cssText = `
                padding: 10px 0;
                font-weight: bold;
                color: var(--text-color);
                border-bottom: 2px solid var(--border-color);
                margin-bottom: 10px;
            `;
            dateHeader.textContent = dateKey;
            container.appendChild(dateHeader);
            
            // Add notifications for this date
            groupedNotifications[dateKey].forEach(notif => {
                const notifItem = document.createElement('div');
                notifItem.className = 'modal-notification-item';
                
                if (!notif.is_read) {
                    notifItem.style.background = 'rgba(14, 97, 186, 0.1)';
                    notifItem.style.borderLeft = '3px solid var(--action-btn-bg)';
                }
                
                // Format time
                const date = new Date(notif.created_at);
                const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                notifItem.innerHTML = `
                    <div style="flex: 1;">
                        <div style="font-weight: ${notif.is_read ? 'normal' : 'bold'};">
                            ${notif.notif_msg}
                        </div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
                            ${formattedTime} • ${notif.created_by || 'System'}
                        </div>
                    </div>
                    <div class="modal-actions">
                        ${notif.type === 'customer_approval' && !notif.is_read ? 
                            `<button class="action-btn review-btn" 
                                    data-id="${notif.notif_id}" 
                                    data-meta='${JSON.stringify(notif.meta || {})}'>
                                Review
                            </button>` : 
                            ''}
                        <button class="action-btn delete-btn" data-id="${notif.notif_id}">
                            Delete
                        </button>
                    </div>
                `;
                
                container.appendChild(notifItem);
            });
        });
        
        // Add event listeners
        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                const meta = JSON.parse(this.getAttribute('data-meta'));
                if (meta && meta.application_id) {
                    handleCustomerApproval(notificationId, meta.application_id, meta);
                    if (notificationModal) {
                        notificationModal.style.display = 'none';
                        isModalOpen = false;
                    }
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                deleteNotification(notificationId);
            });
        });
    }
    
    // Helper function to get time ago
    function getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
    
    // Delete single notification
    async function deleteNotification(notificationId) {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        
        try {
            const response = await fetch('../php/delete_notification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${notificationId}`
            });
            
            const data = await response.json();
            if (data.success) {
                showTemporaryMessage('Notification deleted successfully!', 'success');
                loadNotifications();
                loadAllNotifications();
            } else {
                showTemporaryMessage('Failed to delete notification: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            showTemporaryMessage('Error deleting notification', 'error');
        }
    }
    
    // --- Mark All as Read Functionality (Fixed) ---
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllNotifications);
    }
    
    async function clearAllNotifications() {
        if (!confirm('Are you sure you want to mark all notifications as read?')) return;
        
        try {
            const response = await fetch('../php/clear_all_notifications.php', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showTemporaryMessage(data.message, 'success');
                // Refresh both views
                loadNotifications();
                loadAllNotifications();
            } else {
                showTemporaryMessage('Failed to clear notifications: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
            showTemporaryMessage('Error clearing notifications', 'error');
        }
    }
    
    // --- Refresh Button Functionality ---
    const refreshNotificationsBtn = document.getElementById('refreshNotificationsBtn');
    const refreshAllBtn = document.getElementById('refreshAllBtn');
    
    if (refreshNotificationsBtn) {
        refreshNotificationsBtn.addEventListener('click', function() {
            manualRefreshNotifications();
        });
    }
    
    if (refreshAllBtn) {
        refreshAllBtn.addEventListener('click', function() {
            manualRefreshAllNotifications();
        });
    }
    
    async function manualRefreshNotifications() {
        const btn = refreshNotificationsBtn;
        btn.classList.add('refreshing');
        
        try {
            await loadNotifications();
            // Show success feedback
            showTemporaryMessage('Notifications refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing notifications:', error);
            showTemporaryMessage('Error refreshing notifications', 'error');
        } finally {
            setTimeout(() => {
                btn.classList.remove('refreshing');
            }, 500);
        }
    }
    
    async function manualRefreshAllNotifications() {
        const btn = refreshAllBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Refreshing...';
        btn.disabled = true;
        
        try {
            await loadAllNotifications();
            showTemporaryMessage('All notifications refreshed!', 'success');
        } catch (error) {
            console.error('Error refreshing all notifications:', error);
            showTemporaryMessage('Error refreshing notifications', 'error');
        } finally {
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 500);
        }
    }
    
    function showTemporaryMessage(message, type) {
        // Create temporary message element
        const msg = document.createElement('div');
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 3s ease;
        `;
        
        if (type === 'success') {
            msg.style.background = '#28a745';
        } else {
            msg.style.background = '#dc3545';
        }
        
        // Add CSS animation if not already defined
        if (!document.querySelector('#fadeInOutAnimation')) {
            const style = document.createElement('style');
            style.id = 'fadeInOutAnimation';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    15% { opacity: 1; transform: translateY(0); }
                    85% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(msg);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (msg.parentNode) {
                document.body.removeChild(msg);
            }
        }, 3000);
    }
    
    // --- Customer Approval Handler ---
    function handleCustomerApproval(notificationId, applicationId, customerData) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'approval-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `;
        
        modal.innerHTML = `
            <div style="
                background: var(--modal-bg);
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h3 style="margin-top: 0; color: var(--text-color);">
                    Customer Approval Request
                </h3>
                
                <div style="margin: 20px 0; padding: 15px; background: var(--card-bg); border-radius: 8px;">
                    <p><strong>Customer:</strong> ${customerData.customer_name}</p>
                    <p><strong>Business:</strong> ${customerData.business_name}</p>
                    <p><strong>Phone:</strong> ${customerData.phone}</p>
                    <p><strong>Address:</strong> ${customerData.address}</p>
                    <p><strong>Submitted by:</strong> ${customerData.created_by || 'Secretary'}</p>
                </div>
                
                <div id="approvalForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-color); font-weight: bold;">
                            Loan Amount (₱) *
                        </label>
                        <input type="number" id="loanAmount" 
                               style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"
                               placeholder="Enter loan amount" required min="1" step="0.01">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-color); font-weight: bold;">
                            Due Date *
                        </label>
                        <input type="date" id="dueDate" 
                               style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"
                               required>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-color);">
                            Rejection Reason (if rejecting)
                        </label>
                        <textarea id="rejectReason" 
                                  style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc; height: 80px;"
                                  placeholder="Optional reason for rejection"></textarea>
                    </div>
                    
                    <div id="approvalMessage" style="display: none; padding: 10px; margin-bottom: 15px; border-radius: 5px;"></div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="rejectBtn" style="
                            padding: 10px 20px;
                            background: var(--delete-btn-bg);
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Reject</button>
                        
                        <button id="approveBtn" style="
                            padding: 10px 20px;
                            background: var(--action-btn-bg);
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Approve</button>
                    </div>
                </div>
                
                <button id="closeApprovalModal" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: var(--text-color);
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('dueDate').min = tomorrow.toISOString().split('T')[0];
        
        // Set default date to 30 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        document.getElementById('dueDate').value = defaultDate.toISOString().split('T')[0];
        
        // Close modal
        document.getElementById('closeApprovalModal').onclick = () => {
            document.body.removeChild(modal);
        };
        
        // Reject button
        document.getElementById('rejectBtn').onclick = async () => {
            const reason = document.getElementById('rejectReason').value;
            await processCustomerAction('reject', notificationId, applicationId, null, null, reason);
        };
        
        // Approve button
        document.getElementById('approveBtn').onclick = async () => {
            const loanAmount = parseFloat(document.getElementById('loanAmount').value);
            const dueDate = document.getElementById('dueDate').value;
            
            if (!loanAmount || loanAmount <= 0) {
                showApprovalMessage('Please enter a valid loan amount (greater than 0)', 'error');
                return;
            }
            
            if (!dueDate) {
                showApprovalMessage('Please select a due date', 'error');
                return;
            }
            
            await processCustomerAction('approve', notificationId, applicationId, loanAmount, dueDate);
        };
        
        function showApprovalMessage(text, type) {
            const msgDiv = document.getElementById('approvalMessage');
            msgDiv.textContent = text;
            msgDiv.style.display = 'block';
            msgDiv.style.background = type === 'error' ? '#f8d7da' : '#d4edda';
            msgDiv.style.color = type === 'error' ? '#721c24' : '#155724';
            msgDiv.style.border = type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
        }
        
        async function processCustomerAction(action, notifId, appId, loanAmount, dueDate, reason = '') {
            try {
                const response = await fetch('../php/approve_customer.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        notification_id: notifId,
                        application_id: appId,
                        action: action,
                        loan_amount: loanAmount || '',
                        due_date: dueDate || '',
                        reason: reason
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showApprovalMessage(data.message, 'success');
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        if (modal.parentNode) {
                            document.body.removeChild(modal);
                        }
                        // Refresh notifications
                        loadNotifications();
                        loadAllNotifications();
                    }, 2000);
                } else {
                    showApprovalMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('Error processing approval:', error);
                showApprovalMessage('Error processing request', 'error');
            }
        }
    }
});