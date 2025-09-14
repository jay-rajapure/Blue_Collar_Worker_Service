// Services JavaScript
// Backend API Configuration
const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
    const services = new ServicesManager();
});

class ServicesManager {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadServices();
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchServices');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        // Sort
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.applySorting.bind(this));
        }

        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const locationFilter = document.getElementById('locationFilter');
        const availableOnly = document.getElementById('availableOnly');

        if (categoryFilter) categoryFilter.addEventListener('change', this.applyFilters.bind(this));
        if (priceFilter) priceFilter.addEventListener('change', this.applyFilters.bind(this));
        if (locationFilter) locationFilter.addEventListener('input', this.debounce(this.applyFilters.bind(this), 300));
        if (availableOnly) availableOnly.addEventListener('change', this.applyFilters.bind(this));
    }

    async loadServices() {
        this.showLoading();
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/works`);
            
            if (response.ok) {
                this.services = await response.json();
                this.filteredServices = [...this.services];
                this.displayServices();
            } else {
                throw new Error('Failed to load services');
            }
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('Failed to load services. Please try again.');
        }
    }

    showLoading() {
        document.getElementById('loadingState').classList.remove('d-none');
        document.getElementById('emptyState').classList.add('d-none');
        document.getElementById('servicesList').innerHTML = '';
    }

    displayServices() {
        document.getElementById('loadingState').classList.add('d-none');
        
        if (this.filteredServices.length === 0) {
            document.getElementById('emptyState').classList.remove('d-none');
            document.getElementById('servicesList').innerHTML = '';
            return;
        }

        document.getElementById('emptyState').classList.add('d-none');
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageServices = this.filteredServices.slice(startIndex, endIndex);

        const servicesHtml = pageServices.map(service => this.createServiceCard(service)).join('');
        document.getElementById('servicesList').innerHTML = servicesHtml;

        this.setupPagination();
    }

    createServiceCard(service) {
        // Mock worker data since we need to fetch worker details separately
        const workerInitials = service.userId ? `W${service.userId}` : 'WR';
        const isAvailable = service.isAvailable !== false; // Default to true if not specified
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="service-item ${!isAvailable ? 'opacity-50' : ''}">
                    <div class="d-flex align-items-start mb-3">
                        <div class="worker-avatar me-3">
                            ${workerInitials}
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${service.title}</h5>
                            <p class="text-muted small mb-2">${service.category || 'General Service'}</p>
                            <div class="rating-stars mb-2">
                                ${'★'.repeat(4)}${'☆'.repeat(1)}
                                <span class="text-muted small">(4.0)</span>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="price-badge">₹${service.charges}</div>
                            ${!isAvailable ? '<div class="text-danger small mt-1">Unavailable</div>' : ''}
                        </div>
                    </div>
                    
                    <p class="text-muted mb-3">${this.truncateText(service.description, 100)}</p>
                    
                    <div class="row g-2 text-small mb-3">
                        <div class="col-6">
                            <i class="fas fa-clock text-primary me-1"></i>
                            ${service.estimatedTimeHours} hours
                        </div>
                        <div class="col-6">
                            <i class="fas fa-map-marker-alt text-primary me-1"></i>
                            ${service.latitude && service.longitude ? 'Location set' : 'On-site'}
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" 
                                onclick="bookService(${service.id}, ${service.userId})"
                                ${!isAvailable ? 'disabled' : ''}>
                            <i class="fas fa-calendar-check me-2"></i>
                            ${isAvailable ? 'Book Now' : 'Unavailable'}
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="viewServiceDetails(${service.id})">
                            <i class="fas fa-info-circle me-1"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    handleSearch() {
        this.applyFilters();
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priceFilter = document.getElementById('priceFilter').value;
        const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
        const availableOnly = document.getElementById('availableOnly').checked;
        const searchTerm = document.getElementById('searchServices').value.toLowerCase();

        this.filteredServices = this.services.filter(service => {
            // Category filter
            const matchesCategory = !categoryFilter || service.category === categoryFilter;
            
            // Price filter
            let matchesPrice = true;
            if (priceFilter) {
                const price = service.charges;
                switch (priceFilter) {
                    case '0-500':
                        matchesPrice = price <= 500;
                        break;
                    case '500-1000':
                        matchesPrice = price > 500 && price <= 1000;
                        break;
                    case '1000-2000':
                        matchesPrice = price > 1000 && price <= 2000;
                        break;
                    case '2000-5000':
                        matchesPrice = price > 2000 && price <= 5000;
                        break;
                    case '5000+':
                        matchesPrice = price > 5000;
                        break;
                }
            }
            
            // Location filter (simplified - would need geocoding in real implementation)
            const matchesLocation = !locationFilter || 
                service.title.toLowerCase().includes(locationFilter) ||
                (service.category && service.category.toLowerCase().includes(locationFilter));
            
            // Availability filter
            const matchesAvailability = !availableOnly || service.isAvailable !== false;
            
            // Search filter
            const matchesSearch = !searchTerm || 
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                (service.category && service.category.toLowerCase().includes(searchTerm));

            return matchesCategory && matchesPrice && matchesLocation && matchesAvailability && matchesSearch;
        });

        this.currentPage = 1;
        this.applySorting();
    }

    applySorting() {
        const sortBy = document.getElementById('sortBy').value;
        
        switch (sortBy) {
            case 'newest':
                this.filteredServices.sort((a, b) => b.id - a.id);
                break;
            case 'price-low':
                this.filteredServices.sort((a, b) => a.charges - b.charges);
                break;
            case 'price-high':
                this.filteredServices.sort((a, b) => b.charges - a.charges);
                break;
            case 'rating':
                // Mock rating sort since we don't have real ratings
                this.filteredServices.sort((a, b) => b.id - a.id);
                break;
        }
        
        this.displayServices();
    }

    setupPagination() {
        const totalPages = Math.ceil(this.filteredServices.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('pagination').classList.add('d-none');
            return;
        }

        document.getElementById('pagination').classList.remove('d-none');
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changeServicesPage(${this.currentPage - 1})">Previous</a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="changeServicesPage(1)">1</a></li>`;
            if (startPage > 2) {
                paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeServicesPage(${i})">${i}</a>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="changeServicesPage(${totalPages})">${totalPages}</a></li>`;
        }
        
        // Next button
        paginationHtml += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changeServicesPage(${this.currentPage + 1})">Next</a>
            </li>
        `;
        
        document.querySelector('#pagination .pagination').innerHTML = paginationHtml;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredServices.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.displayServices();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async viewServiceDetails(serviceId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/works/${serviceId}`);
            if (response.ok) {
                const service = await response.json();
                this.showServiceDetailsModal(service);
            } else {
                throw new Error('Service not found');
            }
        } catch (error) {
            console.error('Error loading service details:', error);
            this.showError('Failed to load service details.');
        }
    }

    showServiceDetailsModal(service) {
        const modalHtml = `
            <div class="modal fade" id="serviceDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-tools me-2"></i>${service.title}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <strong>Category:</strong><br>
                                    ${service.category || 'General Service'}
                                </div>
                                <div class="col-md-6">
                                    <strong>Price:</strong><br>
                                    <span class="h5 text-success">₹${service.charges}</span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Duration:</strong><br>
                                    ${service.estimatedTimeHours} hours
                                </div>
                                <div class="col-md-6">
                                    <strong>Availability:</strong><br>
                                    <span class="badge ${service.isAvailable !== false ? 'bg-success' : 'bg-danger'}">
                                        ${service.isAvailable !== false ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                <div class="col-12">
                                    <strong>Description:</strong><br>
                                    ${service.description}
                                </div>
                                ${service.latitude && service.longitude ? `
                                <div class="col-12">
                                    <strong>Service Location:</strong><br>
                                    Lat: ${service.latitude.toFixed(6)}, Lon: ${service.longitude.toFixed(6)}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" 
                                    onclick="bookService(${service.id}, ${service.userId})"
                                    ${service.isAvailable === false ? 'disabled' : ''}>
                                <i class="fas fa-calendar-check me-2"></i>Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('serviceDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('serviceDetailsModal'));
        modal.show();

        // Clean up after modal is hidden
        document.getElementById('serviceDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
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

    showError(message) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertElement.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
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
window.searchServices = function() {
    if (window.servicesManager) {
        window.servicesManager.handleSearch();
    }
};

window.applyFilters = function() {
    if (window.servicesManager) {
        window.servicesManager.applyFilters();
    }
};

window.clearFilters = function() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('availableOnly').checked = true;
    document.getElementById('searchServices').value = '';
    
    if (window.servicesManager) {
        window.servicesManager.applyFilters();
    }
};

window.changeServicesPage = function(page) {
    if (window.servicesManager) {
        window.servicesManager.changePage(page);
    }
};

window.viewServiceDetails = function(serviceId) {
    if (window.servicesManager) {
        window.servicesManager.viewServiceDetails(serviceId);
    }
};

window.bookService = function(workId, workerId) {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login to book a service');
        window.location.href = 'customer-login.html';
        return;
    }
    
    // Redirect to booking page with service and worker IDs
    window.location.href = `booking.html?workId=${workId}&workerId=${workerId}`;
};

// Store reference for global access
document.addEventListener('DOMContentLoaded', function() {
    window.servicesManager = new ServicesManager();
});