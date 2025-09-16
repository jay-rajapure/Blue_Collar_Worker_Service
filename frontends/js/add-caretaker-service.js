document.addEventListener('DOMContentLoaded', function() {
    const serviceTypeCards = document.querySelectorAll('.service-type-card');
    const serviceTypeInput = document.getElementById('serviceType');
    const serviceNameInput = document.getElementById('serviceName');
    const hourlyRateInput = document.getElementById('hourlyRate');
    const dailyRateInput = document.getElementById('dailyRate');
    const monthlyRateInput = document.getElementById('monthlyRate');
    const availabilityToggle = document.getElementById('isAvailable');
    const caretakerServiceForm = document.getElementById('caretakerServiceForm');

    // Service type mapping
    const serviceTypes = {
        'elderly-care': 'Elderly Care',
        'child-care': 'Child Care',
        'pet-care': 'Pet Care',
        'property-care': 'Property Care',
        'garden-care': 'Garden Care',
        'security': 'Security Services',
        'other': 'Other Services'
    };

    // Handle service type selection
    serviceTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            serviceTypeCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Set the service type value
            const serviceType = this.dataset.service;
            serviceTypeInput.value = serviceType;
            serviceNameInput.value = serviceTypes[serviceType] || '';
        });
    });

    // Handle form submission
    caretakerServiceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get worker ID from localStorage or session
        const workerId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        
        if (!workerId) {
            alert('Worker ID not found. Please log in again.');
            return;
        }
        
        // Prepare form data
        const formData = {
            serviceName: serviceNameInput.value,
            description: document.getElementById('description').value,
            serviceType: serviceTypeInput.value,
            hourlyRate: hourlyRateInput.value ? parseFloat(hourlyRateInput.value) : null,
            dailyRate: dailyRateInput.value ? parseFloat(dailyRateInput.value) : null,
            monthlyRate: monthlyRateInput.value ? parseFloat(monthlyRateInput.value) : null,
            isAvailable: availabilityToggle.checked,
            worker: {
                id: parseInt(workerId)
            }
        };
        
        try {
            const response = await fetch('/api/caretaker-services/worker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Caretaker service added successfully!');
                caretakerServiceForm.reset();
                // Reset service type selection
                serviceTypeCards.forEach(c => c.classList.remove('active'));
                serviceTypeInput.value = '';
                serviceNameInput.value = '';
            } else {
                const error = await response.text();
                alert('Error adding caretaker service: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the caretaker service.');
        }
    });
});