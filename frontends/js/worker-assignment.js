// Worker Assignment Management JavaScript
// Handles customer interaction with assigned workers
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const assignmentManager = new WorkerAssignmentManager();
});

class WorkerAssignmentManager {
    constructor() {
        this.currentBooking = null;
        this.assignedWorker = null;
        this.init();
    }

    init() {
        if (!this.checkAuthentication()) {
            return;
        }
        
        this.loadBookingDetails();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'CUSTOMER') {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    redirectToLogin() {
        window.location.href = 'customer-login.html';
    }

    loadBookingDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');
        
        if (!bookingId) {
            this.showError('Invalid booking ID');
            return;
        }
        
        this.fetchBookingDetails(bookingId);
    }

    async fetchBookingDetails(bookingId) {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                this.currentBooking = await response.json();
                await this.loadWorkerProfile(this.currentBooking.workerId);
                this.displayBookingDetails();
            } else {
                throw new Error('Booking not found');
            }
        } catch (error) {
            console.error('Error loading booking:', error);
            this.showError('Failed to load booking details');
        }
    }

    async loadWorkerProfile(workerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/worker-profile/${workerId}`);
            
            if (response.ok) {
                this.assignedWorker = await response.json();
            } else {
                console.error('Failed to load worker profile');
            }
        } catch (error) {
            console.error('Error loading worker profile:', error);
        }
    }

    displayBookingDetails() {
        if (!this.currentBooking) return;

        // Update booking information
        document.getElementById('bookingId').textContent = `#${this.currentBooking.id}`;
        document.getElementById('serviceTitle').textContent = this.currentBooking.workTitle;
        document.getElementById('scheduledDate').textContent = this.formatDate(this.currentBooking.scheduledDate);
        document.getElementById('totalAmount').textContent = `₹${this.currentBooking.totalAmount}`;
        document.getElementById('bookingStatus').textContent = this.getStatusText(this.currentBooking.status);
        document.getElementById('customerAddress').textContent = this.currentBooking.customerAddress;
        
        // Update status badge color
        const statusBadge = document.getElementById('bookingStatus');
        statusBadge.className = `badge ${this.getStatusBadgeClass(this.currentBooking.status)}`;
        
        // Display worker profile if available
        if (this.assignedWorker) {
            this.displayWorkerProfile();
        }
        
        // Show/hide action buttons based on booking status
        this.updateActionButtons();
    }

    displayWorkerProfile() {
        if (!this.assignedWorker) return;

        document.getElementById('workerName').textContent = this.assignedWorker.name;
        document.getElementById('workerRating').textContent = `${this.assignedWorker.rating.toFixed(1)} (${this.assignedWorker.totalRatings} reviews)`;
        document.getElementById('workerExperience').textContent = `${this.assignedWorker.experienceYears} years`;
        document.getElementById('workerPhone').textContent = this.assignedWorker.phone;
        document.getElementById('workerCity').textContent = this.assignedWorker.city;
        
        if (this.assignedWorker.bio) {
            document.getElementById('workerBio').textContent = this.assignedWorker.bio;
        }
        
        if (this.assignedWorker.skills) {
            document.getElementById('workerSkills').textContent = this.assignedWorker.skills;
        }
        
        if (this.assignedWorker.certifications) {
            document.getElementById('workerCertifications').textContent = this.assignedWorker.certifications;
        }
        
        // Generate star rating
        this.displayStarRating(this.assignedWorker.rating);
    }

    displayStarRating(rating) {
        const starsContainer = document.getElementById('workerStars');
        starsContainer.innerHTML = '';
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < fullStars) {
                star.className = 'fas fa-star text-warning';
            } else if (i === fullStars && hasHalfStar) {
                star.className = 'fas fa-star-half-alt text-warning';
            } else {
                star.className = 'far fa-star text-warning';
            }
            starsContainer.appendChild(star);
        }
    }

    updateActionButtons() {
        const rejectBtn = document.getElementById('rejectWorkerBtn');
        const acceptBtn = document.getElementById('acceptWorkerBtn');
        
        if (this.currentBooking.status === 'WORKER_ASSIGNED') {
            rejectBtn.style.display = 'inline-block';
            acceptBtn.style.display = 'inline-block';
        } else {
            rejectBtn.style.display = 'none';
            acceptBtn.style.display = 'none';
        }
    }

    setupEventListeners() {
        const rejectBtn = document.getElementById('rejectWorkerBtn');
        const acceptBtn = document.getElementById('acceptWorkerBtn');
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', this.handleRejectWorker.bind(this));
        }
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', this.handleAcceptWorker.bind(this));
        }
    }

    async handleRejectWorker() {
        const result = await this.showConfirmDialog(
            'Reject Worker', 
            `Are you sure you want to reject ${this.assignedWorker.name}? We'll assign the next best available worker.`,
            'Reject Worker'
        );
        
        if (!result) return;
        
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${this.currentBooking.id}/reject-worker?rejectionReason=Customer requested different worker`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                this.showSuccess('Worker rejected successfully. Assigning next available worker...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error('Failed to reject worker');
            }
        } catch (error) {
            console.error('Error rejecting worker:', error);
            this.showError('Failed to reject worker. Please try again.');
        }
    }

    async handleAcceptWorker() {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${this.currentBooking.id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: new URLSearchParams({
                    status: 'CONFIRMED'
                })
            });

            if (response.ok) {
                this.showSuccess('Worker confirmed! Your booking is now active.');
                setTimeout(() => {
                    window.location.href = 'my-bookings.html';
                }, 2000);
            } else {
                throw new Error('Failed to confirm worker');
            }
        } catch (error) {
            console.error('Error confirming worker:', error);
            this.showError('Failed to confirm worker. Please try again.');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': 'Pending',
            'WORKER_ASSIGNED': 'Worker Assigned - Awaiting Your Approval',
            'WORKER_REJECTED': 'Finding New Worker',
            'CONFIRMED': 'Confirmed',
            'IN_PROGRESS': 'In Progress',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
            'REJECTED': 'Rejected'
        };
        return statusMap[status] || status;
    }

    getStatusBadgeClass(status) {
        const classMap = {
            'PENDING': 'bg-warning',
            'WORKER_ASSIGNED': 'bg-info',
            'WORKER_REJECTED': 'bg-warning',
            'CONFIRMED': 'bg-success',
            'IN_PROGRESS': 'bg-primary',
            'COMPLETED': 'bg-success',
            'CANCELLED': 'bg-danger',
            'REJECTED': 'bg-danger'
        };
        return classMap[status] || 'bg-secondary';
    }

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showError(message) {
        this.showAlert('danger', message);
    }

    showAlert(type, message) {
        const alertContainer = document.getElementById('alertContainer');
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            <i class=\"fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2\"></i>
            ${message}
            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>
        `;
        
        alertContainer.appendChild(alertElement);
        
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }

    async showConfirmDialog(title, message, confirmText) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class=\"modal-dialog\">
                    <div class=\"modal-content\">
                        <div class=\"modal-header\">
                            <h5 class=\"modal-title\">${title}</h5>
                            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\"></button>
                        </div>
                        <div class=\"modal-body\">
                            <p>${message}</p>
                        </div>
                        <div class=\"modal-footer\">
                            <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Cancel</button>
                            <button type=\"button\" class=\"btn btn-danger\" id=\"confirmBtn\">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            modal.querySelector('#confirmBtn').addEventListener('click', () => {
                bsModal.hide();
                resolve(true);
            });
            
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    }
}