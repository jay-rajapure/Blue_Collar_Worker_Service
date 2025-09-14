# ServiceHub Frontend Server

This directory contains the frontend for the ServiceHub Blue Collar Worker Platform.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Frontend Server
```bash
npm start
```

The frontend will be available at: **http://localhost:3000**

### 3. Start the Backend (in another terminal)
```bash
# Navigate to the project root
cd ..

# Start Spring Boot backend
mvn spring-boot:run
```

The backend will be available at: **http://localhost:8080**

## Available Pages

- **Home**: http://localhost:3000/
- **Customer Login**: http://localhost:3000/customer-login.html
- **Customer Register**: http://localhost:3000/customer-register.html
- **Worker Login**: http://localhost:3000/worker-login.html
- **Worker Register**: http://localhost:3000/worker-register.html
- **Browse Services**: http://localhost:3000/services.html
- **My Bookings**: http://localhost:3000/my-bookings.html
- **Backend Test**: http://localhost:3000/test-backend.html

## Features

✅ **Complete Authentication System**
- Customer and Worker login/registration
- JWT token-based authentication
- Role-based access control

✅ **Service Management**
- Browse and filter available services
- Create service bookings with form validation
- Manage existing bookings with status tracking

✅ **Geolocation Integration**
- Get current location for service bookings
- Address auto-completion
- Location-based service discovery

✅ **Contact Information**
- Phone, email, and emergency contact details
- Real-time location detection

## Development

The frontend uses:
- **HTML5** for structure
- **Bootstrap 5** for styling
- **Vanilla JavaScript** for functionality
- **Express.js** for serving static files

All API calls are configured to connect to the Spring Boot backend at `http://localhost:8080`.

## API Integration

The frontend integrates with these backend endpoints:
- `POST /auth/signUp` - User registration
- `POST /auth/signIn` - User login
- `GET /api/works` - Get available services
- `POST /api/bookings` - Create bookings
- `GET /api/bookings/my-bookings` - Get user bookings
- `PUT /api/bookings/{id}/cancel` - Cancel bookings

## Troubleshooting

1. **Frontend not loading**: Make sure Node.js is installed and run `npm install`
2. **API errors**: Ensure the Spring Boot backend is running on port 8080
3. **Login issues**: Check the backend test page at `/test-backend.html`
4. **Location not working**: Use HTTPS or localhost (required for geolocation API)