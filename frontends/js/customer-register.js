// Customer Registration JavaScript
// Customer registration functionality
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const customerRegister = new CustomerRegister();
});

class CustomerRegister {
    constructor() {
        this.form = document.getElementById('customerRegisterForm');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupPasswordStrength();
        this.setupPhoneFormatting();
        this.setupPincodeValidation();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleRegistration.bind(this));
        }

        // Real-time validation for all form fields
        const fields = [
            'firstName', 'lastName', 'email', 'phone', 
            'address', 'city', 'state', 'pincode', 
            'password', 'confirmPassword'
        ];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });

        // Terms checkbox validation
        const termsCheckbox = document.getElementById('agreeTerms');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', this.validateTerms.bind(this));
        }

        // Email availability check (debounced)
        const emailField = document.getElementById('email');
        if (emailField) {
            let emailTimeout;
            emailField.addEventListener('input', () => {
                clearTimeout(emailTimeout);
                emailTimeout = setTimeout(() => {
                    this.checkEmailAvailability();
                }, 1000);
            });
        }
    }

    setupPasswordToggle() {
        const toggleButtons = ['togglePassword', 'toggleConfirmPassword'];
        const passwordFields = ['password', 'confirmPassword'];

        toggleButtons.forEach((buttonId, index) => {
            const toggleButton = document.getElementById(buttonId);
            const passwordField = document.getElementById(passwordFields[index]);

            if (toggleButton && passwordField) {
                toggleButton.addEventListener('click', function() {
                    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordField.setAttribute('type', type);
                    
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
        });
    }

    setupPasswordStrength() {
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', this.updatePasswordStrength.bind(this));
        }
    }

    setupPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber.bind(this));
        }
    }

    setupPincodeValidation() {
        const pincodeInput = document.getElementById('pincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('input', this.formatPincode.bind(this));
        }
    }

    handleRegistration(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.submitRegistration();
        }
    }

    validateForm() {
        const fields = [
            'firstName', 'lastName', 'email', 'phone', 
            'address', 'city', 'state', 'pincode', 
            'password', 'confirmPassword'
        ];

        let isValid = true;

        // Validate all fields
        fields.forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        // Validate terms checkbox
        if (!this.validateTerms()) {
            isValid = false;
        }

        return isValid;
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return true;

        const value = field.value.trim();
        this.clearFieldError(fieldName);

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                return this.validateName(field, value);
            case 'email':
                return this.validateEmail(field, value);
            case 'phone':
                return this.validatePhone(field, value);
            case 'address':
                return this.validateAddress(field, value);
            case 'city':
                return this.validateCity(field, value);
            case 'state':
                return this.validateState(field, value);
            case 'pincode':
                return this.validatePincode(field, value);
            case 'password':
                return this.validatePassword(field, value);
            case 'confirmPassword':
                return this.validateConfirmPassword(field, value);
            default:
                return true;
        }
    }

    validateName(field, value) {
        if (!value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }

        if (value.length < 2) {
            this.showFieldError(field, 'Name must be at least 2 characters long');
            return false;
        }

        if (!/^[a-zA-Z\s]+$/.test(value)) {
            this.showFieldError(field, 'Name can only contain letters and spaces');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateEmail(field, value) {
        if (!value) {
            this.showFieldError(field, 'Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validatePhone(field, value) {
        if (!value) {
            this.showFieldError(field, 'Phone number is required');
            return false;
        }

        const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateAddress(field, value) {
        if (!value) {
            this.showFieldError(field, 'Address is required');
            return false;
        }

        if (value.length < 10) {
            this.showFieldError(field, 'Please enter a complete address');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateCity(field, value) {
        if (!value) {
            this.showFieldError(field, 'City is required');
            return false;
        }

        if (!/^[a-zA-Z\s]+$/.test(value)) {
            this.showFieldError(field, 'City name can only contain letters and spaces');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateState(field, value) {
        if (!value) {
            this.showFieldError(field, 'State is required');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validatePincode(field, value) {
        if (!value) {
            this.showFieldError(field, 'PIN code is required');
            return false;
        }

        if (!/^[0-9]{6}$/.test(value)) {
            this.showFieldError(field, 'PIN code must be exactly 6 digits');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validatePassword(field, value) {
        if (!value) {
            this.showFieldError(field, 'Password is required');
            return false;
        }

        if (value.length < 8) {
            this.showFieldError(field, 'Password must be at least 8 characters long');
            return false;
        }

        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            this.showFieldError(field, 'Password must contain uppercase, lowercase, and numbers');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateConfirmPassword(field, value) {
        const password = this.passwordInput.value;

        if (!value) {
            this.showFieldError(field, 'Please confirm your password');
            return false;
        }

        if (value !== password) {
            this.showFieldError(field, 'Passwords do not match');
            return false;
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateTerms() {
        const termsCheckbox = document.getElementById('agreeTerms');
        const existingError = document.querySelector('.terms-error');
        
        if (existingError) {
            existingError.remove();
        }

        if (!termsCheckbox.checked) {
            const errorElement = document.createElement('div');
            errorElement.className = 'terms-error text-danger small mt-1';
            errorElement.textContent = 'You must agree to the terms and conditions';
            termsCheckbox.parentNode.parentNode.appendChild(errorElement);
            return false;
        }

        return true;
    }

    updatePasswordStrength() {
        const password = this.passwordInput.value;
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthBar || !strengthText) return;

        const strength = this.calculatePasswordStrength(password);
        
        strengthBar.className = 'strength-fill';
        
        if (password.length === 0) {
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Password strength';
            strengthText.className = 'strength-text text-muted';
        } else if (strength < 2) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.className = 'strength-text text-danger';
        } else if (strength < 3) {
            strengthBar.classList.add('fair');
            strengthText.textContent = 'Fair password';
            strengthText.className = 'strength-text text-warning';
        } else if (strength < 4) {
            strengthBar.classList.add('good');
            strengthText.textContent = 'Good password';
            strengthText.className = 'strength-text text-info';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong password';
            strengthText.className = 'strength-text text-success';
        }
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        e.target.value = value;
    }

    formatPincode(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 6) {
            value = value.slice(0, 6);
        }
        
        e.target.value = value;
    }

    async checkEmailAvailability() {
        const email = document.getElementById('email').value.trim();
        
        if (!email || !this.validateEmail(document.getElementById('email'), email)) {
            return;
        }

        // Since we don't have email check endpoint, skip this check
        // The backend will handle duplicate email validation during registration
        console.log('Email validation will be handled during registration');
    }

    async submitRegistration() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            const registrationData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode'),
                password: formData.get('password'),
                newsletter: formData.get('newsletter') === 'on'
            };

            // Call backend API with complete user data
            const response = await fetch(`${API_BASE_URL}/auth/signUp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: registrationData.firstName + ' ' + registrationData.lastName,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    passwordHash: registrationData.password,
                    role: 'CUSTOMER',
                    city: registrationData.city,
                    address: registrationData.address + ', ' + registrationData.state + ' - ' + registrationData.pincode
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.handleRegistrationResponse(result);
            } else {
                throw new Error(result.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showErrorMessage(error.message || 'Registration failed. Please try again.');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    handleRegistrationResponse(response) {
        if (response.jwt && response.message === 'Register Success') {
            // Store enhanced user data and token
            localStorage.setItem('authToken', response.jwt);
            localStorage.setItem('userRole', response.role);
            
            // Store additional user information if available
            if (response.userId) localStorage.setItem('userId', response.userId);
            if (response.userName) localStorage.setItem('userName', response.userName);
            if (response.userEmail) localStorage.setItem('userEmail', response.userEmail);
            
            // Show custom welcome message if available
            const welcomeMessage = response.welcomeMessage || 'Account created successfully! Welcome to ServiceHub!';
            this.showSuccessMessage(welcomeMessage);
            
            // Clear form
            this.form.reset();
            this.clearAllFieldStates();
            
            // Use dashboard URL from response or fallback to customer dashboard
            const redirectUrl = response.dashboardUrl || 'customer-dashboard.html';
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            this.showErrorMessage(response.message || 'Registration failed. Please try again.');
        }
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        const errorElement = field.closest('.mb-3').querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('is-invalid');
    }

    showFieldError(field, message) {
        this.clearFieldError(field.id);
        
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        errorElement.textContent = message;
        
        field.closest('.mb-3').appendChild(errorElement);
    }

    showFieldSuccess(field) {
        this.clearFieldError(field.id);
        
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
    }

    clearAllFieldStates() {
        const fields = this.form.querySelectorAll('.form-control, .form-select');
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
        
        const errors = this.form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
        // Reset password strength indicator
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        if (strengthBar && strengthText) {
            strengthBar.className = 'strength-fill';
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Password strength';
            strengthText.className = 'strength-text text-muted';
        }
    }

    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.replace('*', '').replace(/[^\w\s]/gi, '').trim();
        }
        return field.name.charAt(0).toUpperCase() + field.name.slice(1);
    }

    showSuccessMessage(message) {
        this.showAlert('success', message);
    }

    showErrorMessage(message) {
        this.showAlert('danger', message);
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
        
        // Auto-dismiss after 6 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 6000);
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
}