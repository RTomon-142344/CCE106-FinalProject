// notification.js - For notification.php page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentNotificationId = null;
    let currentAction = null; // 'approve' or 'reject'
    
    // DOM Elements
    const notificationsList = document.getElementById('notificationsList');
    const filterStatus = document.getElementById('filterStatus');
    const refreshAllBtn = document.getElementById('refreshAllBtn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const viewNotificationModal = document.getElementById('viewNotificationModal');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    const adminPasswordInput = document.getElementById('adminPassword');
    const passwordError = document.getElementById('passwordError');
    
    // Load notifications on page load
    loadAllNotifications();
    
    // Event Listeners
    if (filterStatus) {
        filterStatus.addEventListener('change', loadAllNotifications);
    }
    
    if (refreshAllBtn) {
        refreshAllBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            loadAllNotifications();
            setTimeout(() => {
                this.classList.remove('refreshing');
            }, 1000);
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllNotifications);
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', closeAllModals);
    }
    
    if (confirmPasswordBtn) {
        confirmPasswordBtn.addEventListener('click', verifyPasswordAndProcess);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === viewNotificationModal) {
            closeAllModals();
        }
        if (event.target === passwordModal) {
            closeAllModals();
        }
    });
    
    // Check URL for view parameter
    const urlParams = new URLSearchParams(window.location.search);
    const viewNotificationId = urlParams.get('view');
    if (viewNotificationId) {
        viewNotificationDetails(viewNotificationId);
    }
    
    // Functions
    async function loadAllNotifications() {
        try {
            const filter = filterStatus ? filterStatus.value : 'all';
            const response = await fetch(`../php/get_notifications.php?all=1&filter=${filter}`);
            const data = await response.json();
            
            if (data.success && data.notifications) {
                displayAllNotifications(data.notifications);
            } else {
                showEmptyState('No notifications found');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            showEmptyState('Error loading notifications');
        }
    }
    
    function displayAllNotifications(notifications) {
        if (!notificationsList) return;
        
        if (notifications.length === 0) {
            showEmptyState('No notifications found');
            return;
        }
        
        notificationsList.innerHTML = '';
        
        notifications.forEach(notif => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notif.is_read ? 'read' : 'unread'}`;
            
            const timeAgo = getTimeAgo(notif.created_at);
            const date = new Date(notif.created_at);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            notificationItem.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notif.notif_msg}</div>
                    <div class="notification-message">${notif.description || ''}</div>
                    <div class="notification-meta">
                        <span>${timeAgo}</span>
                        <span>${formattedDate} ${formattedTime}</span>
                        <span>${notif.created_by || 'System'}</span>
                        ${notif.status ? `<span class="status-badge ${notif.status}">${notif.status}</span>` : ''}
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="action-btn view-btn" data-id="${notif.notif_id}">View</button>
                    ${!notif.is_read ? `<button class="action-btn mark-read-btn" data-id="${notif.notif_id}">Mark as Read</button>` : ''}
                </div>
            `;
            
            notificationsList.appendChild(notificationItem);
            
            // Add event listeners
            const viewBtn = notificationItem.querySelector('.view-btn');
            viewBtn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                viewNotificationDetails(notificationId);
            });
            
            const markReadBtn = notificationItem.querySelector('.mark-read-btn');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', function() {
                    const notificationId = this.getAttribute('data-id');
                    markNotificationAsRead(notificationId);
                });
            }
        });
    }
    
    async function viewNotificationDetails(notificationId) {
        try {
            const response = await fetch(`../php/get_notification_details.php?id=${notificationId}`);
            const data = await response.json();
            
            if (data.success && data.notification) {
                displayNotificationModal(data.notification);
            } else {
                showTemporaryMessage('Failed to load notification details', 'error');
            }
        } catch (error) {
            console.error('Error loading notification details:', error);
            showTemporaryMessage('Error loading notification details', 'error');
        }
    }
    
    function displayNotificationModal(notification) {
        currentNotificationId = notification.notif_id;
        
        const modalContent = viewNotificationModal.querySelector('.modal-content');
        if (!modalContent) return;
        
        // Parse meta data
        const meta = notification.meta ? JSON.parse(notification.meta) : {};
        
        // Calculate loan details
        const loanAmount = meta.loan_amount || 0;
        const interestRate = 0.05; // 5% interest
        const interestAmount = loanAmount * interestRate;
        const totalAmount = loanAmount + interestAmount;
        const perDay = totalAmount / 30; // Assuming 30-day loan term
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Customer Request Details</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <div class="customer-info-grid">
                    <div class="info-group">
                        <span class="info-label">First Name</span>
                        <div class="info-value">${meta.first_name || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Last Name</span>
                        <div class="info-value">${meta.last_name || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Business Name</span>
                        <div class="info-value">${meta.business_name || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Phone Number</span>
                        <div class="info-value">${meta.phone || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Address</span>
                        <div class="info-value">${meta.address || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Loan Amount (₱)</span>
                        <div class="info-value">${parseFloat(loanAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Due Date</span>
                        <div class="info-value">${meta.due_date || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="calculation-section">
                    <h3 style="margin-top: 0; color: var(--text-color);">Loan Calculation</h3>
                    <div class="calculation-row">
                        <span>Principal Amount:</span>
                        <span>₱${parseFloat(loanAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Interest (5%):</span>
                        <span>₱${parseFloat(interestAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Total Amount:</span>
                        <span class="total-amount">₱${parseFloat(totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Daily Payment (30 days):</span>
                        <span>₱${parseFloat(perDay).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="rejectBtn" class="action-btn delete-btn">Reject</button>
                    <button id="approveBtn" class="action-btn" style="background: #28a745;">Approve</button>
                </div>
            </div>
        `;
        
        // Add event listeners to modal buttons
        viewNotificationModal.style.display = 'block';
        
        const approveBtn = modalContent.querySelector('#approveBtn');
        const rejectBtn = modalContent.querySelector('#rejectBtn');
        const closeBtn = modalContent.querySelector('.close-btn');
        
        approveBtn.addEventListener('click', () => {
            currentAction = 'approve';
            showPasswordModal();
        });
        
        rejectBtn.addEventListener('click', () => {
            currentAction = 'reject';
            showPasswordModal();
        });
        
        closeBtn.addEventListener('click', closeAllModals);
    }
    
    function showPasswordModal() {
        closeModal(viewNotificationModal);
        passwordModal.style.display = 'block';
        adminPasswordInput.value = '';
        passwordError.style.display = 'none';
        adminPasswordInput.focus();
    }
    
    async function verifyPasswordAndProcess() {
        const password = adminPasswordInput.value.trim();
        
        if (!password) {
            passwordError.textContent = 'Please enter your password';
            passwordError.style.display = 'block';
            return;
        }
        
        try {
            const response = await fetch('../php/verify_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `password=${encodeURIComponent(password)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                processNotificationAction();
            } else {
                passwordError.textContent = data.message || 'Incorrect password';
                passwordError.style.display = 'block';
                adminPasswordInput.focus();
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            passwordError.textContent = 'Error verifying password';
            passwordError.style.display = 'block';
        }
    }
    
    async function processNotificationAction() {
        try {
            const response = await fetch('../php/process_notification_action.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `notification_id=${currentNotificationId}&action=${currentAction}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeAllModals();
                showTemporaryMessage(data.message, 'success');
                loadAllNotifications();
                
                // If action was approve, show success modal
                if (currentAction === 'approve') {
                    setTimeout(() => {
                        showCustomerAddedModal();
                    }, 500);
                }
            } else {
                showTemporaryMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Error processing action:', error);
            showTemporaryMessage('Error processing request', 'error');
        }
    }
    
    function showCustomerAddedModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="border: none; padding-bottom: 0;">
                    <h2 style="color: #28a745;">✅ Success!</h2>
                </div>
                <div class="modal-body">
                    <p style="font-size: 16px; margin: 20px 0;">Customer has been successfully added to the system.</p>
                    <button id="closeSuccessModal" class="action-btn" style="background: #28a745; margin-top: 10px;">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('#closeSuccessModal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 5000);
    }
    
    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch('../php/mark_notification_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${notificationId}`
            });
            
            const data = await response.json();
            if (data.success) {
                showTemporaryMessage('Notification marked as read', 'success');
                loadAllNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showTemporaryMessage('Error marking as read', 'error');
        }
    }
    
    async function markAllAsRead() {
        if (!confirm('Are you sure you want to mark all notifications as read?')) return;
        
        try {
            const response = await fetch('../php/mark_all_read.php', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showTemporaryMessage('All notifications marked as read', 'success');
                loadAllNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            showTemporaryMessage('Error marking all as read', 'error');
        }
    }
    
    async function clearAllNotifications() {
        if (!confirm('Are you sure you want to clear all notifications?')) return;
        
        try {
            const response = await fetch('../php/clear_all_notifications.php', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showTemporaryMessage('All notifications cleared', 'success');
                loadAllNotifications();
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
            showTemporaryMessage('Error clearing notifications', 'error');
        }
    }
    
    function showEmptyState(message) {
        if (!notificationsList) return;
        
        notificationsList.innerHTML = `
            <div class="empty-state">
                <h3>${message}</h3>
                <p>No notifications to display</p>
            </div>
        `;
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function closeAllModals() {
        closeModal(viewNotificationModal);
        closeModal(passwordModal);
        currentNotificationId = null;
        currentAction = null;
        passwordError.style.display = 'none';
    }
    
    function getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    }
    
    function showTemporaryMessage(message, type) {
        const msg = document.createElement('div');
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
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
        
        // Add CSS animation
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
        
        setTimeout(() => {
            if (msg.parentNode) {
                document.body.removeChild(msg);
            }
        }, 3000);
    }
});