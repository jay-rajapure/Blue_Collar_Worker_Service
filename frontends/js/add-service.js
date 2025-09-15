// Add Service JavaScript
// Service registration functionality for workers
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const addService = new AddServiceManager();
});

class AddServiceManager {
    constructor() {
        this.form = document.getElementById('addServiceForm');
        this.latitude = null;
        this.longitude = null;
        this.imageFile = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupImageHandling();
        this.setupLocationHandling();
        this.setupFormValidation();
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'WORKER') {
            alert('Access denied. Only workers can add services.');
            window.location.href = 'worker-login.html';
            return;
        }
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Character counter for description
        const descriptionField = document.getElementById('serviceDescription');
        const counter = document.getElementById('descriptionCounter');
        
        if (descriptionField && counter) {
            descriptionField.addEventListener('input', () => {
                const currentLength = descriptionField.value.length;
                counter.textContent = currentLength;
                
                // Change color based on usage
                if (currentLength > 800) {
                    counter.style.color = '#dc3545'; // Red
                } else if (currentLength > 600) {
                    counter.style.color = '#fd7e14'; // Orange
                } else {
                    counter.style.color = '#6c757d'; // Gray
                }
            });
        }

        // Location type radio buttons
        const onSiteRadio = document.getElementById('onSite');
        const fixedLocationRadio = document.getElementById('fixedLocation');
        const locationSection = document.getElementById('locationSection');

        if (onSiteRadio && fixedLocationRadio && locationSection) {
            onSiteRadio.addEventListener('change', () => {
                if (onSiteRadio.checked) {
                    locationSection.style.display = 'none';
                    this.latitude = null;
                    this.longitude = null;
                }
            });

            fixedLocationRadio.addEventListener('change', () => {
                if (fixedLocationRadio.checked) {
                    locationSection.style.display = 'block';
                }
            });
        }

        // Real-time form validation
        const requiredFields = ['serviceTitle', 'serviceCategory', 'serviceDescription', 'serviceCharges', 'estimatedTime'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            }
        });
    }

    setupImageHandling() {
        const imageInput = document.getElementById('serviceImage');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');

        if (imageInput) {
            imageInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                
                if (file) {
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('Image size must be less than 5MB');
                        imageInput.value = '';
                        return;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        alert('Please select a valid image file');
                        imageInput.value = '';
                        return;
                    }

                    this.imageFile = file;

                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImg.src = e.target.result;
                        imagePreview.style.display = 'block';
                        document.querySelector('.image-upload-area').style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    setupLocationHandling() {
        const getLocationBtn = document.getElementById('getLocationBtn');
        const locationDisplay = document.getElementById('locationDisplay');
        const locationText = document.getElementById('locationText');

        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }
    }

    getCurrentLocation() {
        const getLocationBtn = document.getElementById('getLocationBtn');
        const locationDisplay = document.getElementById('locationDisplay');
        const locationText = document.getElementById('locationText');

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser');
            return;
        }

        // Show loading state
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Getting Location...';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;

                try {
                    // Reverse geocoding to get address
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${this.latitude}&lon=${this.longitude}&format=json`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const address = data.display_name || `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
                        
                        locationText.textContent = address;
                        locationDisplay.style.display = 'block';
                        
                        this.showSuccessMessage('Location captured successfully!');
                    } else {
                        throw new Error('Failed to get address');
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                    locationText.textContent = `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
                    locationDisplay.style.display = 'block';
                }

                // Reset button
                getLocationBtn.disabled = false;
                getLocationBtn.innerHTML = '<i class="fas fa-check me-2"></i>Location Captured';
                
                setTimeout(() => {
                    getLocationBtn.innerHTML = '<i class="fas fa-crosshairs me-2"></i>Get Current Location';
                }, 2000);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please try again or enter manually.');
                
                // Reset button
                getLocationBtn.disabled = false;
                getLocationBtn.innerHTML = '<i class="fas fa-crosshairs me-2"></i>Get Current Location';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    setupFormValidation() {
        // Custom validation rules
        const chargesField = document.getElementById('serviceCharges');
        const timeField = document.getElementById('estimatedTime');

        if (chargesField) {
            chargesField.addEventListener('input', () => {
                const value = parseFloat(chargesField.value);
                if (value < 50) {
                    this.showFieldError(chargesField, 'Minimum charge should be ₹50');
                } else if (value > 100000) {
                    this.showFieldError(chargesField, 'Maximum charge should be ₹1,00,000');
                } else {
                    this.clearFieldError(chargesField);
                }
            });
        }

        if (timeField) {
            timeField.addEventListener('input', () => {
                const value = parseFloat(timeField.value);
                if (value < 0.5) {
                    this.showFieldError(timeField, 'Minimum duration should be 0.5 hours');
                } else if (value > 24) {
                    this.showFieldError(timeField, 'Maximum duration should be 24 hours');
                } else {
                    this.clearFieldError(timeField);
                }
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        
        if (field.required && !value) {
            this.showFieldError(field, `${field.previousElementSibling.textContent.replace(' *', '')} is required`);
            return false;
        }

        // Specific validations
        switch (field.id) {
            case 'serviceTitle':
                if (value.length < 10) {
                    this.showFieldError(field, 'Title should be at least 10 characters long');
                    return false;
                }
                break;
            case 'serviceDescription':
                if (value.length < 50) {
                    this.showFieldError(field, 'Description should be at least 50 characters long');
                    return false;
                }
                break;
            case 'serviceCharges':
                const charges = parseFloat(value);
                if (isNaN(charges) || charges < 50 || charges > 100000) {
                    this.showFieldError(field, 'Please enter a valid charge amount (₹50 - ₹1,00,000)');
                    return false;
                }
                break;
            case 'estimatedTime':
                const time = parseFloat(value);
                if (isNaN(time) || time < 0.5 || time > 24) {
                    this.showFieldError(field, 'Please enter a valid duration (0.5 - 24 hours)');
                    return false;
                }
                break;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        // Validate all fields
        let isValid = true;
        const requiredFields = ['serviceTitle', 'serviceCategory', 'serviceDescription', 'serviceCharges', 'estimatedTime'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showErrorMessage('Please fix the errors above before submitting.');
            return;
        }

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Service...';

            await this.submitService();

        } catch (error) {
            console.error('Service creation error:', error);
            this.showErrorMessage(error.message || 'Failed to create service. Please try again.');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async submitService() {
        const authToken = localStorage.getItem('authToken');

        // Create FormData for multipart form submission
        const formData = new FormData();
        
        // Add all form fields (no userId needed - backend gets it from JWT)
        formData.append('title', document.getElementById('serviceTitle').value.trim());
        formData.append('description', document.getElementById('serviceDescription').value.trim());
        formData.append('charges', parseFloat(document.getElementById('serviceCharges').value));
        formData.append('estimatedTimeHours', parseFloat(document.getElementById('estimatedTime').value));
        formData.append('category', document.getElementById('serviceCategory').value);

        // Add location if provided
        const locationType = document.querySelector('input[name="locationType"]:checked').value;
        if (locationType === 'fixed' && this.latitude && this.longitude) {
            formData.append('latitude', this.latitude);
            formData.append('longitude', this.longitude);
        }

        // Add image if provided
        if (this.imageFile) {
            formData.append('image', this.imageFile);
        }

        console.log('Submitting service with data:', {
            title: document.getElementById('serviceTitle').value,
            category: document.getElementById('serviceCategory').value,
            charges: document.getElementById('serviceCharges').value
        });

        // Submit to backend
        const response = await fetch(`${API_BASE_URL}/api/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            this.showSuccessMessage('Service created successfully! Redirecting to your services...');
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'services.html?view=worker';
            }, 2000);
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error('Failed to create service. Please try again.');
        }
    }

    getUserIdFromToken() {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) return null;
            
            // For now, since we know the current worker ID from the database is 2
            // In production, you would:
            // 1. Add userId to JWT claims during token generation
            // 2. Decode the JWT to extract the userId
            
            // Simple approach for current implementation:
            // Use the worker's email to determine user ID
            // Since jayrajapure@gmail.com is worker with ID 2
            const userEmail = localStorage.getItem('userEmail') || 'jayrajapure@gmail.com';
            
            if (userEmail === 'jayrajapure@gmail.com') {
                return 2; // Worker ID from database
            }
            
            // For future tokens, decode properly:
            // const payload = JSON.parse(atob(authToken.split('.')[1]));
            // return payload.userId;
            
            // Fallback
            return 2;
        } catch (error) {
            console.error('Error getting user ID:', error);
            throw new Error('Authentication error. Please login again.');
        }
    }

    showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Global function for removing image
window.removeImage = function() {
    const imageInput = document.getElementById('serviceImage');
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = document.querySelector('.image-upload-area');
    
    if (imageInput) imageInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
    
    // Clear the stored file
    if (window.addServiceManager) {
        window.addServiceManager.imageFile = null;
    }
};

// Global logout function
window.logout = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
};

// Store reference for global access
document.addEventListener('DOMContentLoaded', function() {
    window.addServiceManager = new AddServiceManager();
});