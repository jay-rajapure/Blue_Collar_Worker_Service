// My Account JavaScript - Profile Management
// Uses global API_BASE_URL from main.js

class MyAccount {
    constructor() {
        this.userInfo = null;
        this.userRole = localStorage.getItem('userRole');
        this.originalData = {};
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuthentication()) {
            return;
        }

        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update UI based on role
            this.updateUIForRole();
            
            // Populate forms
            this.populateForms();
            
        } catch (error) {
            console.error('Error initializing account page:', error);
            this.showError('Failed to load account information. Please refresh the page.');
        }
    }

    checkAuthentication() {
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
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
            window.location.href = this.userRole === 'WORKER' ? 'worker-login.html' : 'customer-login.html';
        }, 2000);
    }

    async loadUserProfile() {
        try {
            // For now, use stored user data and create a complete profile
            this.userInfo = {
                id: localStorage.getItem('userId') || '1',
                name: localStorage.getItem('userName') || 'User Name',
                email: localStorage.getItem('userEmail') || 'user@example.com',
                phone: localStorage.getItem('userPhone') || '',
                address: localStorage.getItem('userAddress') || '',
                city: localStorage.getItem('userCity') || '',
                state: localStorage.getItem('userState') || '',
                pincode: localStorage.getItem('userPincode') || '',
                bio: localStorage.getItem('userBio') || '',
                role: this.userRole || 'CUSTOMER',
                // Worker-specific fields
                specialization: localStorage.getItem('userSpecialization') || '',
                experience: localStorage.getItem('userExperience') || '0',
                skills: localStorage.getItem('userSkills') || '',
                serviceRadius: localStorage.getItem('userServiceRadius') || '10',
                hourlyRate: localStorage.getItem('userHourlyRate') || '500',
                rating: localStorage.getItem('userRating') || '4.5',
                totalServices: localStorage.getItem('userTotalServices') || '0',
                completedJobs: localStorage.getItem('userCompletedJobs') || '0',
                totalEarnings: localStorage.getItem('userTotalEarnings') || '0'
            };
            
            // Store original data for comparison
            this.originalData = { ...this.userInfo };
            
            console.log('User profile loaded:', this.userInfo);
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Use default values
            this.userInfo = {
                name: 'User Name',
                email: 'user@example.com',
                role: this.userRole || 'CUSTOMER'
            };
        }
    }

    setupEventListeners() {
        // Form submissions
        const forms = ['personalInfoForm', 'locationForm', 'professionalForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit(formId);
                });
            }
        });

        // Settings toggles
        const toggles = ['emailNotifications', 'smsNotifications', 'locationServices', 'profileVisibility'];
        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.handleSettingChange(toggleId, toggle.checked);
                });
            }
        });

        // Profile image upload
        const profileImageInput = document.getElementById('profileImageInput');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', this.handleProfileImageUpload.bind(this));
        }
    }

    updateUIForRole() {
        // Update basic profile info
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const userRole = document.getElementById('userRole');
        const profileInitials = document.getElementById('profileInitials');

        if (profileName) profileName.textContent = this.userInfo.name;
        if (profileEmail) profileEmail.textContent = this.userInfo.email;
        if (userRole) userRole.textContent = this.userInfo.role === 'WORKER' ? 'Worker' : 'Customer';
        if (profileInitials) profileInitials.textContent = this.getInitials(this.userInfo.name);

        // Show/hide worker-specific sections
        const workerStats = document.getElementById('workerStats');
        const workerSections = document.getElementById('workerSections');
        
        if (this.userInfo.role === 'WORKER') {
            if (workerStats) {
                workerStats.classList.remove('d-none');
                this.updateWorkerStats();
            }
            if (workerSections) workerSections.classList.remove('d-none');
        } else {
            if (workerStats) workerStats.classList.add('d-none');
            if (workerSections) workerSections.classList.add('d-none');
        }
    }

    updateWorkerStats() {
        const elements = {
            totalServices: document.getElementById('totalServices'),
            averageRating: document.getElementById('averageRating'),
            completedJobs: document.getElementById('completedJobs'),
            totalEarnings: document.getElementById('totalEarnings')
        };

        if (elements.totalServices) elements.totalServices.textContent = this.userInfo.totalServices;
        if (elements.averageRating) elements.averageRating.textContent = this.userInfo.rating;
        if (elements.completedJobs) elements.completedJobs.textContent = this.userInfo.completedJobs;
        if (elements.totalEarnings) elements.totalEarnings.textContent = this.userInfo.totalEarnings;
    }

    populateForms() {
        // Personal information form
        this.setFormValue('firstName', this.getFirstName());
        this.setFormValue('lastName', this.getLastName());
        this.setFormValue('email', this.userInfo.email);
        this.setFormValue('phone', this.userInfo.phone);
        this.setFormValue('bio', this.userInfo.bio);

        // Location form
        this.setFormValue('address', this.userInfo.address);
        this.setFormValue('city', this.userInfo.city);
        this.setFormValue('state', this.userInfo.state);
        this.setFormValue('pincode', this.userInfo.pincode);

        // Professional form (worker only)
        if (this.userInfo.role === 'WORKER') {
            this.setFormValue('specialization', this.userInfo.specialization);
            this.setFormValue('experience', this.userInfo.experience);
            this.setFormValue('skills', this.userInfo.skills);
            this.setFormValue('serviceRadius', this.userInfo.serviceRadius);
            this.setFormValue('hourlyRate', this.userInfo.hourlyRate);
        }

        // Settings toggles (load from localStorage or defaults)
        this.setToggleValue('emailNotifications', this.getSetting('emailNotifications', true));
        this.setToggleValue('smsNotifications', this.getSetting('smsNotifications', false));
        this.setToggleValue('locationServices', this.getSetting('locationServices', true));
        this.setToggleValue('profileVisibility', this.getSetting('profileVisibility', true));
    }

    getFirstName() {
        return this.userInfo.name.split(' ')[0] || '';
    }

    getLastName() {
        const parts = this.userInfo.name.split(' ');
        return parts.length > 1 ? parts.slice(1).join(' ') : '';
    }

    setFormValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    setToggleValue(toggleId, value) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.checked = value;
        }
    }

    getSetting(key, defaultValue) {
        const value = localStorage.getItem(`setting_${key}`);
        return value !== null ? JSON.parse(value) : defaultValue;
    }

    async handleFormSubmit(formId) {
        this.showLoading(true);
        
        try {
            const formData = new FormData(document.getElementById(formId));
            const updates = {};
            
            // Process form data based on form type
            switch (formId) {
                case 'personalInfoForm':
                    updates.name = `${formData.get('firstName')} ${formData.get('lastName')}`.trim();
                    updates.email = formData.get('email');
                    updates.phone = formData.get('phone');
                    updates.bio = formData.get('bio');
                    break;
                    
                case 'locationForm':
                    updates.address = formData.get('address');
                    updates.city = formData.get('city');
                    updates.state = formData.get('state');
                    updates.pincode = formData.get('pincode');
                    break;
                    
                case 'professionalForm':
                    updates.specialization = formData.get('specialization');
                    updates.experience = formData.get('experience');
                    updates.skills = formData.get('skills');
                    updates.serviceRadius = formData.get('serviceRadius');
                    updates.hourlyRate = formData.get('hourlyRate');
                    break;
            }
            
            // Update user info and localStorage
            Object.assign(this.userInfo, updates);
            this.saveToLocalStorage(updates);
            
            // In a real app, this would make an API call to update the backend
            // await this.updateUserProfile(updates);
            
            this.showSuccess(`${this.getFormDisplayName(formId)} updated successfully!`);
            
            // Update UI elements that might have changed
            if (updates.name) {
                const profileName = document.getElementById('profileName');
                const profileInitials = document.getElementById('profileInitials');
                if (profileName) profileName.textContent = updates.name;
                if (profileInitials) profileInitials.textContent = this.getInitials(updates.name);
                localStorage.setItem('userName', updates.name);
            }
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    getFormDisplayName(formId) {
        const names = {
            personalInfoForm: 'Personal information',
            locationForm: 'Location information',
            professionalForm: 'Professional information'
        };
        return names[formId] || 'Information';
    }

    saveToLocalStorage(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'name') {
                localStorage.setItem('userName', value);
            } else {
                localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
            }
        });
    }

    handleSettingChange(settingId, value) {
        localStorage.setItem(`setting_${settingId}`, JSON.stringify(value));
        
        const settingNames = {
            emailNotifications: 'Email notifications',
            smsNotifications: 'SMS notifications',
            locationServices: 'Location services',
            profileVisibility: 'Profile visibility'
        };
        
        const settingName = settingNames[settingId] || 'Setting';
        this.showSuccess(`${settingName} ${value ? 'enabled' : 'disabled'}.`);
    }

    handleProfileImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Image file size must be less than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // In a real app, this would upload to the server
            // For now, we'll just show a success message
            this.showSuccess('Profile image updated successfully!');
            
            // You could display the image preview here
            console.log('Image data:', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    getInitials(name) {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length >= 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
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

    showSuccess(message) {
        this.showAlert('success', message);
    }

    showError(message) {
        this.showAlert('danger', message);
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
window.goBack = function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'WORKER') {
        window.location.href = 'worker-dashboard.html';
    } else {
        window.location.href = 'customer-dashboard.html';
    }
};

window.editProfile = function() {
    // Scroll to personal information form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.scrollIntoView({ behavior: 'smooth' });
        // Focus on first input
        const firstInput = personalInfoForm.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 500);
        }
    }
};

window.triggerProfileImageUpload = function() {
    const input = document.getElementById('profileImageInput');
    if (input) {
        input.click();
    }
};

window.handleProfileImageUpload = function(event) {
    if (window.myAccount) {
        window.myAccount.handleProfileImageUpload(event);
    }
};

window.changePassword = function() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    // In a real app, this would make an API call
    if (window.myAccount) {
        window.myAccount.showSuccess('Password changed successfully!');
    }
};

window.setupTwoFactor = function() {
    alert('Two-factor authentication setup would open here. This feature would integrate with SMS or authenticator apps.');
};

window.deleteAccount = function() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmation) return;
    
    const emailConfirmation = prompt('Type your email address to confirm account deletion:');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    if (emailConfirmation !== userEmail) {
        alert('Email confirmation does not match!');
        return;
    }
    
    // In a real app, this would make an API call to delete the account
    alert('Account deletion request submitted. You will receive a confirmation email shortly.');
};

// Initialize account page when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    window.myAccount = new MyAccount();
});