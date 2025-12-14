// add-employee.js - Updated with toast notifications
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addEmployeeForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Toast notification function
    function showToast(message, type = 'info', duration = 5000) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-notification');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-notification';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icons for different toast types
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
        
        // Click anywhere on toast to dismiss
        toast.addEventListener('click', function(e) {
            if (!e.target.classList.contains('toast-close')) {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        });
    }

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update strength bar
        strengthBar.className = 'strength-bar';
        if (strength <= 1) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (strength <= 3) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Medium';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
        
        // Validate password match
        validatePasswordMatch();
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    function validatePasswordMatch() {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            passwordError.textContent = 'Passwords do not match';
            confirmPasswordInput.style.borderColor = 'var(--error-color)';
            return false;
        } else {
            passwordError.textContent = '';
            confirmPasswordInput.style.borderColor = '';
            return true;
        }
    }

    // Email validation
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailPattern.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.style.borderColor = 'var(--error-color)';
            return false;
        } else {
            emailError.textContent = '';
            emailInput.style.borderColor = '';
            return true;
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous inline messages
        emailError.textContent = '';
        passwordError.textContent = '';
        
        // Reset border colors
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('../php/add-employee.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Employee added successfully! Redirecting...', 'success', 2000);
                form.reset();
                strengthBar.className = 'strength-bar';
                strengthText.textContent = 'Weak';
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = '../php/admin.php';
                }, 2000);
            } else {
                showToast(result.message || 'Failed to add employee', 'error');
                // Highlight problematic fields
                if (result.message.includes('email')) {
                    emailInput.style.borderColor = 'var(--error-color)';
                    showToast('Email already exists. Please use a different email.', 'error');
                }
            }
        } catch (error) {
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    function validateForm() {
        let isValid = true;
        let errorMessages = [];
        
        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--error-color)';
                errorMessages.push(`${field.previousElementSibling.textContent} is required`);
            }
        });
        
        // Check password match
        if (!validatePasswordMatch()) {
            isValid = false;
            errorMessages.push('Passwords do not match');
        }
        
        // Check email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailPattern.test(emailInput.value)) {
            isValid = false;
            emailError.textContent = 'Please enter a valid email address';
            emailInput.style.borderColor = 'var(--error-color)';
            errorMessages.push('Invalid email format');
        }
        
        // Show error toast if validation failed
        if (!isValid && errorMessages.length > 0) {
            showToast(errorMessages[0], 'error');
        }
        
        return isValid;
    }
});