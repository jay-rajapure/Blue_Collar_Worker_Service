document.addEventListener('DOMContentLoaded', function() {
    const serviceTypeCards = document.querySelectorAll('.service-type-card');
    const serviceTypeInput = document.getElementById('serviceType');
    const serviceNameInput = document.getElementById('serviceName');
    const dailyRateInput = document.getElementById('dailyRate');
    const monthlyRateInput = document.getElementById('monthlyRate');
    const availabilityToggle = document.getElementById('isAvailable');
    const maidServiceForm = document.getElementById('maidServiceForm');

    // Service type mapping
    const serviceTypes = {
        'cooking': 'Cooking',
        'cleaning': 'Cleaning',
        'utensil': 'Utensil Cleaning',
        'laundry': 'Laundry',
        'elderly': 'Elderly Care',
        'child': 'Child Care',
        'gardening': 'Gardening',
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
    maidServiceForm.addEventListener('submit', async function(e) {
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
            dailyRate: dailyRateInput.value ? parseFloat(dailyRateInput.value) : null,
            monthlyRate: monthlyRateInput.value ? parseFloat(monthlyRateInput.value) : null,
            isAvailable: availabilityToggle.checked,
            workerId: parseInt(workerId)
        };
        
        try {
            const response = await fetch('/api/maid-services/worker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Maid service added successfully!');
                maidServiceForm.reset();
                // Reset service type selection
                serviceTypeCards.forEach(c => c.classList.remove('active'));
                serviceTypeInput.value = '';
                serviceNameInput.value = '';
            } else {
                const error = await response.text();
                alert('Error adding maid service: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the maid service.');
        }
    });
});