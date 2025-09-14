// Booking JavaScript
// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
    const booking = new BookingSystem();
});

class BookingSystem {
    constructor() {
        this.currentService = null;
        this.currentWorker = null;
        this.form = document.getElementById('bookingForm');
        this.init();
    }

    init() {
        this.loadServiceDetails();
        this.setupEventListeners();
        this.setupDateTimeValidation();
        this.setupLocationServices();
        this.updateSummary();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleBookingSubmit.bind(this));
        }

        // Real-time validation
        const fields = ['description', 'serviceDate', 'serviceTime', 'address', 'phone'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => {
                    this.clearFieldError(fieldName);
                    this.updateSummary();
                });
            }
        });

        // Special instructions
        const specialInstructions = document.getElementById('specialInstructions');
        if (specialInstructions) {
            specialInstructions.addEventListener('input', this.updateSummary.bind(this));
        }

        // Emergency checkbox
        const emergencyCheckbox = document.getElementById('isEmergency');
        if (emergencyCheckbox) {
            emergencyCheckbox.addEventListener('change', this.handleEmergencyChange.bind(this));
        }

        // Use current location button
        const locationBtn = document.getElementById('useCurrentLocation');
        if (locationBtn) {
            locationBtn.addEventListener('click', this.useCurrentLocation.bind(this));
        }
    }

    setupDateTimeValidation() {
        const dateInput = document.getElementById('serviceDate');
        const timeInput = document.getElementById('serviceTime');

        if (dateInput) {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Set maximum date to 30 days from now
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }

        if (timeInput) {
            // Set default time restrictions (8 AM to 8 PM)
            timeInput.addEventListener('change', this.validateServiceTime.bind(this));
        }
    }

    setupLocationServices() {
        // Auto-fill address if user location is available
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            const location = JSON.parse(savedLocation);
            if (location.address) {
                document.getElementById('address').placeholder = 
                    `Current location: ${location.address}`;
            }
        }
    }

    loadServiceDetails() {
        // Get service and worker IDs from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const workId = urlParams.get('workId');
        const workerId = urlParams.get('workerId');

        if (!workId || !workerId) {
            this.showError('Invalid service or worker selection. Please go back and select a service.');
            return;
        }

        this.loadWorkDetails(workId);
        this.loadWorkerDetails(workerId);
    }

    async loadWorkDetails(workId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/works/${workId}`);
            if (response.ok) {
                this.currentService = await response.json();
                this.displayServiceInfo();
            } else {
                throw new Error('Service not found');
            }
        } catch (error) {
            console.error('Error loading service details:', error);
            this.showError('Failed to load service details. Please try again.');
        }
    }

    async loadWorkerDetails(workerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/${workerId}`);
            if (response.ok) {
                this.currentWorker = await response.json();
                this.displayServiceInfo();
            } else {
                throw new Error('Worker not found');
            }
        } catch (error) {
            console.error('Error loading worker details:', error);
            this.showError('Failed to load worker details. Please try again.');
        }
    }

    displayServiceInfo() {
        if (!this.currentService || !this.currentWorker) return;

        document.getElementById('serviceName').textContent = this.currentService.title;
        document.getElementById('workerName').textContent = `Worker: ${this.currentWorker.name}`;
        document.getElementById('serviceDescription').textContent = 
            `Description: ${this.currentService.description}`;
        document.getElementById('servicePrice').textContent = `₹${this.currentService.charges}`;
        document.getElementById('serviceDuration').textContent = 
            `Duration: ${this.currentService.estimatedTimeHours} hrs`;

        this.updateSummary();
    }

    updateSummary() {
        if (!this.currentService || !this.currentWorker) return;

        // Update summary fields
        document.getElementById('summaryService').textContent = this.currentService.title;
        document.getElementById('summaryWorker').textContent = this.currentWorker.name;
        
        const date = document.getElementById('serviceDate').value;
        const time = document.getElementById('serviceTime').value;
        if (date && time) {
            const formattedDate = new Date(date).toLocaleDateString();
            document.getElementById('summaryDateTime').textContent = `${formattedDate} at ${time}`;
        }

        // Calculate total (base price + emergency fee if applicable)
        let total = this.currentService.charges;
        const isEmergency = document.getElementById('isEmergency').checked;
        if (isEmergency) {
            total *= 1.5; // 50% emergency surcharge
        }
        document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
    }

    handleEmergencyChange(e) {
        const emergencyInfo = document.createElement('div');
        emergencyInfo.className = 'alert alert-warning mt-2';
        emergencyInfo.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Emergency Service:</strong> Additional 50% surcharge applies for urgent requests.
        `;

        // Remove existing emergency info
        const existingInfo = document.querySelector('.alert-warning');
        if (existingInfo) {
            existingInfo.remove();
        }

        if (e.target.checked) {
            e.target.closest('.col-md-6').appendChild(emergencyInfo);
        }

        this.updateSummary();
    }

    async useCurrentLocation() {
        const button = document.getElementById('useCurrentLocation');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Getting Location...';
        button.disabled = true;

        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            
            // Use the reverse geocoding from main.js
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
                const data = await response.json();
                const address = this.formatAddress(data);
                document.getElementById('address').value = address;
                this.showSuccess('Current location added successfully!');
            } else {
                throw new Error('Failed to get address');
            }
        } catch (error) {
            console.error('Location error:', error);
            this.showError('Failed to get current location. Please enter address manually.');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    formatAddress(data) {
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
        
        return parts.join(', ');
    }

    validateServiceTime() {
        const timeInput = document.getElementById('serviceTime');
        const time = timeInput.value;
        
        if (!time) return true;

        const [hours, minutes] = time.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        
        // Check if time is between 8 AM (480) and 8 PM (1200)
        if (timeInMinutes < 480 || timeInMinutes > 1200) {
            this.showFieldError(timeInput, 'Service time must be between 8:00 AM and 8:00 PM');
            return false;
        }
        
        this.clearFieldError('serviceTime');
        return true;
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const value = field.value.trim();

        this.clearFieldError(fieldName);

        switch (fieldName) {
            case 'description':
                if (!value) {
                    this.showFieldError(field, 'Please describe what you need help with');
                    return false;
                }
                if (value.length < 10) {
                    this.showFieldError(field, 'Please provide more details (at least 10 characters)');
                    return false;
                }
                break;
                
            case 'serviceDate':
                if (!value) {
                    this.showFieldError(field, 'Please select a service date');
                    return false;
                }
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    this.showFieldError(field, 'Service date cannot be in the past');
                    return false;
                }
                break;
                
            case 'serviceTime':
                if (!value) {
                    this.showFieldError(field, 'Please select a service time');
                    return false;
                }
                return this.validateServiceTime();
                
            case 'address':
                if (!value) {
                    this.showFieldError(field, 'Please provide the service address');
                    return false;
                }
                if (value.length < 10) {
                    this.showFieldError(field, 'Please provide a complete address');
                    return false;
                }
                break;
                
            case 'phone':
                if (!value) {
                    this.showFieldError(field, 'Please provide a contact phone number');
                    return false;
                }
                const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    this.showFieldError(field, 'Please provide a valid phone number');
                    return false;
                }
                break;
        }

        field.classList.add('is-valid');
        return true;
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = this.form.querySelector('button[type=\"submit\"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin me-2\"></i>Creating Booking...';

        try {
            const bookingData = this.getBookingData();
            
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Please login to make a booking');
            }

            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Booking created successfully!');
                
                // Redirect to bookings page after delay
                setTimeout(() => {
                    window.location.href = 'my-bookings.html';
                }, 2000);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            this.showError(error.message || 'Failed to create booking. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    getBookingData() {
        const formData = new FormData(this.form);
        const date = formData.get('serviceDate');
        const time = formData.get('serviceTime');
        
        // Combine date and time
        const scheduledDate = new Date(`${date}T${time}`);
        
        return {
            workId: this.currentService.id,
            workerId: this.currentWorker.id,
            description: formData.get('description'),
            scheduledDate: scheduledDate.toISOString(),
            customerAddress: formData.get('address'),
            customerPhone: formData.get('phone'),
            specialInstructions: formData.get('specialInstructions')
        };
    }

    validateForm() {
        const fields = ['description', 'serviceDate', 'serviceTime', 'address', 'phone'];
        let isValid = true;

        fields.forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            this.showError('Please agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = field.closest('.col-12, .col-md-6').querySelector('.field-error');
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
        
        field.closest('.col-12, .col-md-6').appendChild(errorElement);
    }

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showError(message) {
        this.showAlert('danger', message);
    }

    showAlert(type, message) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            <i class=\"fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2\"></i>
            ${message}
            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>
        `;
        
        // Insert at top of form
        this.form.insertBefore(alertElement, this.form.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }
}