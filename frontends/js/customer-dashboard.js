// Customer Dashboard JavaScript - Modern Uber/Ola-like Experience
// Uses global API_BASE_URL from main.js

class CustomerDashboard {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.currentCategory = '';
        this.currentLocation = null;
        this.userInfo = null;
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuthentication()) {
            return;
        }

        try {
            // Initialize location
            await this.initLocation();
            
            // Load user profile
            await this.loadUserProfile();
            
            // Load services
            await this.loadServices();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            console.error('Error initializing customer dashboard:', error);
            this.showError('Failed to load dashboard. Please refresh the page.');
        }
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        this.showError('Session expired. Please login again.');
        setTimeout(() => {
            window.location.href = 'customer-login.html';
        }, 2000);
    }

    async initLocation() {
        try {
            // Try to get user's current location
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });
                
                this.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Get address from coordinates (mock for now)
                this.updateLocationDisplay('Current Location', 'Near you');
                
            } else {
                // Fallback to default location
                this.currentLocation = { latitude: 28.6139, longitude: 77.2090 }; // Delhi
                this.updateLocationDisplay('Delhi', 'Default location');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            // Use default location
            this.currentLocation = { latitude: 28.6139, longitude: 77.2090 };
            this.updateLocationDisplay('Delhi', 'Default location');
        }
    }

    updateLocationDisplay(city, address) {
        const locationElement = document.getElementById('userLocation');
        const addressElement = document.getElementById('userAddress');
        
        if (locationElement) locationElement.textContent = city;
        if (addressElement) addressElement.textContent = address;
    }

    async loadUserProfile() {
        try {
            // For now, use stored user data
            this.userInfo = {
                name: localStorage.getItem('userName') || 'Customer',
                email: localStorage.getItem('userEmail') || 'customer@example.com',
                id: localStorage.getItem('userId') || 1
            };
            
            console.log('User profile loaded:', this.userInfo);
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.userInfo = { name: 'Customer', email: 'customer@example.com', id: 1 };
        }
    }

    async loadServices() {
        try {
            this.showLoading(true);
            
            const authToken = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/api/works/customer`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.services = await response.json();
                console.log('Services loaded:', this.services.length);
            } else if (response.status === 401) {
                this.redirectToLogin();
                return;
            } else {
                console.warn('Failed to load services, using mock data');
                this.services = this.getMockServices();
            }
            
            this.filteredServices = [...this.services];
            this.displayServices();
            
        } catch (error) {
            console.error('Error loading services:', error);
            // Use mock data as fallback
            this.services = this.getMockServices();
            this.filteredServices = [...this.services];
            this.displayServices();
        } finally {
            this.showLoading(false);
        }
    }

    getMockServices() {
        // Generate services with realistic locations based on user's location
        const baseServices = [
            {
                id: 1,
                title: 'Professional Plumbing Service',
                description: 'Complete plumbing solutions including pipe repairs, leak fixing, and new installations.',
                charges: 800,
                estimatedTimeHours: 2,
                category: 'plumbing',
                available: true,
                workerId: 1,
                workerName: 'Rajesh Kumar',
                rating: 4.8,
                totalReviews: 24,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Electrical Wiring & Repairs',
                description: 'Safe and reliable electrical work including wiring, outlet installation, and troubleshooting.',
                charges: 1200,
                estimatedTimeHours: 3,
                category: 'electrical',
                available: true,
                workerId: 2,
                workerName: 'Amit Singh',
                rating: 4.9,
                totalReviews: 31,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'House Painting Service',
                description: 'Interior and exterior painting with premium quality paints and professional finish.',
                charges: 2500,
                estimatedTimeHours: 8,
                category: 'painting',
                available: true,
                workerId: 3,
                workerName: 'Suresh Yadav',
                rating: 4.7,
                totalReviews: 18,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: 'Carpentry & Furniture Assembly',
                description: 'Custom carpentry work, furniture assembly, and wood repair services.',
                charges: 600,
                estimatedTimeHours: 1.5,
                category: 'carpentry',
                available: true,
                workerId: 4,
                workerName: 'Mahesh Gupta',
                rating: 4.6,
                totalReviews: 15,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'Deep Cleaning Service',
                description: 'Complete home cleaning including bathroom, kitchen, and floor deep cleaning.',
                charges: 1000,
                estimatedTimeHours: 4,
                category: 'cleaning',
                available: true,
                workerId: 5,
                workerName: 'Priya Sharma',
                rating: 4.9,
                totalReviews: 42,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: 'AC Installation & Repair',
                description: 'Professional air conditioning installation, maintenance, and repair services.',
                charges: 1500,
                estimatedTimeHours: 3,
                category: 'appliance-repair',
                available: true,
                workerId: 6,
                workerName: 'Vikram Joshi',
                rating: 4.8,
                totalReviews: 28,
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                title: 'Garden Landscaping',
                description: 'Complete garden design, landscaping, and maintenance services.',
                charges: 3000,
                estimatedTimeHours: 6,
                category: 'gardening',
                available: true,
                workerId: 7,
                workerName: 'Ravi Patel',
                rating: 4.5,
                totalReviews: 12,
                createdAt: new Date().toISOString()
            }
        ];

        // Add location data and calculate distances
        return baseServices.map(service => {
            // Generate random nearby locations
            const locationOffset = this.generateNearbyLocation();
            service.workerLatitude = this.currentLocation.latitude + locationOffset.lat;
            service.workerLongitude = this.currentLocation.longitude + locationOffset.lng;
            service.distance = this.calculateDistance(
                this.currentLocation.latitude,
                this.currentLocation.longitude,
                service.workerLatitude,
                service.workerLongitude
            );
            return service;
        }).sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        // Category filters
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectCategory(item);
            });
        });
    }

    selectCategory(selectedItem) {
        // Update active category
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        selectedItem.classList.add('active');
        
        // Get category and filter
        this.currentCategory = selectedItem.dataset.category || '';
        this.applyFilters();
    }

    handleSearch() {
        this.applyFilters();
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredServices = this.services.filter(service => {
            const matchesCategory = !this.currentCategory || service.category === this.currentCategory;
            const matchesSearch = !searchTerm || 
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.workerName.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });
        
        this.displayServices();
    }

    displayServices() {
        const servicesList = document.getElementById('servicesList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredServices.length === 0) {
            servicesList.classList.add('d-none');
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        servicesList.classList.remove('d-none');
        
        const servicesHtml = this.filteredServices.map(service => this.createServiceCard(service)).join('');
        servicesList.innerHTML = servicesHtml;
    }

    createServiceCard(service) {
        const workerInitials = this.getWorkerInitials(service.workerName);
        const ratingStars = this.generateStars(service.rating);
        
        return `
            <div class=\"service-card\" data-service-id=\"${service.id}\">
                <div class=\"service-header\">
                    <div class=\"worker-avatar\">${workerInitials}</div>
                    <div class=\"service-info\">
                        <div class=\"service-title\">${service.title}</div>
                        <div class=\"worker-name\">by ${service.workerName}</div>
                        <div class=\"service-rating\">
                            <div class=\"rating-stars\">${ratingStars}</div>
                            <span>${service.rating} (${service.totalReviews} reviews)</span>
                            <span class=\"service-distance\">${service.distance ? `${service.distance} km` : '1.2 km'}</span>
                        </div>
                    </div>
                </div>
                
                <div class=\"service-meta\">
                    <div>
                        <div class=\"service-price\">₹${service.charges}</div>
                        <div class=\"service-duration\">${service.estimatedTimeHours}h estimated</div>
                    </div>
                </div>
                
                <div class=\"service-description\">
                    ${this.truncateText(service.description, 120)}
                </div>
                
                <div class=\"service-actions\">
                    <button class=\"btn-book\" onclick=\"bookService(${service.id}, ${service.workerId})\">
                        <i class=\"fas fa-calendar-check me-2\"></i>Book Now
                    </button>
                    <button class=\"btn-contact\" onclick=\"contactWorker(${service.workerId})\" title=\"Contact Worker\">
                        <i class=\"fas fa-message\"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getWorkerInitials(workerName) {
        if (!workerName) return 'WR';
        const words = workerName.split(' ');
        if (words.length >= 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return workerName.substring(0, 2).toUpperCase();
    }

    generateNearbyLocation() {
        // Generate random location within 5km radius
        const radiusInKm = 5;
        const radiusInDegrees = radiusInKm / 111; // Rough conversion
        
        const lat = (Math.random() - 0.5) * 2 * radiusInDegrees;
        const lng = (Math.random() - 0.5) * 2 * radiusInDegrees;
        
        return { lat, lng };
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return Math.round(distance * 10) / 10; // Round to 1 decimal place
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '☆';
        stars += '☆'.repeat(emptyStars);
        
        return stars;
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const servicesList = document.getElementById('servicesList');
        const emptyState = document.getElementById('emptyState');
        
        if (show) {
            loadingState.classList.remove('d-none');
            servicesList.classList.add('d-none');
            emptyState.classList.add('d-none');
        } else {
            loadingState.classList.add('d-none');
        }
    }

    updateUI() {
        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.userInfo) {
            userNameElement.textContent = this.userInfo.name;
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
            <i class=\"fas fa-${this.getAlertIcon(type)} me-2\"></i>
            ${message}
            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>
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

// Global functions for onclick handlers
window.bookService = function(serviceId, workerId) {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login to book a service');
        window.location.href = 'customer-login.html';
        return;
    }
    
    // Show booking confirmation
    const confirmBooking = confirm('Do you want to book this service?');
    if (confirmBooking) {
        // Show success message and redirect to booking page
        if (window.customerDashboard) {
            window.customerDashboard.showSuccess('Service booking initiated! Redirecting to booking details...');
        }
        
        setTimeout(() => {
            window.location.href = `booking.html?workId=${serviceId}&workerId=${workerId}`;
        }, 1500);
    }
};

window.contactWorker = function(workerId) {
    if (window.customerDashboard) {
        window.customerDashboard.showSuccess('Opening chat with worker...');
    }
    
    // In a real app, this would open a messaging interface
    setTimeout(() => {
        alert(`Contact feature would open messaging with worker ${workerId}`);
    }, 1000);
};

window.changeLocation = function() {
    const newLocation = prompt('Enter your location:', 'Current Location');
    if (newLocation && window.customerDashboard) {
        window.customerDashboard.updateLocationDisplay(newLocation, 'Manual location');
        window.customerDashboard.showSuccess('Location updated successfully!');
    }
};

window.toggleFilters = function() {
    alert('Filter modal would open here with options for price range, distance, rating, etc.');
};

window.clearFilters = function() {
    // Reset category to 'All'
    document.querySelector('.category-item[data-category=\"\"]').click();
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        if (window.customerDashboard) {
            window.customerDashboard.applyFilters();
        }
    }
};

window.openEmergencyBooking = function() {
    if (window.customerDashboard) {
        window.customerDashboard.showSuccess('Emergency service booking opened!');
    }
    
    setTimeout(() => {
        alert('Emergency booking feature would show urgent services available 24/7');
    }, 1000);
};

window.logout = function() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        // Clear all stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        // Show logout message
        if (window.customerDashboard) {
            window.customerDashboard.showSuccess('Logged out successfully!');
        }
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
};

// Initialize customer dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.customerDashboard = new CustomerDashboard();
});