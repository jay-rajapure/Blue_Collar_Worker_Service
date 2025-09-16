document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    const categoryInput = document.getElementById('category');
    const serviceOfferForm = document.getElementById('serviceOfferForm');

    // Handle category selection
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            categoryCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Set the category value
            categoryInput.value = this.dataset.category;
        });
    });

    // Handle form submission
    serviceOfferForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate category selection
        if (!categoryInput.value) {
            alert('Please select a service category');
            return;
        }
        
        // Prepare form data
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            category: categoryInput.value,
            postType: 'SERVICE_OFFER',
            location: document.getElementById('location').value,
            address: document.getElementById('address').value,
            latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
            longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
            phoneNumber: document.getElementById('phoneNumber').value,
            isUrgent: document.getElementById('isUrgent').checked
        };
        
        try {
            const response = await fetch('/api/community-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Service offer posted successfully!');
                serviceOfferForm.reset();
                // Reset category selection
                categoryCards.forEach(c => c.classList.remove('active'));
                categoryInput.value = '';
                
                // Redirect to community posts page
                setTimeout(() => {
                    window.location.href = 'community-posts.html';
                }, 1000);
            } else {
                const error = await response.text();
                alert('Error posting service offer: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while posting the service offer.');
        }
    });
});