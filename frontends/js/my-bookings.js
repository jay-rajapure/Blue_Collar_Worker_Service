// My Bookings JavaScript
// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
    const myBookings = new MyBookingsManager();
});

class MyBookingsManager {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBookings();
    }

    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', this.applyFilters.bind(this));
        }

        // Search
        const searchInput = document.getElementById('searchBookings');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.applyFilters.bind(this), 300));
        }
    }

    async loadBookings() {
        this.showLoading();
        
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Please login to view your bookings');
            }

            const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                this.bookings = await response.json();
                this.filteredBookings = [...this.bookings];
                this.displayBookings();
            } else if (response.status === 401) {
                throw new Error('Session expired. Please login again.');
            } else {
                throw new Error('Failed to load bookings');
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showError(error.message);
        }
    }

    showLoading() {
        document.getElementById('loadingState').classList.remove('d-none');
        document.getElementById('emptyState').classList.add('d-none');
        document.getElementById('bookingsList').innerHTML = '';
    }

    displayBookings() {
        document.getElementById('loadingState').classList.add('d-none');
        
        if (this.filteredBookings.length === 0) {
            document.getElementById('emptyState').classList.remove('d-none');
            document.getElementById('bookingsList').innerHTML = '';
            return;
        }

        document.getElementById('emptyState').classList.add('d-none');
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageBookings = this.filteredBookings.slice(startIndex, endIndex);

        const bookingsHtml = pageBookings.map(booking => this.createBookingCard(booking)).join('');
        document.getElementById('bookingsList').innerHTML = bookingsHtml;

        this.setupPagination();
    }

    createBookingCard(booking) {
        const statusClass = this.getStatusClass(booking.status);
        const formattedDate = new Date(booking.scheduledDate).toLocaleString();
        const createdDate = new Date(booking.createdAt).toLocaleDateString();

        return `
            <div class="booking-card" data-booking-id="${booking.id}">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="mb-1">${booking.workTitle}</h5>
                            <span class="status-badge status-${booking.status.toLowerCase()}">${this.formatStatus(booking.status)}</span>
                        </div>
                        <p class="text-muted mb-1">
                            <i class="fas fa-user me-2"></i><strong>Worker:</strong> ${booking.workerName}
                        </p>
                        <p class="text-muted mb-1">
                            <i class="fas fa-calendar me-2"></i><strong>Scheduled:</strong> ${formattedDate}
                        </p>
                        <p class="text-muted mb-1">
                            <i class="fas fa-map-marker-alt me-2"></i><strong>Address:</strong> ${this.truncateText(booking.customerAddress, 60)}
                        </p>
                        <p class="text-muted mb-0">
                            <i class="fas fa-clock me-2"></i><strong>Booked on:</strong> ${createdDate}
                        </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <div class="h4 text-success mb-2">₹${booking.totalAmount}</div>
                        <div class="btn-group-vertical d-grid gap-1">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewBookingDetails(${booking.id})">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                            ${this.getActionButtons(booking)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusClass(status) {
        const statusClasses = {
            'PENDING': 'status-pending',
            'CONFIRMED': 'status-confirmed',
            'IN_PROGRESS': 'status-in-progress',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled',
            'REJECTED': 'status-rejected'
        };
        return statusClasses[status] || 'status-pending';
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
    }

    getActionButtons(booking) {
        switch (booking.status) {
            case 'PENDING':
                return `
                    <button class="btn btn-outline-danger btn-sm" onclick="cancelBooking(${booking.id})">
                        <i class="fas fa-times me-1"></i>Cancel
                    </button>
                `;
            case 'CONFIRMED':
                return `
                    <button class="btn btn-outline-info btn-sm" onclick="contactWorker('${booking.workerName}')">
                        <i class="fas fa-phone me-1"></i>Contact Worker
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="cancelBooking(${booking.id})">
                        <i class="fas fa-times me-1"></i>Cancel
                    </button>
                `;
            case 'IN_PROGRESS':
                return `
                    <button class="btn btn-outline-info btn-sm" onclick="contactWorker('${booking.workerName}')">
                        <i class="fas fa-phone me-1"></i>Contact Worker
                    </button>
                `;
            case 'COMPLETED':
                return `
                    <button class="btn btn-outline-warning btn-sm" onclick="rateService(${booking.id})">
                        <i class="fas fa-star me-1"></i>Rate Service
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="bookAgain(${booking.workId}, ${booking.workerId})">
                        <i class="fas fa-redo me-1"></i>Book Again
                    </button>
                `;
            default:
                return '';
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchBookings').value.toLowerCase();

        this.filteredBookings = this.bookings.filter(booking => {
            const matchesStatus = !statusFilter || booking.status === statusFilter;
            const matchesSearch = !searchTerm || 
                booking.workTitle.toLowerCase().includes(searchTerm) ||
                booking.workerName.toLowerCase().includes(searchTerm) ||
                booking.description.toLowerCase().includes(searchTerm);

            return matchesStatus && matchesSearch;
        });

        this.currentPage = 1;
        this.displayBookings();
    }

    setupPagination() {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('pagination').classList.add('d-none');
            return;
        }

        document.getElementById('pagination').classList.remove('d-none');
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${this.currentPage - 1})">Previous</a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHtml += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${this.currentPage + 1})">Next</a>
            </li>
        `;
        
        document.querySelector('#pagination .pagination').innerHTML = paginationHtml;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.displayBookings();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const modal = new bootstrap.Modal(document.getElementById('bookingDetailModal'));
        const content = document.getElementById('bookingDetailContent');
        
        const formattedDate = new Date(booking.scheduledDate).toLocaleString();
        const createdDate = new Date(booking.createdAt).toLocaleString();
        const updatedDate = new Date(booking.updatedAt).toLocaleString();

        content.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <strong>Service:</strong><br>
                    ${booking.workTitle}
                </div>
                <div class="col-md-6">
                    <strong>Worker:</strong><br>
                    ${booking.workerName}
                </div>
                <div class="col-md-6">
                    <strong>Status:</strong><br>
                    <span class="status-badge status-${booking.status.toLowerCase()}">${this.formatStatus(booking.status)}</span>
                </div>
                <div class="col-md-6">
                    <strong>Total Amount:</strong><br>
                    <span class="h5 text-success">₹${booking.totalAmount}</span>
                </div>
                <div class="col-12">
                    <strong>Description:</strong><br>
                    ${booking.description}
                </div>
                <div class="col-12">
                    <strong>Service Address:</strong><br>
                    ${booking.customerAddress}
                </div>
                <div class="col-md-6">
                    <strong>Contact Phone:</strong><br>
                    ${booking.customerPhone || 'Not provided'}
                </div>
                <div class="col-md-6">
                    <strong>Scheduled Date:</strong><br>
                    ${formattedDate}
                </div>
                ${booking.specialInstructions ? `
                <div class="col-12">
                    <strong>Special Instructions:</strong><br>
                    ${booking.specialInstructions}
                </div>
                ` : ''}
                <div class="col-md-6">
                    <strong>Booked on:</strong><br>
                    ${createdDate}
                </div>
                <div class="col-md-6">
                    <strong>Last updated:</strong><br>
                    ${updatedDate}
                </div>
            </div>
        `;

        // Add action buttons to modal
        const actions = document.getElementById('bookingActions');
        actions.innerHTML = this.getActionButtons(booking);

        modal.show();
    }

    async cancelBooking(bookingId) {
        const confirmation = await this.showConfirmation(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.'
        );

        if (!confirmation) return;

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                this.showSuccess('Booking cancelled successfully');
                this.loadBookings(); // Reload bookings
            } else {
                throw new Error('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showError('Failed to cancel booking. Please try again.');
        }
    }

    showConfirmation(title, message) {
        return new Promise((resolve) => {
            const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            document.querySelector('#confirmationModal .modal-title').textContent = title;
            document.getElementById('confirmationMessage').textContent = message;
            
            const confirmBtn = document.getElementById('confirmAction');
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            newConfirmBtn.onclick = () => {
                modal.hide();
                resolve(true);
            };
            
            modal.show();
            
            modal._element.addEventListener('hidden.bs.modal', () => {
                resolve(false);
            }, { once: true });
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showError(message) {
        this.showAlert('danger', message);
    }

    showAlert(type, message) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertElement.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
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
}

// Global functions for onclick handlers
window.refreshBookings = function() {
    window.myBookingsManager = new MyBookingsManager();
};

window.exportBookings = function() {
    // Implementation for exporting bookings
    alert('Export functionality would be implemented here');
};

window.changePage = function(page) {
    if (window.myBookingsManager) {
        window.myBookingsManager.changePage(page);
    }
};

window.viewBookingDetails = function(bookingId) {
    if (window.myBookingsManager) {
        window.myBookingsManager.viewBookingDetails(bookingId);
    }
};

window.cancelBooking = function(bookingId) {
    if (window.myBookingsManager) {
        window.myBookingsManager.cancelBooking(bookingId);
    }
};

window.contactWorker = function(workerName) {
    alert(`Contact functionality for ${workerName} would be implemented here`);
};

window.rateService = function(bookingId) {
    alert(`Rating functionality for booking ${bookingId} would be implemented here`);
};

window.bookAgain = function(workId, workerId) {
    window.location.href = `booking.html?workId=${workId}&workerId=${workerId}`;
};

// Store reference for global access
document.addEventListener('DOMContentLoaded', function() {
    window.myBookingsManager = new MyBookingsManager();
});