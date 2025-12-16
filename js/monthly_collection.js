document.addEventListener('DOMContentLoaded', function() {
    const monthlyCollectionBox = document.getElementById('monthlyCollectionBox');
    const currentMonthElement = document.getElementById('currentMonth');
    const monthYearElement = document.getElementById('monthYear');
    const totalCollectionElement = document.getElementById('totalCollection');
    const refreshMonthlyBtn = document.getElementById('refreshMonthlyBtn');

    // Format currency
    function formatCurrency(amount) {
        return '₱' + parseFloat(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Get current month and year
    function getCurrentMonthYear() {
        const now = new Date();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return {
            month: months[now.getMonth()],
            year: now.getFullYear(),
            monthNumber: now.getMonth() + 1
        };
    }

    // Update month display
    function updateMonthDisplay() {
        const { month, year } = getCurrentMonthYear();
        currentMonthElement.textContent = `Month of ${month} ${year}`;
        monthYearElement.textContent = `${month} ${year}`;
    }

    // Fetch monthly collection data
    async function fetchMonthlyCollection() {
        try {
            // Add loading state
            monthlyCollectionBox.classList.add('loading');
            
            const { monthNumber, year } = getCurrentMonthYear();
            
            const response = await fetch(`../php/get_monthly_collection.php?month=${monthNumber}&year=${year}`);
            const data = await response.json();
            
            if (data.success) {
                updateMonthlyCollection(data);
            } else {
                console.error('Error fetching monthly collection:', data.error);
                resetMonthlyCollection();
            }
        } catch (error) {
            console.error('Error fetching monthly collection:', error);
            resetMonthlyCollection();
        } finally {
            // Remove loading state
            monthlyCollectionBox.classList.remove('loading');
        }
    }

    // Update monthly collection
    function updateMonthlyCollection(data) {
        totalCollectionElement.textContent = formatCurrency(data.total_collection);
        
        // Add color coding
        if (data.total_collection > 0) {
            totalCollectionElement.style.color = 'var(--success-color)';
        } else {
            totalCollectionElement.style.color = '';
        }
    }

    // Reset monthly collection to default
    function resetMonthlyCollection() {
        totalCollectionElement.textContent = '₱0.00';
        totalCollectionElement.style.color = '';
    }

    // Initialize
    function initMonthlyCollection() {
        updateMonthDisplay();
        fetchMonthlyCollection();
        
        // Set up refresh button
        if (refreshMonthlyBtn) {
            refreshMonthlyBtn.addEventListener('click', function() {
                fetchMonthlyCollection();
                
                // Add visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '🔄 Refreshing...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
            });
        }
        
        // Auto-refresh every 5 minutes
        setInterval(fetchMonthlyCollection, 5 * 60 * 1000);
    }

    // Start the monthly collection module
    initMonthlyCollection();
});