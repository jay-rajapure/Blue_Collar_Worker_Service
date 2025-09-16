// Main JavaScript File for ServiceHub
// Utility functions and common functionality

// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080';

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
            // Skip forms that have specific handlers (like registration forms)
            if (form.id === 'customerRegisterForm' || form.id === 'workerRegisterForm' || form.id === 'registrationForm' || form.classList.contains('has-custom-handler')) {
                return;
            }
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
        // Only redirect on actual form success, not on errors
        setTimeout(() => {
            switch (formType) {
                case 'customer-login':
                    console.log('Redirecting to customer dashboard...');
                    // window.location.href = 'customer-dashboard.html';
                    break;
                case 'worker-login':
                    console.log('Redirecting to worker dashboard...');
                    // window.location.href = 'worker-dashboard.html';
                    break;
                case 'customer-register':
                    console.log('Redirecting to customer verification...');
                    // window.location.href = 'customer-login.html';
                    break;
                case 'worker-register':
                    console.log('Redirecting to worker verification...');
                    // window.location.href = 'worker-login.html';
                    break;
                default:
                    console.log('Form submitted successfully');
                    // Don't redirect by default
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
            // Use a simple GET request to auth endpoint to check if backend is running
            const response = await fetch(`${API_BASE_URL}/auth/`);
            return response.status !== 404; // Backend is running if we don't get 404
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

// Geolocation API Functions
let userLocation = {
    latitude: null,
    longitude: null,
    address: null
};

// Get user's current location
function getLocation() {
    const locationElement = document.getElementById('userLocation');
    const button = locationElement.querySelector('button');
    
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by this browser.');
        return;
    }
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Getting Location...';
    button.disabled = true;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
    };
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            
            // Get address from coordinates
            reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        function(error) {
            handleLocationError(error);
            // Reset button
            button.innerHTML = '<i class="fas fa-location-arrow me-1"></i>Get Location';
            button.disabled = false;
        },
        options
    );
}

// Reverse geocoding to get address from coordinates
async function reverseGeocode(latitude, longitude) {
    try {
        // Using OpenStreetMap Nominatim API for reverse geocoding (free alternative)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        
        if (response.ok) {
            const data = await response.json();
            const address = formatAddress(data);
            userLocation.address = address;
            
            displayLocation(address, latitude, longitude);
        } else {
            throw new Error('Geocoding service unavailable');
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to just coordinates
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        userLocation.address = fallbackAddress;
        displayLocation(fallbackAddress, latitude, longitude);
    }
}

// Format address from geocoding response
function formatAddress(data) {
    const address = data.address || {};
    const parts = [];
    
    if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
        parts.push(address.road);
    }
    
    if (address.neighbourhood || address.suburb) {
        parts.push(address.neighbourhood || address.suburb);
    }
    
    if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
    }
    
    if (address.state) {
        parts.push(address.state);
    }
    
    if (address.postcode) {
        parts.push(address.postcode);
    }
    
    return parts.length > 0 ? parts.join(', ') : data.display_name || 'Location found';
}

// Display the location in the UI
function displayLocation(address, latitude, longitude) {
    const locationElement = document.getElementById('userLocation');
    
    locationElement.innerHTML = `
        <div class="location-result">
            <div class="fw-semibold text-success mb-1">
                <i class="fas fa-map-marker-alt me-1"></i>${address}
            </div>
            <div class="small text-muted">
                Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}
            </div>
            <button class="btn btn-outline-secondary btn-sm mt-2" onclick="getLocation()">
                <i class="fas fa-sync-alt me-1"></i>Update Location
            </button>
            <button class="btn btn-outline-info btn-sm mt-2 ms-2" onclick="showNearbyServices()">
                <i class="fas fa-search me-1"></i>Find Services
            </button>
        </div>
    `;
    
    // Store location in localStorage for later use
    localStorage.setItem('userLocation', JSON.stringify(userLocation));
    
    // Show success message
    showLocationSuccess('Location detected successfully!');
}

// Handle geolocation errors
function handleLocationError(error) {
    let message = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location access denied by user. Please enable location services.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again.';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        default:
            message = 'An unknown error occurred while retrieving location.';
            break;
    }
    
    showLocationError(message);
}

// Show location error message
function showLocationError(message) {
    const locationElement = document.getElementById('userLocation');
    locationElement.innerHTML = `
        <div class="text-danger small">
            <i class="fas fa-exclamation-triangle me-1"></i>${message}
        </div>
        <button class="btn btn-outline-primary btn-sm mt-2" onclick="getLocation()">
            <i class="fas fa-location-arrow me-1"></i>Try Again
        </button>
    `;
}

// Show location success message
function showLocationSuccess(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show mt-2';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const locationElement = document.getElementById('userLocation');
    locationElement.appendChild(successDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Show nearby services based on location
function showNearbyServices() {
    if (!userLocation.latitude || !userLocation.longitude) {
        alert('Please get your location first!');
        return;
    }
    
    // This would integrate with your backend API to find nearby services
    alert(`Finding services near ${userLocation.address}...\n\nThis feature will show nearby workers and services based on your location.`);
    
    // Example of how this might work with your backend:
    // fetchNearbyServices(userLocation.latitude, userLocation.longitude);
}

// Function to fetch nearby services (integration with backend)
async function fetchNearbyServices(latitude, longitude, radius = 10) {
    try {
        const response = await ApiClient.get(
            `/api/works?lat=${latitude}&lon=${longitude}&radius=${radius}`
        );
        
        console.log('Nearby services:', response);
        return response;
    } catch (error) {
        console.error('Error fetching nearby services:', error);
        throw error;
    }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Auto-detect location on page load (with user permission)
function autoDetectLocation() {
    const savedLocation = localStorage.getItem('userLocation');
    
    if (savedLocation) {
        const location = JSON.parse(savedLocation);
        if (location.address) {
            displayLocation(location.address, location.latitude, location.longitude);
            userLocation = location;
        }
    }
}

// Call auto-detect when page loads
if (document.getElementById('userLocation')) {
    setTimeout(autoDetectLocation, 1000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceHub;
}