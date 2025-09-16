# Hybrid Worker Assignment Model Implementation

This document describes the implementation of the Hybrid Worker Assignment Model for the Blue Collar App, which includes the following key features:

## 1. One-time Bookings with Auto-Assignment

### Features:
- Uber-style auto-assignment system that selects the best nearby worker
- Matching based on rating, distance, and price
- Worker assigned automatically after booking creation
- Customer can review and interact with assigned worker

### Implementation:
- Enhanced `BookingService` with auto-assignment logic
- `WorkerAssignmentService` to find the best available worker
- Worker selection based on skills, rating, and location proximity

## 2. Negotiation Option After Auto-Assignment

### Features:
- After auto-assignment, customer can:
  - Accept the worker directly ✅
  - Negotiate price 🔄 (in-app chat/call)
  - Reject and choose another worker ❌
- In-app negotiation system with messaging
- Price counter-offers between customer and worker

### Implementation:
- Created `Negotiation` entity to track negotiation process
- `NegotiationService` to manage negotiation workflows
- `NegotiationController` for API endpoints
- Frontend negotiation interface (to be implemented)

## 3. Recurring/Society Jobs

### Features:
- Customers (especially societies) can post recurring jobs
- Examples: maid services, security guards, tank cleaning
- Nearby workers (within 10 km + matching category) get notified
- Workers can send offers and finalize price through negotiation
- Job scheduling based on frequency (daily, weekly, monthly)

### Implementation:
- Created `RecurringJob` entity to store recurring job details
- `RecurringJobService` to manage recurring job workflows
- `RecurringJobController` for API endpoints
- Frontend recurring jobs management page (`recurring-jobs.html`)
- Geolocation-based worker notifications

## 4. Active/Inactive Toggle for Workers

### Features:
- Workers can toggle their availability status
- Only active workers receive job notifications
- Real-time status updates in dashboard
- Persistent status storage in database

### Implementation:
- Added `isAvailable` field to `Users` model
- Created API endpoint to update worker availability
- Updated worker dashboard with toggle switch
- Modified worker assignment logic to only consider active workers

## 5. Escrow Wallet Payment System

### Features:
- Secure escrow wallet for payments
- Money held in escrow until job completion
- Commission deducted only after successful completion
- Transparent transaction history

### Implementation:
- Created `Wallet` entity to manage user wallets
- Created `WalletTransaction` entity to track transactions
- `WalletService` to handle wallet operations
- `WalletController` for API endpoints
- Frontend wallet management page (`wallet.html`)
- Support for multiple transaction types:
  - Credit/Debit
  - Escrow deposit/withdrawal
  - Commission deduction

## 6. Additional Enhancements

### Community Features:
- Customers and workers can both make posts about services
- Role-based visibility (customers see worker posts, workers see customer posts)
- Geolocation notifications for nearby service requests
- Budget information in service requests

### Service Request Enhancements:
- Detailed service descriptions
- Budget/charge information
- Category-based matching
- Urgency indicators

## API Endpoints

### Negotiation Endpoints:
- `POST /api/negotiations/initiate` - Initiate a negotiation
- `POST /api/negotiations/{id}/respond` - Worker responds to negotiation
- `GET /api/negotiations/my-negotiations` - Get user's negotiations
- `GET /api/negotiations/active` - Get active negotiations
- `POST /api/negotiations/{id}/cancel` - Cancel a negotiation

### Recurring Job Endpoints:
- `POST /api/recurring-jobs` - Create a recurring job
- `GET /api/recurring-jobs` - Get all recurring jobs for customer
- `GET /api/recurring-jobs/active` - Get active recurring jobs
- `PUT /api/recurring-jobs/{id}` - Update a recurring job
- `DELETE /api/recurring-jobs/{id}` - Delete a recurring job

### Wallet Endpoints:
- `GET /api/wallet` - Get user's wallet
- `POST /api/wallet/deposit` - Deposit money to wallet
- `POST /api/wallet/escrow/deposit` - Move money to escrow
- `POST /api/wallet/escrow/release` - Release money from escrow
- `POST /api/wallet/escrow/refund` - Refund money from escrow

### User Endpoints:
- `PUT /api/users/update-availability` - Update worker availability
- `GET /api/users/worker-stats` - Get worker statistics

## Database Schema

### New Tables:
1. `negotiations` - Stores negotiation details
2. `recurring_jobs` - Stores recurring job information
3. `wallets` - Stores user wallet information
4. `wallet_transactions` - Stores wallet transaction history

### Updated Tables:
1. `users` - Added `is_available` column
2. `bookings` - Enhanced for negotiation support
3. `community_posts` - Added budget field

## Frontend Pages

### New Pages:
1. `recurring-jobs.html` - Manage recurring jobs
2. `wallet.html` - Wallet management and transactions

### Updated Pages:
1. `worker-dashboard.html` - Added availability toggle
2. `booking.html` - Enhanced booking flow
3. `community-posts.html` - Added budget display

## Future Enhancements

1. **Real-time Chat**: Implement in-app messaging for negotiations
2. **Advanced Matching**: Improve worker-customer matching algorithms
3. **Mobile App**: Develop mobile applications for iOS and Android
4. **Analytics Dashboard**: Add comprehensive analytics for business insights
5. **Multi-language Support**: Support for regional languages
6. **Advanced Scheduling**: Calendar integration for recurring jobs

## Testing

The implementation has been tested for:
- Worker auto-assignment functionality
- Negotiation workflows
- Recurring job creation and management
- Wallet operations
- Availability toggle functionality
- API endpoint validation

## Deployment

The system is ready for deployment with all required components:
- Backend services (Spring Boot)
- Frontend interfaces (HTML/CSS/JavaScript)
- Database schema updates
- API documentation