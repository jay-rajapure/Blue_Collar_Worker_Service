// Booking JavaScript
// Booking functionality
// Uses global API_BASE_URL from main.js

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
        // Get service ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const workId = urlParams.get('workId');

        if (!workId) {
            this.showError('Invalid service selection. Please go back and select a service.');
            return;
        }

        this.loadWorkDetails(workId);
        // No need to load specific worker - system will auto-assign
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
        if (!this.currentService) return;

        document.getElementById('serviceName').textContent = this.currentService.title;
        document.getElementById('workerName').textContent = 'Worker: Auto-assigned (Best Available)';
        document.getElementById('serviceDescription').textContent = 
            `Description: ${this.currentService.description}`;
        document.getElementById('servicePrice').textContent = `₹${this.currentService.charges}`;
        document.getElementById('serviceDuration').textContent = 
            `Duration: ${this.currentService.estimatedTimeHours} hrs`;

        this.updateSummary();
    }

    updateSummary() {
        if (!this.currentService) return;

        // Update summary fields
        document.getElementById('summaryService').textContent = this.currentService.title;
        document.getElementById('summaryWorker').textContent = 'Auto-assigned (Best Available)';
        
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

            const response = await fetch(`${API_BASE_URL}/api/bookings/auto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showBookingSuccess(result);
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
            // No workerId needed - system will auto-assign
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

    showBookingSuccess(bookingResult) {
        // Hide the form and show success message
        this.form.style.display = 'none';
        
        // Create success confirmation view
        const successContainer = document.createElement('div');
        successContainer.className = 'booking-success-container text-center';
        successContainer.innerHTML = `
            <div class="success-animation mb-4">
                <div class="success-checkmark">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
            </div>
            
            <h2 class="text-success fw-bold mb-3">
                <i class="fas fa-check-circle me-2"></i>Booking Confirmed!
            </h2>
            
            <p class="lead text-muted mb-4">
                Your service has been successfully booked. We've sent confirmation details to your email and phone.
            </p>
            
            <div class="booking-confirmation-card">
                <div class="card border-success mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-receipt me-2"></i>Booking Confirmation
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <strong>Booking ID:</strong><br>
                                <span class="text-primary">#${bookingResult.id || 'BK' + Date.now()}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Status:</strong><br>
                                <span class="badge bg-warning">Pending Confirmation</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Service:</strong><br>
                                ${this.currentService.title}
                            </div>
                            <div class="col-md-6">
                                <strong>Worker:</strong><br>
                                ${bookingResult.workerName || 'Auto-assigned'}
                            </div>
                            <div class="col-md-6">
                                <strong>Scheduled Date:</strong><br>
                                ${this.getFormattedDateTime()}
                            </div>
                            <div class="col-md-6">
                                <strong>Total Amount:</strong><br>
                                <span class="h5 text-success">₹${this.calculateTotal()}</span>
                            </div>
                            <div class="col-12">
                                <strong>Service Address:</strong><br>
                                ${document.getElementById('address').value}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="next-steps-card mb-4">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0">
                            <i class="fas fa-list-check me-2"></i>What Happens Next?
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row g-3 text-start">
                            <div class="col-md-6">
                                <div class="d-flex align-items-start">
                                    <div class="step-number">1</div>
                                    <div>
                                        <strong>Worker Review</strong><br>
                                        <small class="text-muted">The worker will review your booking request within 2-4 hours</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-start">
                                    <div class="step-number">2</div>
                                    <div>
                                        <strong>Confirmation</strong><br>
                                        <small class="text-muted">You'll receive SMS/Email confirmation once accepted</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-start">
                                    <div class="step-number">3</div>
                                    <div>
                                        <strong>Service Day</strong><br>
                                        <small class="text-muted">Worker will arrive at scheduled time</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-start">
                                    <div class="step-number">4</div>
                                    <div>
                                        <strong>Payment</strong><br>
                                        <small class="text-muted">Pay securely after service completion</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-info mb-4">
                <div class="alert alert-light border">
                    <h6 class="mb-2">
                        <i class="fas fa-phone me-2"></i>Need Help?
                    </h6>
                    <p class="mb-1">Contact our support team at <strong>+91 98765 43210</strong></p>
                    <p class="mb-0">Email: <strong>support@servicehub.com</strong></p>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-lg me-3" onclick="window.location.href='my-bookings.html'">
                    <i class="fas fa-calendar-alt me-2"></i>View My Bookings
                </button>
                <button class="btn btn-outline-secondary btn-lg me-3" onclick="window.location.href='services.html'">
                    <i class="fas fa-plus me-2"></i>Book Another Service
                </button>
                <button class="btn btn-outline-info btn-lg" onclick="window.print()">
                    <i class="fas fa-print me-2"></i>Print Confirmation
                </button>
            </div>
        `;
        
        // Add success styles
        const successStyles = document.createElement('style');
        successStyles.textContent = `
            .booking-success-container {
                animation: fadeInUp 0.6s ease-out;
            }
            
            .success-checkmark {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: block;
                stroke-width: 3;
                stroke: #4CAF50;
                stroke-miterlimit: 10;
                margin: 10px auto;
                box-shadow: inset 0px 0px 0px #4CAF50;
                animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                position: relative;
            }
            
            .success-checkmark .check-icon {
                width: 80px;
                height: 80px;
                position: relative;
                border-radius: 50%;
                box-sizing: border-box;
                border: 3px solid #4CAF50;
            }
            
            .success-checkmark .check-icon::before {
                top: 3px;
                left: -2px;
                width: 30px;
                transform-origin: 100% 50%;
                border-radius: 100px 0 0 100px;
            }
            
            .success-checkmark .check-icon::after {
                top: 0;
                left: 30px;
                width: 60px;
                transform-origin: 0 50%;
                border-radius: 0 100px 100px 0;
                animation: rotate-circle 4.25s ease-in;
            }
            
            .success-checkmark .check-icon::before, 
            .success-checkmark .check-icon::after {
                content: '';
                height: 100px;
                position: absolute;
                background: #FFFFFF;
                transform: rotate(-45deg);
            }
            
            .success-checkmark .icon-line {
                height: 3px;
                background-color: #4CAF50;
                display: block;
                border-radius: 2px;
                position: absolute;
                z-index: 10;
            }
            
            .success-checkmark .icon-line.line-tip {
                top: 46px;
                left: 14px;
                width: 25px;
                transform: rotate(45deg);
                animation: icon-line-tip 0.75s;
            }
            
            .success-checkmark .icon-line.line-long {
                top: 38px;
                right: 8px;
                width: 47px;
                transform: rotate(-45deg);
                animation: icon-line-long 0.75s;
            }
            
            .success-checkmark .icon-circle {
                top: -3px;
                left: -3px;
                z-index: 10;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                position: absolute;
                box-sizing: content-box;
                border: 3px solid #4CAF50;
            }
            
            .success-checkmark .icon-fix {
                top: 8px;
                width: 5px;
                left: 26px;
                z-index: 1;
                height: 85px;
                position: absolute;
                transform: rotate(-45deg);
                background-color: #FFFFFF;
            }
            
            .step-number {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #007bff;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 15px;
                flex-shrink: 0;
            }
            
            @keyframes icon-line-tip {
                0% { width: 0; left: 1px; top: 19px; }
                54% { width: 0; left: 1px; top: 19px; }
                70% { width: 50px; left: -8px; top: 37px; }
                84% { width: 17px; left: 21px; top: 48px; }
                100% { width: 25px; left: 14px; top: 46px; }
            }
            
            @keyframes icon-line-long {
                0% { width: 0; right: 46px; top: 54px; }
                65% { width: 0; right: 46px; top: 54px; }
                84% { width: 55px; right: 0px; top: 35px; }
                100% { width: 47px; right: 8px; top: 38px; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translate3d(0, 40px, 0);
                }
                to {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }
        `;
        
        document.head.appendChild(successStyles);
        
        // Replace form with success message
        this.form.parentNode.appendChild(successContainer);
        
        // Simulate sending confirmation notifications
        this.simulateNotifications();
        
        // Scroll to top to show the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    getFormattedDateTime() {
        const date = document.getElementById('serviceDate').value;
        const time = document.getElementById('serviceTime').value;
        if (date && time) {
            const formattedDate = new Date(date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            return `${formattedDate} at ${formattedTime}`;
        }
        return 'Not specified';
    }
    
    calculateTotal() {
        if (!this.currentService) return '0.00';
        
        let total = this.currentService.charges;
        const isEmergency = document.getElementById('isEmergency').checked;
        if (isEmergency) {
            total *= 1.5; // 50% emergency surcharge
        }
        return total.toFixed(2);
    }
    
    simulateNotifications() {
        // Simulate email notification
        setTimeout(() => {
            this.showNotificationToast('📧', 'Confirmation email sent!', 'success');
        }, 1000);
        
        // Simulate SMS notification
        setTimeout(() => {
            this.showNotificationToast('📱', 'SMS confirmation sent to your phone!', 'info');
        }, 2000);
        
        // Simulate worker notification
        setTimeout(() => {
            this.showNotificationToast('👷', 'Worker has been notified of your booking', 'primary');
        }, 3000);
    }
    
    showNotificationToast(icon, message, type) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; animation: slideInRight 0.3s ease-out;';
        toast.innerHTML = `
            <span style="font-size: 1.2em; margin-right: 8px;">${icon}</span>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
        
        // Add slide animations
        if (!document.getElementById('toast-animations')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toast-animations';
            toastStyles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(toastStyles);
        }
    }
}