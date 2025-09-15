// Services management functionality
// Uses global API_BASE_URL from main.js

class ServicesManager {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.userRole = localStorage.getItem('userRole');
        this.viewMode = this.getUserViewMode();
        this.init();
    }

    getUserViewMode() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        
        if (viewParam) {
            return viewParam;
        }
        
        // Fall back to user role
        const roleBasedView = this.userRole === 'WORKER' ? 'worker' : 'customer';
        return roleBasedView;
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }
        
        this.updatePageForRole();
        this.setupEventListeners();
        this.loadServices();
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    updatePageForRole() {
        // Update page title and description based on user role
        const pageTitle = document.querySelector('h2.fw-bold.text-primary');
        const pageDescription = document.querySelector('h2.fw-bold.text-primary + p.text-muted');
        const headerContainer = document.querySelector('.d-flex.justify-content-between.align-items-center.mb-4');
        
        if (this.viewMode === 'worker') {
            if (pageTitle) {
                pageTitle.innerHTML = '<i class="fas fa-briefcase me-2"></i>Work Opportunities';
            }
            if (pageDescription) {
                pageDescription.textContent = 'Browse available jobs and manage your services';
            }
            
            // Add worker-specific "Add Service" button
            this.addWorkerControls(headerContainer);
        } else {
            if (pageTitle) {
                pageTitle.innerHTML = '<i class="fas fa-search me-2"></i>Find Services';
            }
            if (pageDescription) {
                pageDescription.textContent = 'Browse and book services from skilled workers';
            }
        }
    }

    addWorkerControls(headerContainer) {
        // Add worker-specific controls if they don't exist
        if (headerContainer && !document.getElementById('workerControls')) {
            const rightDiv = headerContainer.querySelector('div:last-child');
            if (rightDiv) {
                const controlsDiv = document.createElement('div');
                controlsDiv.id = 'workerControls';
                controlsDiv.className = 'd-flex gap-2';
                
                const addServiceBtn = document.createElement('button');
                addServiceBtn.id = 'addServiceBtn';
                addServiceBtn.className = 'btn btn-success';
                addServiceBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Service';
                addServiceBtn.onclick = () => {
                    window.location.href = 'add-service.html';
                };
                
                controlsDiv.appendChild(addServiceBtn);
                rightDiv.appendChild(controlsDiv);
            }
        }
        
        // Update search placeholder for worker view
        const searchInput = document.getElementById('searchServices');
        if (searchInput) {
            searchInput.placeholder = 'Search your services...';
        }
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
            // Get authentication token
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                // If no token, redirect to appropriate login page
                this.redirectToLogin();
                return;
            }

            // Determine which endpoint to call based on user role
            let endpoint;
            if (this.viewMode === 'worker') {
                // Workers only see their own services
                endpoint = '/api/works/worker';
            } else {
                // Customers see available services they can book
                endpoint = '/api/works/customer';
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.services = await response.json();
                this.filteredServices = [...this.services];
                this.displayServices();
            } else if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                this.redirectToLogin();
            } else if (response.status === 403) {
                // Role-based access denied
                this.showError('Access denied. Please check your user role.');
            } else {
                throw new Error('Failed to load services');
            }
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('Failed to load services. Please try again.');
        }
    }

    redirectToLogin() {
        // Clear any existing auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        // Show a message to user
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-lock fa-3x text-warning mb-3"></i>
                    <h4 class="text-muted">Authentication Required</h4>
                    <p class="text-muted">Please login to view services.</p>
                    <p class="small text-muted">Redirecting to login page...</p>
                </div>
            `;
        }
        
        // Redirect after a short delay to show the message
        setTimeout(() => {
            // Redirect to appropriate login page based on view mode
            if (this.viewMode === 'worker') {
                window.location.href = 'worker-login.html';
            } else {
                window.location.href = 'customer-login.html';
            }
        }, 2000);
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
        // Enhanced worker display with more details
        const workerName = service.workerName || `Worker ${service.userId || 'Unknown'}`;
        const workerInitials = this.getWorkerInitials(workerName);
        const isAvailable = service.isAvailable !== false; // Default to true if not specified
        const createdDate = service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Recently';
        
        // Calculate rating display (mock for now)
        const rating = this.getMockRating();
        const ratingStars = this.generateStars(rating.score);
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="service-item h-100 ${!isAvailable ? 'opacity-75' : ''}">
                    <!-- Service Header -->
                    <div class="service-header mb-3">
                        <div class="d-flex align-items-start">
                            <div class="worker-avatar me-3">
                                ${workerInitials}
                            </div>
                            <div class="flex-grow-1">
                                <h5 class="service-title mb-1">${service.title}</h5>
                                <p class="worker-name text-primary small mb-1">
                                    <i class="fas fa-user me-1"></i>${workerName}
                                </p>
                                <div class="service-meta d-flex align-items-center justify-content-between">
                                    <span class="badge bg-light text-dark">${service.category || 'General Service'}</span>
                                    <small class="text-muted">Listed ${createdDate}</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Price Badge -->
                        <div class="price-section text-center mt-2">
                            <div class="price-main">
                                <span class="price-currency">₹</span>
                                <span class="price-amount">${service.charges}</span>
                                <span class="price-duration">/${service.estimatedTimeHours}h</span>
                            </div>
                            ${!isAvailable ? '<div class="availability-badge badge bg-danger">Currently Unavailable</div>' : '<div class="availability-badge badge bg-success">Available Now</div>'}
                        </div>
                    </div>
                    
                    <!-- Service Description -->
                    <div class="service-description mb-3">
                        <p class="text-muted small mb-2">${this.truncateText(service.description, 120)}</p>
                    </div>
                    
                    <!-- Service Details Grid -->
                    <div class="service-details mb-3">
                        <div class="row g-2 small">
                            <div class="col-6">
                                <div class="detail-item">
                                    <i class="fas fa-clock text-primary me-1"></i>
                                    <span>${service.estimatedTimeHours} hours</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="detail-item">
                                    <i class="fas fa-map-marker-alt text-primary me-1"></i>
                                    <span>${service.latitude && service.longitude ? 'Fixed Location' : 'On-site Service'}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="detail-item">
                                    <i class="fas fa-calculator text-primary me-1"></i>
                                    <span>₹${Math.round(service.charges / service.estimatedTimeHours)}/hr</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="detail-item">
                                    <i class="fas fa-shield-alt text-primary me-1"></i>
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Rating Section -->
                    <div class="rating-section mb-3">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="rating-display">
                                <div class="rating-stars">${ratingStars}</div>
                                <small class="text-muted">${rating.score} (${rating.count} reviews)</small>
                            </div>
                            <div class="service-stats">
                                <small class="text-muted">
                                    <i class="fas fa-thumbs-up me-1"></i>${this.getMockCompletionRate()}% completion
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="service-actions mt-auto">
                        ${this.getActionButtons(service, isAvailable)}
                    </div>
                </div>
            </div>
        `;
    }

    getActionButtons(service, isAvailable) {
        if (this.viewMode === 'worker') {
            // Worker view - show management options
            const isMyService = service.userId === this.getCurrentUserId();
            
            if (isMyService) {
                return `
                    <div class="d-grid gap-2">
                        <button class="btn btn-warning" onclick="editService(${service.id})">
                            <i class="fas fa-edit me-2"></i>Edit Service
                        </button>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-info flex-fill" onclick="viewServiceDetails(${service.id})">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                            <button class="btn btn-outline-danger flex-fill" onclick="toggleServiceAvailability(${service.id}, ${!isAvailable})">
                                <i class="fas fa-${isAvailable ? 'pause' : 'play'} me-1"></i>${isAvailable ? 'Pause' : 'Activate'}
                            </button>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary" onclick="contactWorker(${service.userId})">
                            <i class="fas fa-handshake me-2"></i>Collaborate
                        </button>
                        <button class="btn btn-outline-secondary" onclick="viewServiceDetails(${service.id})">
                            <i class="fas fa-info-circle me-2"></i>View Details
                        </button>
                    </div>
                `;
            }
        } else {
            // Customer view - show booking options with enhanced information
            return `
                <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-lg" 
                            onclick="bookService(${service.id}, ${service.userId})"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas fa-calendar-check me-2"></i>
                        ${isAvailable ? 'Book Now - ₹' + service.charges : 'Currently Unavailable'}
                    </button>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary flex-fill" onclick="viewServiceDetails(${service.id})">
                            <i class="fas fa-info-circle me-1"></i>Details
                        </button>
                        <button class="btn btn-outline-info flex-fill" onclick="contactWorker(${service.userId})">
                            <i class="fas fa-message me-1"></i>Message
                        </button>
                    </div>
                </div>
            `;
        }
    }

    getCurrentUserId() {
        // This would normally come from the JWT token or user profile
        // For now, return a mock value or decode from token
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                // In a real app, decode the JWT token to get user ID
                // For now, return a mock ID
                return 1; // This should be replaced with actual user ID from token
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
        return null;
    }

    getWorkerInitials(workerName) {
        if (!workerName) return 'WR';
        const words = workerName.split(' ');
        if (words.length >= 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return workerName.substring(0, 2).toUpperCase();
    }

    getMockRating() {
        // Generate consistent mock ratings based on service ID
        const ratings = [
            { score: 4.8, count: 24 },
            { score: 4.5, count: 18 },
            { score: 4.7, count: 31 },
            { score: 4.3, count: 12 },
            { score: 4.9, count: 47 }
        ];
        return ratings[Math.floor(Math.random() * ratings.length)];
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '☆'; // Could use half-star icon
        stars += '☆'.repeat(emptyStars);
        
        return `<span class="text-warning">${stars}</span>`;
    }

    getMockCompletionRate() {
        // Generate mock completion rates
        const rates = [94, 96, 98, 92, 99, 91, 97];
        return rates[Math.floor(Math.random() * rates.length)];
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
    const userRole = localStorage.getItem('userRole');
    
    if (!authToken) {
        alert('Please login to book a service');
        window.location.href = 'customer-login.html';
        return;
    }
    
    // Check if user is a customer (only customers can book services)
    if (userRole !== 'CUSTOMER') {
        alert('Only customers can book services. Workers should provide services, not book them.');
        return;
    }
    
    // Show booking initiation feedback
    const bookBtn = event.target;
    const originalText = bookBtn.innerHTML;
    bookBtn.disabled = true;
    bookBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Initiating...';
    
    // Small delay to show the loading state
    setTimeout(() => {
        // Restore button
        bookBtn.disabled = false;
        bookBtn.innerHTML = originalText;
        
        // Redirect to booking page with service and worker IDs
        window.location.href = `booking.html?workId=${workId}`;
    }, 800);
};

// Worker-specific functions
window.editService = function(serviceId) {
    // Redirect to edit service page (to be implemented)
    alert(`Edit service functionality for service ${serviceId} would redirect to edit page`);
    // window.location.href = `edit-service.html?id=${serviceId}`;
};

window.toggleServiceAvailability = function(serviceId, newAvailability) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login to manage services');
        return;
    }
    
    // Call API to toggle availability
    fetch(`${API_BASE_URL}/api/works/${serviceId}/availability?isAvailable=${newAvailability}`, {
        method: 'PATCH',
        headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Reload services to reflect changes
            if (window.servicesManager) {
                window.servicesManager.loadServices();
            }
            alert(`Service ${newAvailability ? 'activated' : 'paused'} successfully!`);
        } else {
            throw new Error('Failed to update service availability');
        }
    })
    .catch(error => {
        console.error('Error updating service availability:', error);
        alert('Failed to update service availability. Please try again.');
    });
};

window.contactWorker = function(workerId) {
    alert(`Contact functionality for worker ${workerId} would open messaging system`);
    // This would integrate with a messaging system or show contact information
};

// Store reference for global access
document.addEventListener('DOMContentLoaded', function() {
    window.servicesManager = new ServicesManager();
});