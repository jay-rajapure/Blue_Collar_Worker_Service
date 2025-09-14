# Frontend Integration Updates - ServiceHub

## Overview
This document outlines the changes made to integrate the frontend with the backend APIs and add the requested features.

## 🔧 API Integration Updates

### 1. **Authentication Endpoints Corrected**
Updated all frontend JavaScript files to use the correct backend endpoints:

**Previous (Incorrect):**
- `POST /auth/login`
- `POST /auth/signup`

**Updated (Correct):**
- `POST /auth/signIn` - User login
- `POST /auth/signUp` - User registration

### 2. **Request/Response Format Updates**

**Customer/Worker Registration:**
```javascript
// New request format
{
    "name": "firstName lastName", 
    "email": "user@example.com",
    "passwordHash": "password123",
    "role": "CUSTOMER" // or "WORKER"
}

// Expected response format
{
    "jwt": "token_string",
    "message": "Register Success",
    "role": "CUSTOMER"
}
```

**Customer/Worker Login:**
```javascript
// New request format
{
    "email": "user@example.com",
    "password": "password123"
}

// Expected response format
{
    "jwt": "token_string",
    "message": "Login Success", 
    "role": "CUSTOMER"
}
```

### 3. **Files Updated**
- `customer-login.js` - Updated login API call and response handling
- `customer-register.js` - Updated registration API call and response handling
- `worker-login.js` - Updated login API call and response handling  
- `worker-register.js` - Updated registration API call and response handling
- `main.js` - Updated API utilities and added geolocation features

## 📍 Geolocation API Integration

### 1. **New Features Added**
- **Location Detection:** Users can get their current location using the browser's Geolocation API
- **Reverse Geocoding:** Converts coordinates to human-readable addresses using OpenStreetMap Nominatim API
- **Location Storage:** Saves user location in localStorage for reuse
- **Nearby Services:** Framework for finding services based on location

### 2. **Implementation Details**

**Location Detection Function:**
```javascript
function getLocation() {
    // Uses navigator.geolocation.getCurrentPosition()
    // Handles permission requests and errors
    // Shows loading states and user feedback
}
```

**Reverse Geocoding:**
```javascript
async function reverseGeocode(latitude, longitude) {
    // Uses OpenStreetMap Nominatim API (free)
    // Formats address from response
    // Fallback to coordinates if geocoding fails
}
```

**Error Handling:**
- Permission denied
- Position unavailable  
- Timeout errors
- Service unavailable

### 3. **UI Components Added**
- **Get Location Button:** Triggers location detection
- **Location Display:** Shows formatted address and coordinates
- **Update Location Button:** Allows refreshing location
- **Find Services Button:** Framework for location-based service search

## 📞 Contact Information Added

### 1. **Contact Details in About Section**
Added comprehensive contact information to `index.html`:

```html
<!-- Contact Information -->
<div class="mt-5">
    <h4 class="mb-3">Contact Us</h4>
    <div class="row g-3">
        <div class="col-md-6">
            <!-- Customer Support Phone -->
            <i class="fas fa-phone text-primary me-3"></i>
            <div>
                <small class="text-muted">Customer Support</small>
                <div class="fw-semibold">+91 98765 43210</div>
            </div>
        </div>
        <div class="col-md-6">
            <!-- Email Support -->
            <i class="fas fa-envelope text-primary me-3"></i>
            <div>
                <small class="text-muted">Email Support</small>
                <div class="fw-semibold">support@servicehub.com</div>
            </div>
        </div>
        <div class="col-md-6">
            <!-- Emergency Helpline -->
            <i class="fas fa-headset text-primary me-3"></i>
            <div>
                <small class="text-muted">Emergency Helpline</small>
                <div class="fw-semibold">1800-123-HELP</div>
            </div>
        </div>
        <div class="col-md-6">
            <!-- Geolocation -->
            <i class="fas fa-map-marker-alt text-primary me-3"></i>
            <div>
                <small class="text-muted">Your Location</small>
                <div class="fw-semibold" id="userLocation">
                    <!-- Geolocation widget -->
                </div>
            </div>
        </div>
    </div>
</div>
```

## 🛠️ Additional Features

### 1. **Complete Booking System Implementation**
Created a full-featured booking system with both backend and frontend:

**Backend Implementation:**
- **BookingStatus Enum**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED
- **Booking Entity**: Full JPA entity with relationships to Users and Work
- **BookingRequest/Response DTOs**: Complete data transfer objects
- **BookingRepository**: JPA repository with custom queries
- **BookingService**: Complete business logic layer
- **BookingController**: REST API endpoints with JWT authentication

**Frontend Implementation:**
- **Services Browse Page** (`services.html`): Browse and filter available services
- **Booking Form Page** (`booking.html`): Create new service bookings
- **My Bookings Page** (`my-bookings.html`): Manage existing bookings
- **JavaScript Classes**: Complete booking system with validation and API integration

**Booking API Endpoints:**
```
POST   /api/bookings              - Create booking
GET    /api/bookings              - Get all bookings (admin)
GET    /api/bookings/{id}         - Get booking by ID
GET    /api/bookings/my-bookings  - Get current user's bookings
PUT    /api/bookings/{id}/accept  - Accept booking (worker)
PUT    /api/bookings/{id}/reject  - Reject booking (worker)
PUT    /api/bookings/{id}/cancel  - Cancel booking
PUT    /api/bookings/{id}/start   - Start work
PUT    /api/bookings/{id}/complete - Complete work
DELETE /api/bookings/{id}         - Delete booking
```

### 2. **Enhanced Navigation**
Updated the main homepage with improved navigation:
- Added "Browse Services" and "My Bookings" links
- Enhanced dropdown menus for better user experience
- Added "Find Services Now" call-to-action button

### 3. **Backend Connection Test Page**
Created `test-backend.html` for debugging and verifying backend connectivity:
- Tests authentication endpoints
- Tests works/services endpoints  
- Displays connection status
- Provides troubleshooting information

### 2. **Error Handling Improvements**
- Removed non-existent email check endpoints
- Added proper error handling for API failures
- Improved user feedback for all operations

### 3. **localStorage Integration**
- Stores authentication tokens
- Saves user location data
- Remembers login credentials (optional)

## 📁 File Structure Changes

```
frontends/
├── html/
│   ├── index.html (✅ Updated - Contact info + geolocation + booking links)
│   ├── test-backend.html (✨ New - Backend testing)
│   ├── services.html (✨ New - Browse services)
│   ├── booking.html (✨ New - Create bookings)
│   ├── my-bookings.html (✨ New - Manage bookings)
│   └── ... (other HTML files)
├── js/
│   ├── main.js (✅ Updated - Geolocation + API utilities)
│   ├── customer-login.js (✅ Updated - API endpoints)
│   ├── customer-register.js (✅ Updated - API endpoints)
│   ├── worker-login.js (✅ Updated - API endpoints)
│   ├── worker-register.js (✅ Updated - API endpoints)
│   ├── services.js (✨ New - Services browsing)
│   ├── booking.js (✨ New - Booking creation)
│   └── my-bookings.js (✨ New - Booking management)
└── css/ (No changes)
```

## 🚀 How to Test

### 1. **Start the Backend**
```bash
# Navigate to project root
cd /path/to/Blue_Collar_Worker_fork

# Start Spring Boot application
mvn spring-boot:run

# Or if already built
java -jar target/blue-colller-worker-service-0.0.1-SNAPSHOT.jar
```

### 2. **Access the Frontend**
1. Open `frontends/html/index.html` in your browser
2. Click the server icon in the navigation to test backend connectivity
3. Try customer/worker registration and login
4. Test geolocation features in the About section

### 3. **Expected Behavior**
- ✅ Registration should work with correct API endpoints
- ✅ Login should work with correct API endpoints  
- ✅ Location detection should work (requires HTTPS or localhost)
- ✅ Contact information should be visible in About section
- ✅ Backend test page should show connectivity status

## 🔍 Backend Endpoints Used

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|-------------|
| POST | `/auth/signUp` | User Registration | `{name, email, passwordHash, role}` |
| POST | `/auth/signIn` | User Login | `{email, password}` |
| GET | `/auth/` | Get all users | None |
| GET | `/api/works` | Get all works | None |
| POST | `/api/works` | Create work | Multipart form data |
| POST | `/api/bookings` | Create booking | `{workId, workerId, description, scheduledDate, customerAddress, customerPhone, specialInstructions}` |
| GET | `/api/bookings/my-bookings` | Get user bookings | None |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking | None |
| PUT | `/api/bookings/{id}/accept` | Accept booking (worker) | None |
| PUT | `/api/bookings/{id}/reject` | Reject booking (worker) | None |
| PUT | `/api/bookings/{id}/start` | Start work | None |
| PUT | `/api/bookings/{id}/complete` | Complete work | None |

## 🌐 External APIs Used

1. **OpenStreetMap Nominatim API**
   - Purpose: Reverse geocoding (coordinates to address)
   - URL: `https://nominatim.openstreetmap.org/reverse`
   - Free to use, no API key required
   - Rate limited but sufficient for demo purposes

## 📱 Browser Compatibility

### Geolocation API Requirements:
- **HTTPS Required:** Geolocation only works on HTTPS (or localhost)
- **User Permission:** Requires user permission to access location
- **Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)

### Testing Notes:
- Use `http://localhost` or HTTPS for location features
- Location services must be enabled in browser
- Some browsers may show security warnings for HTTP sites

## 🎯 Next Steps

1. **Test all functionality with running backend**
2. **Create dashboard pages for authenticated users**
3. **Implement booking system integration**
4. **Add service search and filtering based on location**
5. **Enhance error handling and user feedback**

## 💡 Technical Notes

- All API calls now use correct Spring Boot endpoints
- JWT tokens are stored in localStorage
- Location data is cached for improved UX
- Error handling covers network failures and API errors
- Responsive design maintained throughout updates