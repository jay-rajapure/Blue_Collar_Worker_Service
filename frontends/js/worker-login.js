// Worker Login JavaScript
// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
    const workerLogin = new WorkerLogin();
});

class WorkerLogin {
    constructor() {
        this.form = document.getElementById('workerLoginForm');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupQuickAccess();
        this.loadRememberedCredentials();
        this.setupWorkerIdFormatting();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const workerIdInput = document.getElementById('workerId');

        if (emailInput) {
            emailInput.addEventListener('blur', this.validateEmail.bind(this));
            emailInput.addEventListener('input', this.clearEmailError.bind(this));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', this.validatePassword.bind(this));
            passwordInput.addEventListener('input', this.clearPasswordError.bind(this));
        }

        if (workerIdInput) {
            workerIdInput.addEventListener('input', this.formatWorkerId.bind(this));
            workerIdInput.addEventListener('blur', this.validateWorkerId.bind(this));
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

    setupQuickAccess() {
        const quickVerifyBtn = document.getElementById('quickVerifyBtn');
        const emergencyAccessBtn = document.getElementById('emergencyAccessBtn');

        if (quickVerifyBtn) {
            quickVerifyBtn.addEventListener('click', this.handleQuickVerify.bind(this));
        }

        if (emergencyAccessBtn) {
            emergencyAccessBtn.addEventListener('click', this.handleEmergencyAccess.bind(this));
        }
    }

    setupWorkerIdFormatting() {
        const workerIdInput = document.getElementById('workerId');
        if (workerIdInput) {
            workerIdInput.classList.add('worker-id-input');
        }
    }

    loadRememberedCredentials() {
        const rememberedEmail = localStorage.getItem('workerEmail');
        const rememberedWorkerId = localStorage.getItem('workerId');
        const emailInput = document.getElementById('email');
        const workerIdInput = document.getElementById('workerId');
        const rememberCheckbox = document.getElementById('rememberMe');

        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }

        if (rememberedWorkerId && workerIdInput) {
            workerIdInput.value = rememberedWorkerId;
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.submitLogin();
        }
    }

    validateForm() {
        let isValid = true;

        // Validate email
        if (!this.validateEmail()) {
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword()) {
            isValid = false;
        }

        // Worker ID is optional, but validate if provided
        const workerId = document.getElementById('workerId').value.trim();
        if (workerId && !this.validateWorkerId()) {
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

    validateWorkerId() {
        const workerIdInput = document.getElementById('workerId');
        const workerId = workerIdInput.value.trim();

        this.clearWorkerIdError();

        if (workerId) {
            // Worker ID format: WRK-XXXX-XXXX (where X is alphanumeric)
            const workerIdRegex = /^WRK-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            if (!workerIdRegex.test(workerId)) {
                this.showWorkerIdError('Worker ID format: WRK-XXXX-XXXX');
                return false;
            }
        }

        workerIdInput.classList.remove('is-invalid');
        if (workerId) {
            workerIdInput.classList.add('is-valid');
        }
        return true;
    }

    formatWorkerId(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Format as WRK-XXXX-XXXX
        if (value.length > 3) {
            if (!value.startsWith('WRK')) {
                value = 'WRK' + value.substring(3);
            }
        } else {
            if (value && !'WRK'.startsWith(value)) {
                value = 'WRK';
            }
        }
        
        if (value.length > 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        
        if (value.length > 8) {
            value = value.substring(0, 8) + '-' + value.substring(8);
        }
        
        if (value.length > 13) {
            value = value.substring(0, 13);
        }
        
        e.target.value = value;
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

    clearWorkerIdError() {
        const workerIdInput = document.getElementById('workerId');
        const errorElement = workerIdInput.parentNode.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        workerIdInput.classList.remove('is-invalid');
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

    showWorkerIdError(message) {
        const workerIdInput = document.getElementById('workerId');
        this.clearWorkerIdError();
        
        workerIdInput.classList.add('is-invalid');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        errorElement.textContent = message;
        
        workerIdInput.parentNode.parentNode.appendChild(errorElement);
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
                workerId: formData.get('workerId'),
                rememberMe: formData.get('rememberMe') === 'on'
            };

            // Handle remember me
            this.handleRememberMe();

            // Call backend API
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...loginData,
                    userType: 'worker'
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
        if (response.success || response.user) {
            const user = response.user || response.data;
            
            // Store user data and token
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }
            
            this.showSuccessMessage(`Welcome back, ${user.name || user.firstName + ' ' + user.lastName}! Redirecting to your dashboard...`);
            
            // Redirect to worker dashboard
            setTimeout(() => {
                window.location.href = '../html/worker-dashboard.html'; // Update when dashboard is created
                console.log('Redirecting to worker dashboard...');
            }, 1500);
        } else {
            this.showErrorMessage(response.message || 'Login failed. Please check your credentials.');
        }
    }

    handleRememberMe() {
        const rememberCheckbox = document.getElementById('rememberMe');
        const email = document.getElementById('email').value;
        const workerId = document.getElementById('workerId').value;

        if (rememberCheckbox && rememberCheckbox.checked) {
            if (email) localStorage.setItem('workerEmail', email);
            if (workerId) localStorage.setItem('workerId', workerId);
        } else {
            localStorage.removeItem('workerEmail');
            localStorage.removeItem('workerId');
        }
    }

    handleQuickVerify() {
        this.showInfoMessage('Opening QR code scanner for quick verification...');
        
        // Simulate QR code verification
        setTimeout(() => {
            const mockQRData = {
                workerId: 'WRK-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
                email: 'verified.worker@servicehub.com'
            };
            
            document.getElementById('workerId').value = mockQRData.workerId;
            document.getElementById('email').value = mockQRData.email;
            
            this.showSuccessMessage('QR code verified! Credentials auto-filled.');
        }, 2000);
    }

    handleEmergencyAccess() {
        const phone = prompt('Enter your registered phone number for emergency access:');
        
        if (phone) {
            this.showInfoMessage('Sending verification code to ' + phone + '...');
            
            // Simulate SMS verification
            setTimeout(() => {
                const code = prompt('Enter the 6-digit verification code sent to your phone:');
                
                if (code && code.length === 6) {
                    this.showSuccessMessage('Emergency access granted! Please update your password.');
                    
                    // Auto-fill demo credentials
                    document.getElementById('email').value = 'emergency.worker@servicehub.com';
                    document.getElementById('password').value = 'temppass123';
                } else {
                    this.showErrorMessage('Invalid verification code. Please try again.');
                }
            }, 1500);
        }
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

    // Utility methods for worker-specific functionality
    static generateWorkerId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'WRK-';
        
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        result += '-';
        
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    static validateWorkerCredentials(email, password, workerId) {
        // Mock worker database
        const mockWorkers = [
            { email: 'plumber@servicehub.com', password: 'plumber123', workerId: 'WRK-PLMB-0001' },
            { email: 'electrician@servicehub.com', password: 'electric123', workerId: 'WRK-ELEC-0001' },
            { email: 'driver@servicehub.com', password: 'driver123', workerId: 'WRK-DRVR-0001' }
        ];

        return mockWorkers.some(worker => 
            worker.email === email && 
            worker.password === password && 
            (!workerId || worker.workerId === workerId)
        );
    }
}