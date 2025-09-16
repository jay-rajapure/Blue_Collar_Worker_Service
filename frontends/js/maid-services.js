document.addEventListener('DOMContentLoaded', function() {
    const maidServicesList = document.getElementById('maidServicesList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    // Service type icons mapping
    const serviceTypeIcons = {
        'cooking': 'fa-utensils',
        'cleaning': 'fa-broom',
        'utensil': 'fa-glass-whiskey',
        'laundry': 'fa-tshirt',
        'elderly': 'fa-walking',
        'child': 'fa-child',
        'gardening': 'fa-seedling',
        'other': 'fa-concierge-bell'
    };
    
    // Service type display names
    const serviceTypeNames = {
        'cooking': 'Cooking',
        'cleaning': 'Cleaning',
        'utensil': 'Utensil Cleaning',
        'laundry': 'Laundry',
        'elderly': 'Elderly Care',
        'child': 'Child Care',
        'gardening': 'Gardening',
        'other': 'Other Services'
    };
    
    // Fetch and display maid services
    async function loadMaidServices() {
        try {
            const response = await fetch('/api/maid-services/customer', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const services = await response.json();
                displayMaidServices(services);
            } else {
                console.error('Failed to load maid services');
                showEmptyState();
            }
        } catch (error) {
            console.error('Error loading maid services:', error);
            showEmptyState();
        }
    }
    
    // Display maid services
    function displayMaidServices(services) {
        hideLoadingState();
        
        if (!services || services.length === 0) {
            showEmptyState();
            return;
        }
        
        // Clear existing content
        maidServicesList.innerHTML = '';
        
        // Create service cards
        services.forEach(service => {
            const serviceCard = createServiceCard(service);
            maidServicesList.appendChild(serviceCard);
        });
    }
    
    // Create service card element
    function createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'maid-card';
        
        // Get service type icon and name
        const serviceType = service.serviceType || 'other';
        const iconClass = serviceTypeIcons[serviceType] || 'fa-concierge-bell';
        const typeName = serviceTypeNames[serviceType] || 'Other Services';
        
        // Format worker name
        const workerName = service.workerName || 'Worker';
        const workerAvatar = workerName.charAt(0).toUpperCase();
        
        // Format pricing
        const dailyRate = service.dailyRate ? `₹${service.dailyRate.toFixed(2)}/day` : 'Not available';
        const monthlyRate = service.monthlyRate ? `₹${service.monthlyRate.toFixed(2)}/month` : 'Not available';
        
        card.innerHTML = `
            <div class="row">
                <div class="col-md-3 text-center">
                    <div class="service-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <h5>${typeName}</h5>
                    <span class="service-type-badge">${typeName}</span>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h4>${service.serviceName}</h4>
                            <p class="text-muted">${service.description || 'No description provided'}</p>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="worker-avatar">${workerAvatar}</div>
                            <div>
                                <h6 class="mb-0">${workerName}</h6>
                                <small class="text-muted">Service Provider</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="pricing-card">
                                <h6><i class="fas fa-sun me-2 text-warning"></i>Daily Rate</h6>
                                <h4 class="text-primary">${dailyRate}</h4>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="pricing-card">
                                <h6><i class="fas fa-calendar me-2 text-success"></i>Monthly Rate</h6>
                                <h4 class="text-primary">${monthlyRate}</h4>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <span class="badge ${service.isAvailable ? 'bg-success' : 'bg-secondary'}">
                                ${service.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                        </div>
                        <div>
                            <button class="btn btn-primary" onclick="bookMaidService(${service.id})">
                                <i class="fas fa-calendar-check me-2"></i>Book Service
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Filter services
    window.filterServices = function(filterType) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // In a real implementation, this would filter the displayed services
        console.log('Filtering by:', filterType);
        // For now, we'll just reload all services
        loadMaidServices();
    };
    
    // Apply filters
    window.applyFilters = function() {
        // In a real implementation, this would apply the selected filters
        console.log('Applying filters');
        // For now, we'll just reload all services
        loadMaidServices();
    };
    
    // Book maid service
    window.bookMaidService = function(serviceId) {
        // In a real implementation, this would navigate to the booking page
        alert(`Booking maid service with ID: ${serviceId}\nIn a complete implementation, this would navigate to the booking page.`);
        console.log('Booking service:', serviceId);
    };
    
    // Show empty state
    function showEmptyState() {
        hideLoadingState();
        emptyState.classList.remove('d-none');
    }
    
    // Hide loading state
    function hideLoadingState() {
        loadingState.style.display = 'none';
    }
    
    // Initialize
    loadMaidServices();
});