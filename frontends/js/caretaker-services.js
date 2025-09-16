document.addEventListener('DOMContentLoaded', function() {
    const caretakerServicesList = document.getElementById('caretakerServicesList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    // Service type icons mapping
    const serviceTypeIcons = {
        'elderly-care': 'fa-walking',
        'child-care': 'fa-child',
        'pet-care': 'fa-paw',
        'property-care': 'fa-home',
        'garden-care': 'fa-seedling',
        'security': 'fa-shield-alt'
    };
    
    // Service type display names
    const serviceTypeNames = {
        'elderly-care': 'Elderly Care',
        'child-care': 'Child Care',
        'pet-care': 'Pet Care',
        'property-care': 'Property Care',
        'garden-care': 'Garden Care',
        'security': 'Security Services'
    };
    
    // Fetch and display caretaker services
    async function loadCaretakerServices() {
        try {
            // In a real implementation, this would fetch from an API endpoint
            // For now, we'll simulate with sample data
            setTimeout(() => {
                const sampleServices = [
                    {
                        id: 1,
                        serviceName: '24/7 Elderly Care',
                        description: 'Professional caretaker for elderly family members with medical assistance',
                        hourlyRate: 300,
                        dailyRate: 2000,
                        monthlyRate: 50000,
                        isAvailable: true,
                        serviceType: 'elderly-care',
                        workerName: 'Rajesh Kumar',
                        experience: '5 years',
                        rating: 4.8
                    },
                    {
                        id: 2,
                        serviceName: 'Child Care Services',
                        description: 'Experienced nanny for childcare and educational support',
                        hourlyRate: 250,
                        dailyRate: 1500,
                        monthlyRate: 40000,
                        isAvailable: true,
                        serviceType: 'child-care',
                        workerName: 'Priya Sharma',
                        experience: '3 years',
                        rating: 4.9
                    },
                    {
                        id: 3,
                        serviceName: 'Property Caretaker',
                        description: 'Residential property caretaker for maintenance and security',
                        hourlyRate: 200,
                        dailyRate: 1200,
                        monthlyRate: 30000,
                        isAvailable: false,
                        serviceType: 'property-care',
                        workerName: 'Vikram Singh',
                        experience: '7 years',
                        rating: 4.7
                    }
                ];
                displayCaretakerServices(sampleServices);
            }, 1000);
        } catch (error) {
            console.error('Error loading caretaker services:', error);
            showEmptyState();
        }
    }
    
    // Display caretaker services
    function displayCaretakerServices(services) {
        hideLoadingState();
        
        if (!services || services.length === 0) {
            showEmptyState();
            return;
        }
        
        // Clear existing content
        caretakerServicesList.innerHTML = '';
        
        // Create service cards
        services.forEach(service => {
            const serviceCard = createServiceCard(service);
            caretakerServicesList.appendChild(serviceCard);
        });
    }
    
    // Create service card element
    function createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'caretaker-card';
        
        // Get service type icon and name
        const serviceType = service.serviceType || 'other';
        const iconClass = serviceTypeIcons[serviceType] || 'fa-concierge-bell';
        const typeName = serviceTypeNames[serviceType] || 'Other Services';
        
        // Format worker name
        const workerName = service.workerName || 'Worker';
        const workerAvatar = workerName.charAt(0).toUpperCase();
        
        // Format pricing
        const hourlyRate = service.hourlyRate ? `₹${service.hourlyRate.toFixed(2)}/hour` : 'Not available';
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
                                <small class="text-muted">${service.experience || 'Experienced'} • ★${service.rating || '4.5'}</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="pricing-card">
                                <h6><i class="fas fa-clock me-2 text-warning"></i>Hourly Rate</h6>
                                <h4 class="text-primary">${hourlyRate}</h4>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="pricing-card">
                                <h6><i class="fas fa-sun me-2 text-success"></i>Daily Rate</h6>
                                <h4 class="text-primary">${dailyRate}</h4>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="pricing-card">
                                <h6><i class="fas fa-calendar me-2 text-info"></i>Monthly Rate</h6>
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
                            <button class="btn btn-primary" onclick="bookCaretakerService(${service.id})">
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
        loadCaretakerServices();
    };
    
    // Apply filters
    window.applyFilters = function() {
        // In a real implementation, this would apply the selected filters
        console.log('Applying filters');
        // For now, we'll just reload all services
        loadCaretakerServices();
    };
    
    // Book caretaker service
    window.bookCaretakerService = function(serviceId) {
        // In a real implementation, this would navigate to the booking page
        alert(`Booking caretaker service with ID: ${serviceId}\nIn a complete implementation, this would navigate to the booking page.`);
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
    loadCaretakerServices();
});