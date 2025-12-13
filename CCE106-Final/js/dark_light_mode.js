// Dark/Light Mode Toggle with Persistent State
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById("themeToggle");
    
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Initialize theme from localStorage or use system preference
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            updateThemeImages('dark');
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeImages('light');
        }
    }
    
    // Update all theme-dependent images
    function updateThemeImages(theme) {
        const logoImages = document.querySelectorAll('.logo[src*="logo-"]');
        logoImages.forEach(img => {
            img.src = img.src.replace(/logo-(light|dark)\.png/, `logo-${theme}.png`);
        });
        
        // Update service icons if they exist
        const serviceIcons = document.querySelectorAll('img[class*="-light"], img[class*="-dark"]');
        serviceIcons.forEach(img => {
            const classes = img.className;
            if (classes.includes('payment-transactions') || classes.includes('payment')) {
                img.src = `../assets/${classes.includes('payment-transactions') ? 'payments' : 'wallet'}-${theme}.png`;
            } else if (classes.includes('customer-records') || classes.includes('check-records')) {
                img.src = `../assets/record-${theme}.png`;
            } else if (classes.includes('daily-collections')) {
                img.src = `../assets/dailyrec-${theme}.png`;
            } else if (classes.includes('collection-history')) {
                img.src = `../assets/audit-${theme}.png`;
            } else if (classes.includes('add-customer')) {
                img.src = `../assets/addcustomer-${theme}.png`;
            } else if (classes.includes('login-status')) {
                img.src = `../assets/login-${theme}.png`;
            }
        });
    }
    
    // Toggle theme function
    function toggleTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            updateThemeImages('light');
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            updateThemeImages('dark');
        }
        
        // Update toggle button
        updateToggleButton();
    }
    
    // Update toggle button appearance
    function updateToggleButton() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.style.backgroundImage = isDarkMode 
            ? "url('../assets/light_mode.png')"
            : "url('../assets/dark_mode.png')";
    }
    
    // Apply initial theme
    initializeTheme();
    updateToggleButton();
    
    // Add click event listener
    themeToggle.addEventListener("click", toggleTheme);
    
    // Listen for system theme changes (optional)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only update if user hasn't explicitly set a preference
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                updateThemeImages('dark');
            } else {
                document.body.classList.remove('dark-mode');
                updateThemeImages('light');
            }
            updateToggleButton();
        }
    });
});