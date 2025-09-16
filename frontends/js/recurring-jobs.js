document.addEventListener('DOMContentLoaded', function() {
    const activeJobsList = document.getElementById('activeJobsList');
    const allJobsList = document.getElementById('allJobsList');
    const createJobForm = document.getElementById('createJobForm');
    const saveJobBtn = document.getElementById('saveJobBtn');
    const userNameSpan = document.getElementById('userName');
    
    // Initialize page
    initializePage();
    
    // Initialize page
    async function initializePage() {
        try {
            // Set user name
            const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
            if (userName) {
                userNameSpan.textContent = userName;
            }
            
            // Load jobs
            await loadActiveJobs();
            await loadAllJobs();
            
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }
    
    // Load active jobs
    async function loadActiveJobs() {
        try {
            const response = await fetch('/api/recurring-jobs/active', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const jobs = await response.json();
                displayJobs(jobs, activeJobsList, true);
            } else {
                activeJobsList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No active recurring jobs found</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createJobModal">
                            <i class="fas fa-plus me-2"></i>Create Your First Job
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading active jobs:', error);
            activeJobsList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load active jobs. Please try again.
                </div>
            `;
        }
    }
    
    // Load all jobs
    async function loadAllJobs() {
        try {
            const response = await fetch('/api/recurring-jobs', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const jobs = await response.json();
                displayJobs(jobs, allJobsList, false);
            } else {
                allJobsList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No recurring jobs found</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading all jobs:', error);
            allJobsList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load jobs. Please try again.
                </div>
            `;
        }
    }
    
    // Display jobs
    function displayJobs(jobs, container, isActiveTab) {
        if (!jobs || jobs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                    <p class="text-muted">No recurring jobs found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        jobs.forEach(job => {
            const jobCard = createJobCard(job, isActiveTab);
            container.appendChild(jobCard);
        });
    }
    
    // Create job card
    function createJobCard(job, isActiveTab) {
        const card = document.createElement('div');
        card.className = `job-card ${job.isActive ? 'active' : ''}`;
        
        // Format date
        const createdDate = new Date(job.createdAt);
        const formattedDate = createdDate.toLocaleDateString();
        
        // Frequency badge
        let frequencyClass = 'bg-primary';
        if (job.frequency === 'DAILY') frequencyClass = 'bg-success';
        if (job.frequency === 'WEEKLY') frequencyClass = 'bg-warning';
        if (job.frequency === 'MONTHLY') frequencyClass = 'bg-info';
        
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h5 class="mb-1">${job.jobTitle}</h5>
                    <p class="text-muted mb-2">${job.jobDescription}</p>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-secondary me-2">
                            <i class="fas fa-tag me-1"></i>${job.category}
                        </span>
                        <span class="badge ${frequencyClass} frequency-badge me-2">
                            <i class="fas fa-sync me-1"></i>${job.frequency}
                        </span>
                        ${job.estimatedAmount ? 
                            `<span class="badge bg-success">
                                <i class="fas fa-rupee-sign me-1"></i>${job.estimatedAmount}
                            </span>` : ''}
                    </div>
                </div>
                <div class="text-end">
                    <small class="text-muted">Created: ${formattedDate}</small>
                    <div class="mt-2">
                        <span class="badge ${job.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${job.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <small class="text-muted">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    ${job.customerAddress}
                </small>
            </div>
            
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    ${job.preferredTime ? 
                        `<small class="text-muted">
                            <i class="fas fa-clock me-1"></i>Preferred Time: ${job.preferredTime}
                        </small>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editJob(${job.id})">
                        <i class="fas fa-edit me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteJob(${job.id})">
                        <i class="fas fa-trash me-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Save job
    saveJobBtn.addEventListener('click', async function() {
        const formData = new FormData(createJobForm);
        
        // Validate required fields
        const jobTitle = document.getElementById('jobTitle').value;
        const jobDescription = document.getElementById('jobDescription').value;
        const category = document.getElementById('category').value;
        const frequency = document.getElementById('frequency').value;
        const customerAddress = document.getElementById('customerAddress').value;
        
        if (!jobTitle || !jobDescription || !category || !frequency || !customerAddress) {
            alert('Please fill in all required fields');
            return;
        }
        
        const jobData = {
            jobTitle: jobTitle,
            jobDescription: jobDescription,
            category: category,
            frequency: frequency,
            preferredTime: document.getElementById('preferredTime').value || null,
            estimatedAmount: document.getElementById('estimatedAmount').value ? 
                parseFloat(document.getElementById('estimatedAmount').value) : null,
            customerAddress: customerAddress,
            latitude: document.getElementById('latitude').value ? 
                parseFloat(document.getElementById('latitude').value) : null,
            longitude: document.getElementById('longitude').value ? 
                parseFloat(document.getElementById('longitude').value) : null,
            isActive: document.getElementById('isActive').checked
        };
        
        try {
            const response = await fetch('/api/recurring-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(jobData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Job created successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('createJobModal'));
                modal.hide();
                
                // Reset form
                createJobForm.reset();
                
                // Reload jobs
                await loadActiveJobs();
                await loadAllJobs();
            } else {
                const error = await response.json();
                alert('Error creating job: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the job.');
        }
    });
    
    // Edit job (global function for onclick)
    window.editJob = function(jobId) {
        alert('Edit functionality would be implemented here. Job ID: ' + jobId);
        // In a full implementation, this would open a modal with the job details for editing
    };
    
    // Delete job (global function for onclick)
    window.deleteJob = async function(jobId) {
        if (!confirm('Are you sure you want to delete this recurring job?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/recurring-jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                alert('Job deleted successfully!');
                // Reload jobs
                await loadActiveJobs();
                await loadAllJobs();
            } else {
                const error = await response.json();
                alert('Error deleting job: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the job.');
        }
    };
});