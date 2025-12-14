// Enhanced loading screen controller
document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.querySelector('main');
  const body = document.body;
  
  // Check if we're on a page that should show loading
  if (!loadingScreen) return;
  
  // Function to hide loading screen with better timing
  function hideLoadingScreen() {
    if (!loadingScreen) return;
    
    // Add fade-out class to start animation
    loadingScreen.classList.add('fade-out');
    
    // Show main content
    if (mainContent) {
      mainContent.classList.add('loaded');
    }
    
    // Remove loading screen from DOM after animation completes
    setTimeout(() => {
      if (loadingScreen && loadingScreen.parentNode) {
        loadingScreen.style.display = 'none';
        body.classList.add('page-loaded');
      }
    }, 500); // Match CSS transition duration
  }
  
  // Function to show loading screen
  function showLoadingScreen() {
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      loadingScreen.classList.remove('fade-out');
      if (mainContent) {
        mainContent.classList.remove('loaded');
      }
    }
  }
  
  // Check current page state
  if (document.readyState === 'complete') {
    // Page already loaded
    setTimeout(hideLoadingScreen, 300); // Small delay for smoothness
  } else {
    // Page still loading
    window.addEventListener('load', () => {
      // Wait a bit for all assets to settle
      setTimeout(hideLoadingScreen, 500);
    });
    
    // Safety timeout - always hide after 5 seconds max
    setTimeout(hideLoadingScreen, 5000);
  }
  
  // Optional: Show loading during AJAX operations
  window.showLoading = showLoadingScreen;
  window.hideLoading = hideLoadingScreen;
  
  // Optional: Listen for page transitions
  document.addEventListener('beforeunload', () => {
    // Could show a loading screen here if implementing SPA-like navigation
  });
});