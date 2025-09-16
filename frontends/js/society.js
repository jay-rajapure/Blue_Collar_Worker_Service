// Society Page JavaScript
// Community work requests and interactions
// Uses global API_BASE_URL from main.js

document.addEventListener('DOMContentLoaded', function() {
    const society = new SocietyManager();
});

class SocietyManager {
    constructor() {
        this.workRequests = [];
        this.filteredRequests = [];
        this.currentFilter = 'all';
        this.userRole = localStorage.getItem('userRole');
        this.userLocation = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserInfo();
        this.getUserLocation();
        this.setupEventListeners();
        this.loadWorkRequests();
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            window.location.href = 'customer-login.html';
            return;
        }
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
                        this.userLocation = { latitude: 28.6139, longitude: 77.2090 }; // Default Delhi
                    }
                );
            } else {
                this.userLocation = { latitude: 28.6139, longitude: 77.2090 };
            }
        } catch (error) {
            console.error('Error getting location:', error);
            this.userLocation = { latitude: 28.6139, longitude: 77.2090 };
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.applyFilters.bind(this), 300));
        }
    }

    async loadWorkRequests() {
        try {
            this.showLoading(true);
            
            const authToken = localStorage.getItem('authToken');
            let endpoint = '/api/work-requests/worker/available'; // For workers to see available requests
            
            // If user is customer, show different endpoints based on filter
            if (this.userRole === 'CUSTOMER') {
                if (this.currentFilter === 'my-requests') {
                    endpoint = '/api/work-requests/customer/my-requests';
                } else {
                    // For customers viewing all requests (community view)
                    endpoint = '/api/work-requests/worker/available';
                }
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.workRequests = await response.json();
                console.log('Work requests loaded:', this.workRequests.length);
            } else if (response.status === 401) {
                window.location.href = 'customer-login.html';
                return;
            } else {
                console.warn('Failed to load work requests, using mock data');
                this.workRequests = this.getMockWorkRequests();
            }
            
            this.filteredRequests = [...this.workRequests];
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading work requests:', error);
            this.workRequests = this.getMockWorkRequests();
            this.filteredRequests = [...this.workRequests];
            this.displayWorkRequests();
        } finally {
            this.showLoading(false);
        }
    }

    getMockWorkRequests() {
        return [
            {
                id: 1,
                title: "Fix Kitchen Sink Leak",
                description: "Kitchen sink has been leaking for 2 days. Need immediate repair.",
                category: "plumbing",
                location: "Delhi",
                address: "Sector 15, Noida",
                budgetMin: 500,
                budgetMax: 1500,
                isUrgent: true,
                status: "OPEN",
                customerName: "Priya Sharma",
                customerEmail: "priya@example.com",
                phoneNumber: "+91 9876543210",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Electrical Wiring for New Room",
                description: "Need complete electrical wiring for a newly constructed room including switches and outlets.",
                category: "electrical",
                location: "Gurgaon",
                address: "DLF Phase 2, Gurgaon",
                budgetMin: 3000,
                budgetMax: 8000,
                isUrgent: false,
                status: "OPEN",
                customerName: "Rajesh Kumar",
                customerEmail: "rajesh@example.com",
                phoneNumber: "+91 9123456789",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                title: "House Deep Cleaning",
                description: "Need thorough cleaning of 2BHK apartment before moving in. Include bathroom and kitchen deep cleaning.",
                category: "cleaning",
                location: "Mumbai",
                address: "Bandra West, Mumbai",
                budgetMin: 2000,
                budgetMax: 4000,
                isUrgent: false,
                status: "OPEN",
                customerName: "Anjali Mehta",
                customerEmail: "anjali@example.com",
                phoneNumber: "+91 9988776655",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredRequests = this.workRequests.filter(request => {
            const matchesCategory = !categoryFilter || request.category === categoryFilter;
            const matchesSearch = !searchTerm || 
                request.title.toLowerCase().includes(searchTerm) ||
                request.description.toLowerCase().includes(searchTerm) ||
                request.customerName.toLowerCase().includes(searchTerm) ||
                request.location.toLowerCase().includes(searchTerm);
            
            const matchesFilter = this.applySpecialFilter(request);
            
            return matchesCategory && matchesSearch && matchesFilter;
        });
        
        this.displayWorkRequests();
    }

    applySpecialFilter(request) {
        const currentUserId = localStorage.getItem('userId');
        
        switch (this.currentFilter) {
            case 'my-requests':
                // Only show user's own requests if they're a customer
                return this.userRole === 'CUSTOMER' && request.customerId === currentUserId;
            case 'urgent':
                return request.isUrgent === true;
            case 'nearby':
                // If we have user location, filter by distance
                if (this.userLocation && request.latitude && request.longitude) {
                    const distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        request.latitude,
                        request.longitude
                    );
                    return distance <= 10; // Within 10km
                }
                return true; // Show all if no location data
            case 'all':
            default:
                return true;
        }
    }

    displayWorkRequests() {
        const requestsList = document.getElementById('workRequestsList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredRequests.length === 0) {
            requestsList.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        
        const requestsHtml = this.filteredRequests.map(request => this.createWorkRequestCard(request)).join('');
        requestsList.innerHTML = requestsHtml;
    }

    createWorkRequestCard(request) {
        const customerInitials = this.getInitials(request.customerName);
        const timeAgo = this.getTimeAgo(new Date(request.createdAt));
        const budgetRange = this.formatBudgetRange(request.budgetMin, request.budgetMax);
        const urgentBadge = request.isUrgent ? '<span class="badge urgent-badge ms-2">URGENT</span>' : '';
        
        return `
            <div class="society-card">
                <div class="work-request-card">
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="worker-avatar me-3">
                                ${customerInitials}
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between">
                                    <h5 class="card-title mb-1">${request.title}${urgentBadge}</h5>
                                    <span class="category-badge badge bg-primary">${this.formatCategory(request.category)}</span>
                                </div>
                                <p class="text-muted small mb-1">
                                    <i class="fas fa-user me-1"></i>${request.customerName} • 
                                    <i class="fas fa-clock me-1"></i>${timeAgo}
                                </p>
                                <p class="text-muted small">
                                    <i class="fas fa-map-marker-alt me-1"></i>${request.location} • ${request.address}
                                </p>
                            </div>
                        </div>
                        
                        <p class="card-text mb-3">${request.description}</p>
                        
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <div class="budget-info">
                                    <small class="text-muted">Budget Range</small>
                                    <div class="fw-bold text-success">${budgetRange}</div>
                                </div>
                            </div>
                            <div class="col-md-6 text-end">
                                ${this.getActionButtons(request)}
                            </div>
                        </div>
                        
                        <div class="mt-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span class="badge bg-${this.getStatusColor(request.status)}">${request.status}</span>
                                ${request.preferredDate ? `<small class="text-muted ms-2">Preferred: ${new Date(request.preferredDate).toLocaleDateString()}</small>` : ''}
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary" onclick="contactCustomer('${request.phoneNumber}', '${request.customerName}')">
                                    <i class="fas fa-phone me-1"></i>Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getActionButtons(request) {
        if (this.userRole === 'WORKER' && request.status === 'OPEN') {
            return `
                <button class="btn btn-primary" onclick="applyForWork(${request.id})">
                    <i class="fas fa-hand-paper me-1"></i>Apply for Work
                </button>
            `;
        } else if (this.userRole === 'CUSTOMER') {
            const currentUserId = localStorage.getItem('userId');
            if (request.customerId === currentUserId) {
                return `
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="editWorkRequest(${request.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="cancelWorkRequest(${request.id})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
        }
        return '<small class="text-muted">View only</small>';
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatBudgetRange(min, max) {
        if (min && max) {
            return `₹${min} - ₹${max}`;
        } else if (min) {
            return `₹${min}+`;
        } else if (max) {
            return `Up to ₹${max}`;
        }
        return 'Budget negotiable';
    }

    getStatusColor(status) {
        const colors = {
            'OPEN': 'success',
            'IN_PROGRESS': 'warning',
            'COMPLETED': 'primary',
            'CANCELLED': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getInitials(name) {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length >= 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
        } else {
            return 'Just now';
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        if (show) {
            loadingState.classList.remove('d-none');
        } else {
            loadingState.classList.add('d-none');
        }
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
}

// Global functions for UI interactions
window.filterRequests = function(filter) {
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Update filter and reload
    if (window.societyManager) {
        window.societyManager.currentFilter = filter;
        if (filter === 'my-requests') {
            window.societyManager.loadWorkRequests(); // Reload with different endpoint
        } else {
            window.societyManager.applyFilters();
        }
    }
};

window.applyFilters = function() {
    if (window.societyManager) {
        window.societyManager.applyFilters();
    }
};

window.applyForWork = async function(requestId) {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'WORKER') {
        alert('Only workers can apply for work requests');
        return;
    }
    
    if (confirm('Are you sure you want to apply for this work request?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/work-requests/${requestId}/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                alert('Successfully applied for work request! The customer will be notified.');
                if (window.societyManager) {
                    window.societyManager.loadWorkRequests();
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to apply for work request');
            }
        } catch (error) {
            console.error('Error applying for work:', error);
            alert('Failed to apply for work request. Please try again.');
        }
    }
};

window.contactCustomer = function(phoneNumber, customerName) {
    if (phoneNumber) {
        const message = `Hello ${customerName}, I saw your work request on WorkBuddy and would like to discuss the details.`;
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        alert('Contact information not available');
    }
};

window.editWorkRequest = function(requestId) {
    // Implement edit functionality
    alert(`Edit work request ${requestId} - This feature will be implemented soon`);
};

window.cancelWorkRequest = async function(requestId) {
    if (confirm('Are you sure you want to cancel this work request?')) {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/work-requests/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            });
            
            if (response.ok) {
                alert('Work request cancelled successfully');
                if (window.societyManager) {
                    window.societyManager.loadWorkRequests();
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to cancel work request');
            }
        } catch (error) {
            console.error('Error cancelling work request:', error);
            alert('Failed to cancel work request. Please try again.');
        }
    }
};

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

// Initialize society manager globally
document.addEventListener('DOMContentLoaded', function() {
    window.societyManager = new SocietyManager();
});