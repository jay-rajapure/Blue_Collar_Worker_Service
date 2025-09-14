// Main JavaScript File for ServiceHub
// Utility functions and common functionality

// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Utility Functions
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    }

    static async post(endpoint, data, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers
        });
    }

    static async put(endpoint, data, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers
        });
    }

    static async delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
}

class ServiceHub {
    constructor() {
        this.init();
    }

    init() {
        // Initialize common functionality
        this.setupEventListeners();
        this.setupAnimations();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu handling
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.addEventListener('click', function() {
                const navbar = document.querySelector('.navbar-collapse');
                navbar.classList.toggle('show');
            });
        }
    }

    setupAnimations() {
        // Add fade-in animation to elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        document.querySelectorAll('.service-card, .hero-image, .auth-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupFormValidation() {
        // Basic form validation setup
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', this.clearFieldError.bind(this));
            });
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.validateForm(form)) {
            this.submitForm(form);
        }
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        
        // Clear previous errors
        this.clearFieldError({ target: field });
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }
        
        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Password validation
        if (fieldType === 'password' && value) {
            if (value.length < 8) {
                this.showFieldError(field, 'Password must be at least 8 characters long');
                return false;
            }
        }
        
        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                this.showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // Confirm password validation
        if (fieldName === 'confirmPassword' && value) {
            const password = document.querySelector('input[name="password"]');
            if (password && value !== password.value) {
                this.showFieldError(field, 'Passwords do not match');
                return false;
            }
        }
        
        return true;
    }

    clearFieldError(e) {
        const field = e.target;
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('is-invalid');
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError({ target: field });
        
        // Add error class
        field.classList.add('is-invalid');
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        errorElement.textContent = message;
        
        // Insert error element
        field.parentNode.appendChild(errorElement);
    }

    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.replace('*', '').trim();
        }
        return field.name.charAt(0).toUpperCase() + field.name.slice(1);
    }

    submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.handleFormResponse(form, { success: true });
            
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 2000);
    }

    handleFormResponse(form, response) {
        if (response.success) {
            this.showAlert('success', 'Form submitted successfully!');
            
            // Redirect based on form type
            const formType = this.getFormType(form);
            this.handleSuccessRedirect(formType);
        } else {
            this.showAlert('error', response.message || 'An error occurred. Please try again.');
        }
    }

    getFormType(form) {
        const action = form.getAttribute('data-form-type') || '';
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('login')) return 'login';
        if (currentPage.includes('register')) return 'register';
        
        return action;
    }

    handleSuccessRedirect(formType) {
        // Simulate redirect behavior
        setTimeout(() => {
            switch (formType) {
                case 'customer-login':
                    console.log('Redirecting to customer dashboard...');
                    break;
                case 'worker-login':
                    console.log('Redirecting to worker dashboard...');
                    break;
                case 'customer-register':
                    console.log('Redirecting to customer verification...');
                    break;
                case 'worker-register':
                    console.log('Redirecting to worker verification...');
                    break;
                default:
                    console.log('Redirecting to homepage...');
            }
        }, 1500);
    }

    showAlert(type, message) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert alert at the top of the form
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(alertElement, form.firstChild);
        } else {
            // Insert at the top of the container
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(alertElement, container.firstChild);
            }
        }
        
        // Auto-dismiss success alerts
        if (type === 'success') {
            setTimeout(() => {
                alertElement.remove();
            }, 5000);
        }
    }

    // Utility functions
    static formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Local storage utilities
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    static loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }

    // API Helper Methods
    static async checkBackendConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.warn('Backend connection failed:', error);
            return false;
        }
    }

    static getAuthToken() {
        return localStorage.getItem('authToken');
    }

    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('pendingWorkerUser');
        localStorage.removeItem('pendingCustomerUser');
        window.location.href = '../html/index.html';
    }

    static isAuthenticated() {
        return !!this.getAuthToken() && !!this.getCurrentUser();
    }

    // Error Handling for API calls
    static handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            this.logout();
            return 'Session expired. Please login again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            return 'Access denied. Please check your permissions.';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            return 'Resource not found.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            return 'Server error. Please try again later.';
        } else {
            return error.message || 'An unexpected error occurred.';
        }
    }
}

// Initialize ServiceHub when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.serviceHub = new ServiceHub();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceHub;
}