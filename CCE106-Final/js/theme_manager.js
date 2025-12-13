// Theme Manager - Single source of truth for dark mode
class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Apply saved theme immediately to prevent flash
        this.applySavedTheme();
        
        // Set up theme toggle button
        this.setupThemeToggle();
        
        // Listen for system theme changes
        this.listenForSystemTheme();
    }
    
    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Decide which theme to use
        let theme = 'light';
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            theme = 'dark';
        }
        
        // Apply theme
        this.setTheme(theme);
        
        // Save if not already saved
        if (!savedTheme) {
            localStorage.setItem('theme', theme);
        }
    }
    
    setTheme(theme) {
        // Apply to body
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update all images
        this.updateImages(theme);
        
        // Update toggle button
        this.updateToggleButton(theme === 'dark');
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    updateToggleButton(isDark) {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        themeToggle.style.backgroundImage = isDark 
            ? "url('../assets/light_mode.png')"
            : "url('../assets/dark_mode.png')";
    }
    
    updateImages(theme) {
        this.updateLogos(theme);
        this.updateServiceIcons(theme);
    }
    
    updateLogos(theme) {
        const logos = document.querySelectorAll('.logo');
        logos.forEach(logo => {
            if (logo.src.includes('logo-light.png') || logo.src.includes('logo-dark.png')) {
                logo.src = `../assets/logo-${theme}.png`;
            } else {
                // If logo doesn't have light/dark in src, set it directly
                logo.src = `../assets/logo-${theme}.png`;
            }
        });
    }
    
    updateServiceIcons(theme) {
        // Admin page icons
        const addCustomerIcons = document.querySelectorAll('.add-customer');
        addCustomerIcons.forEach(icon => {
            icon.src = `../assets/addcustomer-${theme}.png`;
        });
        
        const loginIcons = document.querySelectorAll('.login-status');
        loginIcons.forEach(icon => {
            icon.src = `../assets/login-${theme}.png`;
        });
        
        const recordIcons = document.querySelectorAll('.check-records');
        recordIcons.forEach(icon => {
            icon.src = `../assets/record-${theme}.png`;
        });
        
        // Secretary page icons
        const paymentIcons = document.querySelectorAll('.payment-transactions');
        paymentIcons.forEach(icon => {
            icon.src = `../assets/payments-${theme}.png`;
        });
        
        const customerRecordIcons = document.querySelectorAll('.customer-records');
        customerRecordIcons.forEach(icon => {
            icon.src = `../assets/record-${theme}.png`;
        });
        
        const dailyCollectionIcons = document.querySelectorAll('.daily-collections');
        dailyCollectionIcons.forEach(icon => {
            icon.src = `../assets/dailyrec-${theme}.png`;
        });
        
        // Collector page icons
        const walletIcons = document.querySelectorAll('.payment');
        walletIcons.forEach(icon => {
            icon.src = `../assets/wallet-${theme}.png`;
        });
        
        const auditIcons = document.querySelectorAll('.collection-history');
        auditIcons.forEach(icon => {
            icon.src = `../assets/audit-${theme}.png`;
        });
    }
    
    listenForSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only update if user hasn't explicitly set a preference
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});