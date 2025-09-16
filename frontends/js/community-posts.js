document.addEventListener('DOMContentLoaded', function() {
    const postsList = document.getElementById('postsList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const createPostButton = document.getElementById('createPostButton');
    const createPostFloatingButton = document.getElementById('createPostFloatingButton');
    const navLinks = document.getElementById('navLinks');
    const dashboardLink = document.getElementById('dashboardLink');
    const userNameSpan = document.getElementById('userName');
    
    let currentUserRole = null;
    let allPosts = [];
    
    // Initialize based on user role
    initializePage();
    
    // Initialize page based on user role
    async function initializePage() {
        try {
            // Get user info from localStorage
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
            const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
            
            if (userRole) {
                currentUserRole = userRole;
                userNameSpan.textContent = userName || 'User';
                
                // Set up navigation based on role
                setupNavigation(userRole);
                
                // Set up create post button
                setupCreatePostButton(userRole);
                
                // Load posts
                await loadCommunityPosts();
            } else {
                // Redirect to login if no user info
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error initializing page:', error);
            window.location.href = 'login.html';
        }
    }
    
    // Set up navigation based on user role
    function setupNavigation(role) {
        if (role === 'CUSTOMER') {
            dashboardLink.href = 'customer-dashboard.html';
            navLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link text-white" href="customer-dashboard.html">
                        <i class="fas fa-home me-1"></i>Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="services.html">
                        <i class="fas fa-briefcase me-1"></i>Services
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="post-service-request.html">
                        <i class="fas fa-plus me-1"></i>Post Service Request
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white active" href="community-posts.html">
                        <i class="fas fa-users me-1"></i>Community Posts
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="my-bookings.html">
                        <i class="fas fa-calendar me-1"></i>My Bookings
                    </a>
                </li>
            `;
        } else if (role === 'WORKER') {
            dashboardLink.href = 'worker-dashboard.html';
            navLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link text-white" href="worker-dashboard.html">
                        <i class="fas fa-home me-1"></i>Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="services.html?view=worker">
                        <i class="fas fa-briefcase me-1"></i>My Services
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="post-service-offer.html">
                        <i class="fas fa-plus me-1"></i>Post Service Offer
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white active" href="community-posts.html">
                        <i class="fas fa-users me-1"></i>Community Posts
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="my-bookings.html">
                        <i class="fas fa-calendar me-1"></i>My Bookings
                    </a>
                </li>
            `;
        }
    }
    
    // Set up create post button based on user role
    function setupCreatePostButton(role) {
        if (role === 'CUSTOMER') {
            createPostButton.textContent = 'Post Service Request';
            createPostButton.onclick = () => window.location.href = 'post-service-request.html';
            createPostFloatingButton.title = 'Post Service Request';
            createPostFloatingButton.onclick = () => window.location.href = 'post-service-request.html';
        } else if (role === 'WORKER') {
            createPostButton.textContent = 'Post Service Offer';
            createPostButton.onclick = () => window.location.href = 'post-service-offer.html';
            createPostFloatingButton.title = 'Post Service Offer';
            createPostFloatingButton.onclick = () => window.location.href = 'post-service-offer.html';
        }
    }
    
    // Load community posts
    async function loadCommunityPosts() {
        try {
            const endpoint = currentUserRole === 'CUSTOMER' ? 
                '/api/community-posts/customer' : 
                '/api/community-posts/worker';
                
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                allPosts = await response.json();
                displayPosts(allPosts);
            } else {
                console.error('Failed to load community posts');
                showEmptyState();
            }
        } catch (error) {
            console.error('Error loading community posts:', error);
            showEmptyState();
        }
    }
    
    // Display posts
    function displayPosts(posts) {
        hideLoadingState();
        
        if (!posts || posts.length === 0) {
            showEmptyState();
            return;
        }
        
        // Clear existing content
        postsList.innerHTML = '';
        
        // Create post cards
        posts.forEach(post => {
            const postCard = createPostCard(post);
            postsList.appendChild(postCard);
        });
    }
    
    // Create post card element
    function createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'card post-card';
        
        // Format user name
        const userName = post.userName || 'User';
        const userAvatar = userName.charAt(0).toUpperCase();
        
        // Format date
        const postDate = new Date(post.createdAt);
        const formattedDate = postDate.toLocaleDateString() + ' ' + postDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Format budget
        const budgetInfo = post.budget && post.budget > 0 ? 
            `<span class="badge bg-success me-2"><i class="fas fa-rupee-sign me-1"></i>${post.budget}</span>` : '';
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-3">${userAvatar}</div>
                        <div>
                            <h5 class="card-title mb-1">${post.title}</h5>
                            <div class="d-flex align-items-center">
                                <small class="text-muted me-2">${userName}</small>
                                <span class="badge ${post.postType === 'SERVICE_REQUEST' ? 'service-request-badge' : 'service-offer-badge'} post-type-badge">
                                    ${post.postType === 'SERVICE_REQUEST' ? 'Service Request' : 'Service Offer'}
                                </span>
                                ${post.isUrgent ? '<span class="badge urgent-badge ms-2">URGENT</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                
                <p class="card-text">${post.description || 'No description provided'}</p>
                
                <div class="d-flex flex-wrap align-items-center mb-3">
                    <span class="badge bg-primary category-badge me-2">
                        <i class="fas fa-tag me-1"></i>${post.category}
                    </span>
                    ${budgetInfo}
                    ${post.location ? `<span class="badge bg-secondary me-2"><i class="fas fa-map-marker-alt me-1"></i>${post.location}</span>` : ''}
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        ${post.phoneNumber ? `<small class="text-muted"><i class="fas fa-phone me-1"></i>${post.phoneNumber}</small>` : ''}
                    </div>
                    <div>
                        ${post.userId === parseInt(localStorage.getItem('userId')) ? 
                            `<button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Filter posts
    window.filterPosts = function(filterType) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
        
        let filteredPosts = [...allPosts];
        
        switch (filterType) {
            case 'my-posts':
                const userId = parseInt(localStorage.getItem('userId'));
                filteredPosts = allPosts.filter(post => post.userId === userId);
                break;
            case 'requests':
                filteredPosts = allPosts.filter(post => post.postType === 'SERVICE_REQUEST');
                break;
            case 'offers':
                filteredPosts = allPosts.filter(post => post.postType === 'SERVICE_OFFER');
                break;
            case 'urgent':
                filteredPosts = allPosts.filter(post => post.isUrgent);
                break;
        }
        
        displayPosts(filteredPosts);
    };
    
    // Apply filters
    window.applyFilters = function() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        
        let filteredPosts = [...allPosts];
        
        // Apply category filter
        if (categoryFilter) {
            filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
        }
        
        // Apply search filter
        if (searchInput) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(searchInput) || 
                (post.description && post.description.toLowerCase().includes(searchInput)) ||
                post.category.toLowerCase().includes(searchInput)
            );
        }
        
        displayPosts(filteredPosts);
    };
    
    // Delete post
    window.deletePost = async function(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/community-posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                alert('Post deleted successfully!');
                // Reload posts
                await loadCommunityPosts();
            } else {
                const error = await response.text();
                alert('Error deleting post: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the post.');
        }
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
});    // Hide loading state
    function hideLoadingState() {
        loadingState.style.display = 'none';
    }
});