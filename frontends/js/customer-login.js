// Customer Login JavaScript
// Customer login functionality
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const customerLogin = new CustomerLogin();
});

class CustomerLogin {
    constructor() {
        this.form = document.getElementById('customerLoginForm');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupSocialLogins();
        this.loadRememberedEmail();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', this.validateEmail.bind(this));
            emailInput.addEventListener('input', this.clearEmailError.bind(this));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', this.validatePassword.bind(this));
            passwordInput.addEventListener('input', this.clearPasswordError.bind(this));
        }

        // Remember me functionality
        const rememberCheckbox = document.getElementById('rememberMe');
        if (rememberCheckbox) {
            rememberCheckbox.addEventListener('change', this.handleRememberMe.bind(this));
        }
    }

    setupPasswordToggle() {
        const toggleButton = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                const icon = toggleButton.querySelector('i');
                if (type === 'password') {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            });
        }
    }

    setupSocialLogins() {
        // Google login button
        const googleBtn = document.querySelector('.btn-outline-danger');
        if (googleBtn) {
            googleBtn.addEventListener('click', this.handleGoogleLogin.bind(this));
        }

        // Facebook login button
        const facebookBtn = document.querySelector('.btn-outline-primary');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', this.handleFacebookLogin.bind(this));
        }
    }

    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('customerEmail');
        const emailInput = document.getElementById('email');
        const rememberCheckbox = document.getElementById('rememberMe');

        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.submitLogin();
        }
    }

    validateForm() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        let isValid = true;

        // Validate email
        if (!this.validateEmail()) {
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword()) {
            isValid = false;
        }

        return isValid;
    }

    validateEmail() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();

        this.clearEmailError();

        if (!email) {
            this.showEmailError('Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showEmailError('Please enter a valid email address');
            return false;
        }

        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        return true;
    }

    validatePassword() {
        const passwordInput = document.getElementById('password');
        const password = passwordInput.value.trim();

        this.clearPasswordError();

        if (!password) {
            this.showPasswordError('Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showPasswordError('Password must be at least 6 characters long');
            return false;
        }

        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
        return true;
    }

    clearEmailError() {
        const emailInput = document.getElementById('email');
        const errorElement = emailInput.parentNode.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        emailInput.classList.remove('is-invalid');
    }

    clearPasswordError() {
        const passwordInput = document.getElementById('password');
        const errorElement = passwordInput.parentNode.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        passwordInput.classList.remove('is-invalid');
    }

    showEmailError(message) {
        const emailInput = document.getElementById('email');
        this.clearEmailError();
        
        emailInput.classList.add('is-invalid');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        errorElement.textContent = message;
        
        emailInput.parentNode.parentNode.appendChild(errorElement);
    }

    showPasswordError(message) {
        const passwordInput = document.getElementById('password');
        this.clearPasswordError();
        
        passwordInput.classList.add('is-invalid');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        errorElement.textContent = message;
        
        passwordInput.parentNode.parentNode.appendChild(errorElement);
    }

    async submitLogin() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password'),
                rememberMe: formData.get('rememberMe') === 'on'
            };

            // Handle remember me
            this.handleRememberMe();

            // Call backend API
            const response = await fetch(`${API_BASE_URL}/auth/signIn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.handleLoginResponse(result);
            } else {
                throw new Error(result.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showErrorMessage(error.message || 'Login failed. Please check your credentials.');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    handleLoginResponse(response) {
        if (response.jwt && response.message === 'Login Success') {
            // Store enhanced user data and token
            localStorage.setItem('authToken', response.jwt);
            localStorage.setItem('userRole', response.role);
            
            // Store additional user information if available
            if (response.userId) localStorage.setItem('userId', response.userId);
            if (response.userName) localStorage.setItem('userName', response.userName);
            if (response.userEmail) localStorage.setItem('userEmail', response.userEmail);
            
            // Show custom welcome message if available
            const welcomeMessage = response.welcomeMessage || 'Login successful! Redirecting to browse services...';
            this.showSuccessMessage(welcomeMessage);
            
            // Use dashboard URL from response or fallback to customer dashboard
            const redirectUrl = response.dashboardUrl || 'customer-dashboard.html';
            
            setTimeout(() => {
                window.location.href = redirectUrl;
                console.log('Redirecting customer to:', redirectUrl);
            }, 1500);
        } else {
            this.showErrorMessage(response.message || 'Login failed. Please check your credentials.');
        }
    }

    handleRememberMe() {
        const rememberCheckbox = document.getElementById('rememberMe');
        const email = document.getElementById('email').value;

        if (rememberCheckbox && rememberCheckbox.checked && email) {
            localStorage.setItem('customerEmail', email);
        } else {
            localStorage.removeItem('customerEmail');
        }
    }

    handleGoogleLogin() {
        this.showInfoMessage('Google login integration would be implemented here...');
        
        // Simulate Google OAuth flow
        setTimeout(() => {
            console.log('Google OAuth flow initiated');
            // In real implementation, integrate with Google OAuth
        }, 1000);
    }

    handleFacebookLogin() {
        this.showInfoMessage('Facebook login integration would be implemented here...');
        
        // Simulate Facebook OAuth flow
        setTimeout(() => {
            console.log('Facebook OAuth flow initiated');
            // In real implementation, integrate with Facebook SDK
        }, 1000);
    }

    showSuccessMessage(message) {
        this.showAlert('success', message);
    }

    showErrorMessage(message) {
        this.showAlert('danger', message);
    }

    showInfoMessage(message) {
        this.showAlert('info', message);
    }

    showAlert(type, message) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert alert at the top of the form
        this.form.insertBefore(alertElement, this.form.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    // Utility method to validate customer login credentials
    static validateCredentials(email, password) {
        // In real implementation, this would make an API call
        const mockUsers = [
            { email: 'customer@example.com', password: 'password123' },
            { email: 'john.doe@email.com', password: 'mypassword' }
        ];

        return mockUsers.some(user => 
            user.email === email && user.password === password
        );
    }

    // Method to handle forgot password
    static handleForgotPassword(email) {
        console.log(`Password reset requested for: ${email}`);
        // In real implementation, this would trigger password reset email
        return {
            success: true,
            message: 'Password reset link sent to your email'
        };
    }
}