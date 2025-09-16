// Post Work Request JavaScript
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const postWork = new PostWorkManager();
});

class PostWorkManager {
    constructor() {
        this.form = document.getElementById('postWorkForm');
        this.selectedCategory = null;
        this.userLocation = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupCategorySelection();
        this.loadUserInfo();
        this.getUserLocation();
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'CUSTOMER') {
            alert('Access denied. Only customers can post work requests.');
            window.location.href = 'customer-login.html';
            return;
        }
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber.bind(this));
        }

        // Budget validation
        const budgetMin = document.getElementById('budgetMin');
        const budgetMax = document.getElementById('budgetMax');
        
        if (budgetMin && budgetMax) {
            budgetMin.addEventListener('change', () => this.validateBudgetRange());
            budgetMax.addEventListener('change', () => this.validateBudgetRange());
        }

        // Set minimum date to today
        const preferredDate = document.getElementById('preferredDate');
        if (preferredDate) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            preferredDate.min = now.toISOString().slice(0, 16);
        }
    }

    setupCategorySelection() {
        const categoryOptions = document.querySelectorAll('.category-option');
        const hiddenCategoryInput = document.getElementById('selectedCategory');

        categoryOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selection from all options
                categoryOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                option.classList.add('selected');
                
                // Update hidden input
                this.selectedCategory = option.dataset.category;
                hiddenCategoryInput.value = this.selectedCategory;
            });
        });
    }

    loadUserInfo() {
        const userName = localStorage.getItem('userName');
        if (userName) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userName;
            }
        }
    }

    async getUserLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.userLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                    },
                    (error) => {
                        console.warn('Location access denied:', error);
                        // Use default location (Delhi)
                        this.userLocation = {
                            latitude: 28.6139,
                            longitude: 77.2090
                        };
                    }
                );
            } else {
                // Use default location
                this.userLocation = {
                    latitude: 28.6139,
                    longitude: 77.2090
                };
            }
        } catch (error) {
            console.error('Error getting location:', error);
            this.userLocation = {
                latitude: 28.6139,
                longitude: 77.2090
            };
        }
    }

    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        if (value.length === 10 && !value.startsWith('0')) {
            value = '+91 ' + value;
        }
        
        event.target.value = value;
    }

    validateBudgetRange() {
        const budgetMin = document.getElementById('budgetMin');
        const budgetMax = document.getElementById('budgetMax');
        
        if (budgetMin.value && budgetMax.value) {
            const min = parseFloat(budgetMin.value);
            const max = parseFloat(budgetMax.value);
            
            if (max < min) {
                budgetMax.setCustomValidity('Maximum budget cannot be less than minimum budget');
            } else {
                budgetMax.setCustomValidity('');
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        if (!this.selectedCategory) {
            this.showError('Please select a work category');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Posting...';

            // Collect form data
            const formData = this.collectFormData();
            
            // Validate form data
            if (!this.validateFormData(formData)) {
                return;
            }

            // Submit to backend
            const response = await this.submitWorkRequest(formData);
            
            if (response.ok) {
                const result = await response.json();
                this.handleSuccess(result);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to post work request');
            }

        } catch (error) {
            console.error('Error posting work request:', error);
            this.showError(error.message || 'Failed to post work request. Please try again.');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    collectFormData() {
        return {
            title: document.getElementById('workTitle').value.trim(),
            description: document.getElementById('workDescription').value.trim(),
            category: this.selectedCategory,
            location: document.getElementById('workLocation').value.trim(),
            address: document.getElementById('workAddress').value.trim(),
            latitude: this.userLocation ? this.userLocation.latitude : 28.6139,
            longitude: this.userLocation ? this.userLocation.longitude : 77.2090,
            budgetMin: document.getElementById('budgetMin').value ? parseFloat(document.getElementById('budgetMin').value) : null,
            budgetMax: document.getElementById('budgetMax').value ? parseFloat(document.getElementById('budgetMax').value) : null,
            preferredDate: document.getElementById('preferredDate').value ? new Date(document.getElementById('preferredDate').value).toISOString() : null,
            isUrgent: document.getElementById('isUrgent').checked,
            phoneNumber: document.getElementById('phoneNumber').value.trim()
        };
    }

    validateFormData(formData) {
        if (!formData.title) {
            this.showError('Work title is required');
            return false;
        }

        if (!formData.category) {
            this.showError('Please select a category');
            return false;
        }

        if (!formData.location) {
            this.showError('Location is required');
            return false;
        }

        if (!formData.address) {
            this.showError('Full address is required');
            return false;
        }

        if (!formData.phoneNumber) {
            this.showError('Contact number is required');
            return false;
        }

        if (formData.budgetMin && formData.budgetMax && formData.budgetMax < formData.budgetMin) {
            this.showError('Maximum budget cannot be less than minimum budget');
            return false;
        }

        return true;
    }

    async submitWorkRequest(formData) {
        const authToken = localStorage.getItem('authToken');
        
        return await fetch(`${API_BASE_URL}/api/work-requests/customer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    }

    handleSuccess(result) {
        this.showSuccess('Work request posted successfully! Workers will be able to see and apply for your request.');
        
        // Clear form
        this.form.reset();
        this.selectedCategory = null;
        document.getElementById('selectedCategory').value = '';
        document.querySelectorAll('.category-option').forEach(opt => opt.classList.remove('selected'));
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'customer-dashboard.html';
        }, 3000);
    }

    showError(message) {
        this.showAlert('danger', message);
    }

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showAlert(type, message) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-custom');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed alert-custom`;
        alertElement.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertElement.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertElement);
        
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
}

// Global logout function
window.logout = function() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        window.location.href = 'index.html';
    }
};