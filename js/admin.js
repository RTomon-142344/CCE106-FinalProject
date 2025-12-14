// admin.js - For main dashboard
document.addEventListener('DOMContentLoaded', function() {
    // --- Load Latest Notifications (2 only) ---
    loadLatestNotifications();
    
    // Auto-refresh every 30 seconds
    setInterval(loadLatestNotifications, 30000);
    
    // Manual refresh button
    const refreshBtn = document.getElementById('refreshNotificationsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            loadLatestNotifications();
            setTimeout(() => {
                this.classList.remove('refreshing');
            }, 1000);
        });
    }
    
    async function loadLatestNotifications() {
        try {
            const response = await fetch('../php/get_notifications.php?limit=2');
            const data = await response.json();
            
            if (data.success && data.notifications) {
                displayLatestNotifications(data.notifications);
            } else {
                showError('Failed to load notifications');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            showError('Network error loading notifications');
        }
    }
    
    function displayLatestNotifications(notifications) {
        const container = document.querySelector('.notifications-container');
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="notify-box">
                    <div class="notification-content">
                        <div class="notification-message">No new notifications</div>
                        <div class="notification-time">All caught up!</div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        notifications.forEach(notif => {
            const timeAgo = getTimeAgo(notif.created_at);
            const notifyBox = document.createElement('div');
            notifyBox.className = `notify-box ${notif.is_read ? 'read' : 'unread'}`;
            
            notifyBox.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${notif.notif_msg}</div>
                    <div class="notification-time">${timeAgo} • ${notif.created_by || 'System'}</div>
                </div>
                <div class="notification-actions">
                    <button class="action-btn view-btn" data-id="${notif.notif_id}">View</button>
                </div>
            `;
            
            container.appendChild(notifyBox);
            
            // Add click event to view button
            const viewBtn = notifyBox.querySelector('.view-btn');
            viewBtn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                // Redirect to notification.php with ID parameter
                window.location.href = `../php/notification.php?view=${notificationId}`;
            });
        });
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
    
    function showError(message) {
        const container = document.querySelector('.notifications-container');
        if (container) {
            container.innerHTML = `
                <div class="notify-box" style="border-left-color: var(--delete-btn-bg);">
                    <div class="notification-content">
                        <div class="notification-message">${message}</div>
                    </div>
                </div>
            `;
        }
    }
});