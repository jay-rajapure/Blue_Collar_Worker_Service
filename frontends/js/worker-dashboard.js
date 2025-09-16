// Worker Dashboard JavaScript
// Uses global API_BASE_URL from main.js

class WorkerDashboard {
    constructor() {
        this.userInfo = null;
        this.services = [];
        this.bookings = [];
        this.stats = {
            totalServices: 0,
            pendingBookings: 0,
            completedJobs: 0,
            monthlyEarnings: 0
        };
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuthentication()) {
            return;
        }

        // Show loading overlay
        this.showLoading(true);

        try {
            // Load user data and dashboard information
            await this.loadUserProfile();
            await this.loadDashboardData();
            this.setupEventListeners();
            this.updateUI();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'WORKER') {
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
            window.location.href = 'worker-login.html';
        }, 2000);
    }

    async loadUserProfile() {
        try {
            const authToken = localStorage.getItem('authToken');
            
            // For now, we'll use mock data since we don't have a specific user profile endpoint
            // In a real application, you would call an API like /api/user/profile
            
            this.userInfo = {
                id: 1,
                name: localStorage.getItem('userName') || 'John Worker',
                email: localStorage.getItem('userEmail') || 'worker@example.com',
                category: 'Plumbing & Electrical',
                rating: 4.8,
                experience: 5,
                totalReviews: 47
            };
            
            console.log('User profile loaded:', this.userInfo);
        } catch (error) {
            console.error('Error loading user profile:', error);
            throw error;
        }
    }

    async loadDashboardData() {
        try {
            const authToken = localStorage.getItem('authToken');
            
            // Load worker's services
            await this.loadWorkerServices();
            
            // Load bookings (if endpoint exists)
            // await this.loadWorkerBookings();
            
            // Calculate stats
            this.calculateStats();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    async loadWorkerServices() {
        try {
            const authToken = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/api/works/worker`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.services = await response.json();
                console.log('Worker services loaded:', this.services.length);
            } else if (response.status === 401) {
                this.redirectToLogin();
                return;
            } else {
                console.warn('Failed to load services, using mock data');
                this.services = this.getMockServices();
            }
        } catch (error) {
            console.error('Error loading worker services:', error);
            // Use mock data as fallback
            this.services = this.getMockServices();
        }
    }

    getMockServices() {
        return [
            {
                id: 1,
                title: 'Professional Plumbing Repair',
                category: 'Plumbing',
                charges: 800,
                available: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Electrical Wiring & Installation',
                category: 'Electrical',
                charges: 1200,
                available: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Home Appliance Repair',
                category: 'Appliance Repair',
                charges: 600,
                available: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    calculateStats() {
        // Calculate statistics from loaded data
        this.stats.totalServices = this.services.filter(service => service.available).length;
        this.stats.pendingBookings = Math.floor(Math.random() * 5) + 1; // Mock data
        this.stats.completedJobs = Math.floor(Math.random() * 20) + 25; // Mock data
        this.stats.monthlyEarnings = Math.floor(Math.random() * 15000) + 10000; // Mock data
        
        console.log('Stats calculated:', this.stats);
    }

    setupEventListeners() {
        // Tab change events
        document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                const target = event.target.getAttribute('data-bs-target');
                if (target === '#services') {
                    this.loadServicesTab();
                }
            });
        });

        // Profile edit events
        const profileEditBtns = document.querySelectorAll('[onclick="editProfile()"]');
        profileEditBtns.forEach(btn => {
            btn.removeAttribute('onclick');
            btn.addEventListener('click', this.editProfile.bind(this));
        });

        // Worker status toggle event
        const statusToggle = document.getElementById('workerStatusToggle');
        if (statusToggle) {
            statusToggle.addEventListener('change', this.handleStatusToggle.bind(this));
        }
    }

    updateUI() {
        // Update user profile information
        this.updateProfileSection();
        
        // Update statistics
        this.updateStatsSection();
        
        // Load services in tab if it's active
        if (document.querySelector('#services-tab.active')) {
            this.loadServicesTab();
        }
    }

    updateProfileSection() {
        const elements = {
            workerName: document.getElementById('workerName'),
            welcomeWorkerName: document.getElementById('welcomeWorkerName'),
            profileName: document.getElementById('profileName'),
            profileCategory: document.getElementById('profileCategory'),
            profileRating: document.getElementById('profileRating'),
            profileExperience: document.getElementById('profileExperience'),
            profileAvatar: document.getElementById('profileAvatar'),
            workerInitials: document.getElementById('workerInitials'),
            workerPhoto: document.getElementById('workerPhoto'),
            statusToggle: document.getElementById('workerStatusToggle'),
            statusLabel: document.getElementById('statusLabel')
        };

        if (this.userInfo) {
            const initials = this.getInitials(this.userInfo.name);
            
            if (elements.workerName) elements.workerName.textContent = this.userInfo.name;
            if (elements.welcomeWorkerName) elements.welcomeWorkerName.textContent = this.userInfo.name;
            if (elements.profileName) elements.profileName.textContent = this.userInfo.name;
            if (elements.profileCategory) elements.profileCategory.textContent = this.userInfo.category;
            if (elements.profileRating) elements.profileRating.textContent = this.userInfo.rating;
            if (elements.profileExperience) elements.profileExperience.textContent = this.userInfo.experience;
            
            // Handle profile photo
            if (elements.workerInitials) elements.workerInitials.textContent = initials;
            if (this.userInfo.profileImage && elements.workerPhoto) {
                elements.workerPhoto.src = `data:image/jpeg;base64,${this.userInfo.profileImage}`;
                elements.workerPhoto.style.display = 'block';
                if (elements.workerInitials) elements.workerInitials.style.display = 'none';
            } else {
                if (elements.workerPhoto) elements.workerPhoto.style.display = 'none';
                if (elements.workerInitials) elements.workerInitials.style.display = 'flex';
            }
            
            // Update status toggle
            const isAvailable = this.userInfo.isAvailable !== false; // Default to true if undefined
            if (elements.statusToggle) {
                elements.statusToggle.checked = isAvailable;
            }
            this.updateStatusLabel(isAvailable);
        }
    }

    updateStatsSection() {
        const elements = {
            totalServices: document.getElementById('totalServices'),
            pendingBookings: document.getElementById('pendingBookings'),
            completedJobs: document.getElementById('completedJobs'),
            monthlyEarnings: document.getElementById('monthlyEarnings')
        };

        if (elements.totalServices) elements.totalServices.textContent = this.stats.totalServices;
        if (elements.pendingBookings) elements.pendingBookings.textContent = this.stats.pendingBookings;
        if (elements.completedJobs) elements.completedJobs.textContent = this.stats.completedJobs;
        if (elements.monthlyEarnings) elements.monthlyEarnings.textContent = this.stats.monthlyEarnings.toLocaleString();
    }

    loadServicesTab() {
        const servicesContainer = document.getElementById('servicesList');
        if (!servicesContainer) return;

        if (this.services.length === 0) {
            servicesContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-briefcase fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Services Yet</h5>
                    <p class="text-muted mb-3">You haven't added any services yet. Start by creating your first service!</p>
                    <a href="add-service.html" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Add Your First Service
                    </a>
                </div>
            `;
            return;
        }

        const servicesHtml = this.services.map(service => this.createServiceCard(service)).join('');
        servicesContainer.innerHTML = servicesHtml;
    }

    createServiceCard(service) {
        const statusBadge = service.available 
            ? '<span class="service-status-badge bg-success text-white">Active</span>'
            : '<span class="service-status-badge bg-secondary text-white">Paused</span>';

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${service.title}</h6>
                            <p class="text-muted small mb-2">${service.category}</p>
                            <p class="mb-1">
                                <strong>₹${service.charges}</strong>
                                ${service.estimatedTimeHours ? `<span class="text-muted">/ ${service.estimatedTimeHours}h</span>` : ''}
                            </p>
                        </div>
                        <div class="text-end">
                            ${statusBadge}
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editService(${service.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-${service.available ? 'warning' : 'success'}" 
                                        onclick="toggleService(${service.id}, ${!service.available})">
                                    <i class="fas fa-${service.available ? 'pause' : 'play'}"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        if (!name) return 'WR';
        const words = name.split(' ');
        if (words.length >= 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    editProfile() {
        // For now, show an alert. In a real app, this would open a profile edit modal/page
        this.showInfo('Profile editing feature will be implemented soon. You can update your profile information here.');
    }

    async handleStatusToggle(event) {
        const isAvailable = event.target.checked;
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            this.showError('Please login to update status');
            event.target.checked = !isAvailable; // Revert toggle
            return;
        }

        try {
            // Show loading state
            this.showLoading(true);
            
            // Call API to update worker availability status
            const response = await fetch(`${API_BASE_URL}/auth/worker/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAvailable: isAvailable })
            });

            if (response.ok) {
                // Update UI
                this.updateStatusLabel(isAvailable);
                this.userInfo.isAvailable = isAvailable;
                
                // Show success message
                this.showSuccess(`Status updated to ${isAvailable ? 'Active' : 'Inactive'} successfully!`);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            this.showError('Failed to update status. Please try again.');
            // Revert toggle state
            event.target.checked = !isAvailable;
        } finally {
            this.showLoading(false);
        }
    }

    updateStatusLabel(isAvailable) {
        const statusLabel = document.getElementById('statusLabel');
        if (statusLabel) {
            if (isAvailable) {
                statusLabel.innerHTML = '<span class="badge bg-success">Active</span>';
            } else {
                statusLabel.innerHTML = '<span class="badge bg-secondary">Inactive</span>';
            }
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('d-none');
            } else {
                overlay.classList.add('d-none');
            }
        }
    }

    showError(message) {
        this.showAlert('danger', message);
    }

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showInfo(message) {
        this.showAlert('info', message);
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

// Global functions for onclick handlers
window.editProfile = function() {
    if (window.workerDashboard) {
        window.workerDashboard.editProfile();
    }
};

window.viewEarnings = function() {
    alert('Earnings analytics page will be implemented soon. This will show detailed earnings reports, charts, and payment history.');
};

window.editService = function(serviceId) {
    alert(`Service editing for service ${serviceId} will redirect to edit page.`);
    // window.location.href = `edit-service.html?id=${serviceId}`;
};

window.toggleService = function(serviceId, newAvailability) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login to manage services');
        return;
    }
    
    // Call API to toggle availability
    fetch(`${API_BASE_URL}/api/works/${serviceId}/availability?isAvailable=${newAvailability}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Reload dashboard data
            if (window.workerDashboard) {
                window.workerDashboard.loadDashboardData().then(() => {
                    window.workerDashboard.updateUI();
                    window.workerDashboard.showSuccess(`Service ${newAvailability ? 'activated' : 'paused'} successfully!`);
                });
            }
        } else {
            throw new Error('Failed to update service availability');
        }
    })
    .catch(error => {
        console.error('Error updating service availability:', error);
        if (window.workerDashboard) {
            window.workerDashboard.showError('Failed to update service availability. Please try again.');
        }
    });
};

window.logout = function() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        // Clear all stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Show logout message
        if (window.workerDashboard) {
            window.workerDashboard.showSuccess('Logged out successfully!');
        }
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'worker-login.html';
        }, 1000);
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    const availabilityToggle = document.getElementById('availabilityToggle');
    const statusText = document.getElementById('statusText');
    
    // Initialize dashboard
    async function initializeDashboard() {
        try {
            // Check authentication
            if (!checkAuthentication()) {
                return;
            }

            // Show loading overlay
            showLoading(true);

            try {
                // Load user data and dashboard information
                await loadUserProfile();
                await loadDashboardData();
                setupEventListeners();
                updateUI();
            } catch (error) {
                console.error('Error initializing dashboard:', error);
                showError('Failed to load dashboard data. Please refresh the page.');
            } finally {
                showLoading(false);
            }
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }
    
    // Set up availability toggle
    function setupAvailabilityToggle() {
        availabilityToggle.addEventListener('change', async function() {
            const isChecked = this.checked;
            
            try {
                const response = await fetch('/api/users/update-availability', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        isAvailable: isChecked
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    statusText.textContent = isChecked ? 'Available' : 'Not Available';
                    statusText.className = isChecked ? 'text-success' : 'text-danger';
                    
                    // Update local storage
                    localStorage.setItem('userAvailability', isChecked);
                    
                    // Show success message
                    showNotification('Status updated successfully!', 'success');
                } else {
                    // Revert toggle on error
                    this.checked = !isChecked;
                    const error = await response.json();
                    showNotification('Error updating status: ' + (error.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                // Revert toggle on error
                this.checked = !isChecked;
                console.error('Error updating availability:', error);
                showNotification('Error updating status. Please try again.', 'error');
            }
        });
    }
    
    // Load worker stats
    async function loadWorkerStats() {
        try {
            const response = await fetch('/api/users/worker-stats', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                updateStatsDisplay(stats);
                
                // Set initial availability toggle state
                const isAvailable = stats.isAvailable !== undefined ? stats.isAvailable : true;
                availabilityToggle.checked = isAvailable;
                statusText.textContent = isAvailable ? 'Available' : 'Not Available';
                statusText.className = isAvailable ? 'text-success' : 'text-danger';
            }
        } catch (error) {
            console.error('Error loading worker stats:', error);
        }
    }
    
    // Initialize dashboard
    initializeDashboard();
});
