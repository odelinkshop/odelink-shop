# Implementation Plan: Shopier Store Advertising System

## Overview

This implementation plan breaks down the Shopier Store Advertising System into discrete, actionable coding tasks. The system enables Shopier store owners to purchase and manage advertisements on the Odelink platform, with comprehensive admin management and real-time analytics tracking.

The implementation follows the existing codebase patterns:
- PostgreSQL database with pool-based queries
- Express.js routes with Joi validation
- React components with Framer Motion animations
- Multer for file uploads
- JWT authentication with existing middleware

## Tasks

- [ ] 1. Set up database schema and migrations
  - Create PostgreSQL tables: `advertisements`, `advertisement_statistics`, `advertisement_hourly_stats`, `advertisement_impression_tracking`
  - Add indexes for performance optimization
  - Create database migration script in `backend/config/` or as standalone SQL file
  - Test schema creation and verify all constraints work correctly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 2. Implement backend models and services
  - [ ] 2.1 Create Advertisement model (`backend/models/Advertisement.js`)
    - Implement static methods: `create`, `findById`, `findByUserId`, `getActiveByPlacement`, `updateStatus`, `updatePayment`
    - Follow existing model patterns from `User.js` and `Site.js`
    - Include proper error handling and validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.10_
  
  - [ ] 2.2 Create Advertisement Service (`backend/services/advertisementService.js`)
    - Implement business logic for advertisement lifecycle management
    - Add methods: `create`, `getActiveByPlacement`, `getByUserId`, `updateStatus`, `updatePayment`
    - Implement auto-update methods: `updateExpiredAds`, `activateApprovedAds`
    - _Requirements: 1.5, 1.6, 1.9, 1.10, 4.7, 4.8, 4.9_
  
  - [ ] 2.3 Create Advertisement Analytics Service (`backend/services/advertisementAnalyticsService.js`)
    - Implement impression tracking with duplicate prevention (30-second window)
    - Implement click tracking with duplicate prevention (5-second window)
    - Add hourly breakdown aggregation logic
    - Implement statistics retrieval methods
    - Add cleanup method for old tracking data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [ ]* 2.4 Write unit tests for Advertisement Service
  - Test advertisement creation with valid and invalid data
  - Test status transitions (pending → approved → active → expired)
  - Test payment status updates
  - Test auto-activation and expiration logic
  - _Requirements: 1.5, 4.7, 4.8, 4.9_

- [ ]* 2.5 Write unit tests for Analytics Service
  - Test impression tracking with duplicate prevention
  - Test click tracking with duplicate prevention
  - Test hourly breakdown aggregation
  - Test statistics retrieval
  - _Requirements: 6.1, 6.4, 6.9, 7.1, 7.9_

- [ ] 3. Implement API routes and endpoints
  - [ ] 3.1 Create advertisement routes (`backend/routes/advertisements.js`)
    - POST `/api/advertisements` - Create advertisement with logo upload
    - GET `/api/advertisements/my` - Get user's advertisements
    - GET `/api/advertisements/:id` - Get single advertisement
    - GET `/api/advertisements/active` - Get active ads by placement (public)
    - POST `/api/advertisements/:id/impression` - Record impression
    - POST `/api/advertisements/:id/click` - Record click
    - GET `/api/advertisements/:id/statistics` - Get ad statistics
    - Configure Multer for logo uploads (5MB limit, PNG/JPG/JPEG/SVG)
    - Add Joi validation schemas for all endpoints
    - Implement rate limiting using existing `rateLimiters` middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 3.1, 3.9, 6.5, 7.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.11_
  
  - [ ] 3.2 Create admin advertisement routes (`backend/routes/adminAdvertisements.js`)
    - GET `/api/admin/advertisements` - Get all advertisements with filtering
    - GET `/api/admin/advertisements/:id` - Get single ad with full details
    - PATCH `/api/admin/advertisements/:id/approve` - Approve advertisement
    - PATCH `/api/admin/advertisements/:id/reject` - Reject advertisement
    - PATCH `/api/admin/advertisements/:id` - Update advertisement details
    - DELETE `/api/admin/advertisements/:id` - Delete advertisement
    - GET `/api/admin/advertisements/statistics` - Get aggregate statistics
    - Use existing `adminOnly` middleware for authorization
    - Add Joi validation for admin actions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 4.14, 4.15, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 8.13, 8.14, 8.15, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14, 9.15, 9.16, 9.17, 9.18, 9.19, 9.20_
  
  - [ ] 3.3 Register routes in `backend/server.js`
    - Add `/api/advertisements` route
    - Add `/api/admin/advertisements` route
    - Ensure proper middleware order (auth, CSRF, rate limiting)
    - _Requirements: 9.1, 9.8, 9.14, 9.15_

- [ ]* 3.4 Write integration tests for advertisement routes
  - Test advertisement creation flow with authentication
  - Test file upload validation and storage
  - Test authorization (users can only access their own ads)
  - Test rate limiting on tracking endpoints
  - _Requirements: 1.1, 1.5, 9.1, 9.2, 9.14, 9.16, 10.10, 10.11_

- [ ]* 3.5 Write integration tests for admin routes
  - Test admin-only access control
  - Test advertisement approval workflow
  - Test advertisement rejection with reason
  - Test statistics aggregation
  - _Requirements: 4.1, 4.4, 4.10, 4.15, 8.1, 9.8, 9.15, 9.17_

- [ ] 4. Checkpoint - Ensure backend tests pass
  - Run all backend tests: `npm test` in backend directory
  - Verify database schema is created correctly
  - Test API endpoints manually using Postman or curl
  - Ensure all tests pass, ask the user if questions arise

- [ ] 5. Implement frontend customer interface
  - [ ] 5.1 Create AdvertisePage component (`frontend/src/components/AdvertisePage.js`)
    - Build advertisement submission form with fields: Shopier URL, brand name, Instagram handle, description
    - Add logo upload with preview (5MB limit, image types only)
    - Implement pricing tier selection (Başlangıç, Profesyonel, Premium)
    - Add form validation matching backend Joi schemas
    - Display success/error messages
    - Follow existing component patterns from `CustomDomainSitePage.js`
    - Use Framer Motion for animations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 13.1, 13.2, 13.3_
  
  - [ ] 5.2 Create CustomerAdsDashboard component (`frontend/src/components/CustomerAdsDashboard.js`)
    - Display list of user's advertisements with status badges
    - Show statistics: impressions, clicks, CTR percentage
    - Display remaining days for active ads
    - Show status-specific messages (pending, rejected, active, expired)
    - Implement auto-refresh every 30 seconds for active ads
    - Add hourly breakdown chart using Chart.js or similar
    - Follow existing dashboard patterns from `DashboardPage.js`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 13.4, 13.5, 13.6_
  
  - [ ] 5.3 Create AdStatisticsCard component (`frontend/src/components/AdStatisticsCard.js`)
    - Display total impressions, clicks, CTR
    - Show hourly breakdown chart
    - Handle zero impressions case (display 0% CTR)
    - Make responsive for mobile devices
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 13.5, 13.6, 13.9_

- [ ] 6. Implement frontend admin interface
  - [ ] 6.1 Create AdminAdvertisementsPage component (`frontend/src/components/AdminAdvertisementsPage.js`)
    - Display all advertisements in table format with pagination
    - Add status filter dropdown (all, pending, approved, rejected, active, expired)
    - Show advertisement details: brand name, customer email, status, dates, statistics
    - Implement approve/reject actions with modal dialogs
    - Add date picker for setting start/end dates on approval
    - Add placement position selector on approval
    - Add rejection reason textarea
    - Include delete confirmation dialog
    - Follow existing admin patterns from `AdminPasswordGate.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 4.14, 4.15, 13.7, 13.8_
  
  - [ ] 6.2 Create AdminAdStatisticsPage component (`frontend/src/components/AdminAdStatisticsPage.js`)
    - Display aggregate statistics: total impressions, clicks, average CTR
    - Show statistics grouped by pricing tier
    - Show statistics grouped by placement position
    - Display top 10 performing ads by CTR
    - Show revenue summary by pricing tier
    - Add date range filter
    - Display daily trend chart
    - Add CSV export button
    - Implement auto-refresh every 60 seconds
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 8.13, 8.14, 8.15_
  
  - [ ] 6.3 Create AdminAdApprovalModal component (`frontend/src/components/AdminAdApprovalModal.js`)
    - Date pickers for start and end dates
    - Placement position dropdown
    - Validation: start date before end date, start date not in past
    - Submit approval with selected parameters
    - _Requirements: 4.5, 4.6, 4.7, 10.13, 10.14, 10.17_

- [ ] 7. Implement advertisement display system
  - [ ] 7.1 Create AdDisplay component (`frontend/src/components/AdDisplay.js`)
    - Fetch active advertisement for specified placement position
    - Display logo (80px × 80px max) or default icon
    - Display brand name as clickable link
    - Display description (max 200 characters)
    - Display Instagram icon/link if handle provided
    - Display "Visit Store" CTA button
    - Open all links in new tab with `rel="noopener noreferrer"`
    - Make responsive for mobile, tablet, desktop
    - Hide container when no active ads
    - Implement 5-minute caching
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15, 13.8, 13.9, 13.10_
  
  - [ ] 7.2 Create useAdTracking hook (`frontend/src/hooks/useAdTracking.js`)
    - Implement Intersection Observer for impression tracking
    - Track when ad is visible for at least 1 second
    - Prevent duplicate impressions within 30 seconds using sessionStorage
    - Send POST request to `/api/advertisements/:id/impression`
    - Handle tracking failures gracefully
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.9_
  
  - [ ] 7.3 Implement click tracking in AdDisplay
    - Attach click handlers to all clickable elements
    - Track click type (brand-link, cta-button, instagram-link)
    - Send POST request to `/api/advertisements/:id/click`
    - Use sendBeacon API when available
    - Prevent duplicate clicks within 5 seconds using sessionStorage
    - Allow navigation even if tracking fails
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [ ] 7.4 Integrate AdDisplay into existing pages
    - Add AdDisplay to header (placement: "header-banner")
    - Add AdDisplay to hero section (placement: "hero-section")
    - Add AdDisplay to sidebar top (placement: "sidebar-top")
    - Add AdDisplay to sidebar bottom (placement: "sidebar-bottom")
    - Add AdDisplay to footer (placement: "footer-banner")
    - Ensure ads don't break existing layouts
    - _Requirements: 5.1, 5.2, 5.3, 5.14_

- [ ] 8. Implement payment integration
  - [ ] 8.1 Create payment routes (`backend/routes/advertisementPayments.js`)
    - POST `/api/advertisements/payment/initiate` - Initiate Shopier payment
    - POST `/api/advertisements/payment/callback` - Handle Shopier webhook
    - POST `/api/admin/advertisements/:id/mark-paid` - Admin manual payment confirmation
    - Implement Shopier payment gateway integration
    - Verify payment signatures
    - Update advertisement payment status
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.9, 11.12_
  
  - [ ] 8.2 Create PaymentPage component (`frontend/src/components/AdPaymentPage.js`)
    - Display payment options: Shopier gateway or manual bank transfer
    - Show pricing based on selected tier
    - Display bank account details for manual payment
    - Show unique payment reference number
    - Redirect to Shopier payment page when selected
    - Display payment confirmation after successful payment
    - _Requirements: 11.1, 11.2, 11.3, 11.7, 11.8, 11.13_
  
  - [ ] 8.3 Add payment status checks to approval workflow
    - Prevent advertisement approval if payment status is not "paid"
    - Display payment status in admin panel
    - Add "Mark as Paid" button for admin manual confirmation
    - _Requirements: 11.10, 11.9_

- [ ]* 8.4 Write integration tests for payment flow
  - Test Shopier payment initiation
  - Test webhook signature verification
  - Test payment status updates
  - Test admin manual payment confirmation
  - _Requirements: 11.4, 11.5, 11.6, 11.9, 11.12_

- [ ] 9. Checkpoint - Ensure frontend and payment integration work
  - Test advertisement submission flow end-to-end
  - Test payment flow with Shopier sandbox
  - Test admin approval workflow
  - Test ad display on various pages
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Implement email notifications
  - [ ] 10.1 Create email service (`backend/services/advertisementEmailService.js`)
    - Create email templates for: submission confirmation, approval, rejection, activation, expiration, renewal reminder, daily statistics
    - Use existing Nodemailer configuration
    - Implement email queue for asynchronous sending
    - Add retry logic (up to 3 attempts)
    - Include unsubscribe link in marketing emails
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13_
  
  - [ ] 10.2 Integrate email notifications into advertisement lifecycle
    - Send confirmation email on submission
    - Send approval email when admin approves
    - Send rejection email when admin rejects
    - Send activation email when ad becomes active
    - Send expiration email when ad expires
    - Send renewal reminder 7 days before expiration
    - Send admin notification on new submission
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.14_
  
  - [ ] 10.3 Create email preferences management
    - Add email preferences to user settings
    - Allow users to configure notification preferences
    - Store preferences in database
    - Respect preferences when sending emails
    - _Requirements: 12.15_

- [ ]* 10.4 Write unit tests for email service
  - Test email template rendering
  - Test email queue functionality
  - Test retry logic
  - Test preference handling
  - _Requirements: 12.11, 12.12_

- [ ] 11. Implement background jobs and automation
  - [ ] 11.1 Create advertisement status updater job (`backend/services/advertisementStatusUpdater.js`)
    - Implement cron job to run every 5 minutes
    - Call `updateExpiredAds()` to expire active ads past end date
    - Call `activateApprovedAds()` to activate approved ads that reached start date
    - Log status changes
    - _Requirements: 4.8, 4.9_
  
  - [ ] 11.2 Create tracking data cleanup job (`backend/services/advertisementTrackingCleanup.js`)
    - Implement daily cron job
    - Call `cleanupOldTracking()` to remove tracking data older than 7 days
    - Log cleanup statistics
    - _Requirements: 6.9, 14.7_
  
  - [ ] 11.3 Create unpaid advertisement expiration job (`backend/services/unpaidAdExpiration.js`)
    - Implement daily cron job
    - Expire advertisements with status "pending" and payment_status "unpaid" older than 7 days
    - Send payment reminder email 3 days after submission
    - _Requirements: 11.14, 11.15_
  
  - [ ] 11.4 Register cron jobs in server startup
    - Use node-cron or similar library
    - Register all background jobs
    - Add error handling and logging
    - _Requirements: 4.8, 4.9, 11.14, 14.7_

- [ ] 12. Implement security and validation enhancements
  - [ ] 12.1 Add input sanitization middleware
    - Sanitize HTML tags from all text inputs
    - Validate Shopier URL format
    - Validate Instagram handle format
    - Implement character limits on all fields
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.19_
  
  - [ ] 12.2 Enhance file upload security
    - Validate file size (5MB limit)
    - Validate MIME type, not just extension
    - Prevent path traversal attacks
    - Generate unique filenames using UUID
    - _Requirements: 10.6, 10.7, 10.8, 10.9_
  
  - [ ] 12.3 Add rate limiting configuration
    - Configure rate limiter for impression tracking: 100 req/min per IP
    - Configure rate limiter for click tracking: 100 req/min per IP
    - Configure rate limiter for ad creation: 5 ads per user per day
    - Add to `backend/middleware/rateLimiters.js`
    - _Requirements: 10.11, 10.12_
  
  - [ ] 12.4 Add admin action logging
    - Log all admin actions (approve, reject, delete) with timestamp and admin user ID
    - Create `admin_action_logs` table
    - Implement logging middleware
    - _Requirements: 10.16_

- [ ] 13. Implement performance optimizations
  - [ ] 13.1 Add caching layer for active advertisements
    - Implement in-memory cache with 5-minute TTL
    - Cache active ads by placement position
    - Invalidate cache on ad status changes
    - _Requirements: 5.15, 14.1_
  
  - [ ] 13.2 Optimize database queries
    - Verify all indexes are created correctly
    - Use connection pooling (max 20 connections)
    - Implement query timeout (5 seconds)
    - Add query performance monitoring
    - _Requirements: 14.2, 14.8, 14.13, 14.14_
  
  - [ ] 13.3 Optimize image handling
    - Compress uploaded logos to max 200KB
    - Serve images with cache headers (24 hours)
    - Implement lazy loading for ad images
    - _Requirements: 14.3, 14.4, 14.5, 14.11_
  
  - [ ] 13.4 Implement pagination
    - Add pagination to admin advertisement list (50 items per page)
    - Add pagination to customer dashboard (20 items per page)
    - _Requirements: 14.9, 14.10_

- [ ] 14. Add mobile responsiveness enhancements
  - [ ] 14.1 Optimize AdvertisePage for mobile
    - Stack form fields vertically on screens < 768px
    - Increase touch target size to 44px × 44px minimum
    - Use mobile-friendly font sizes (16px minimum)
    - _Requirements: 13.1, 13.2, 13.3, 13.10_
  
  - [ ] 14.2 Optimize CustomerAdsDashboard for mobile
    - Display statistics in card layout on mobile
    - Hide hourly breakdown chart on screens < 640px
    - Display simplified statistics table
    - _Requirements: 13.4, 13.5, 13.6_
  
  - [ ] 14.3 Optimize AdminAdvertisementsPage for mobile
    - Add horizontal scrolling for table on mobile
    - Optimize modal dialogs for small screens
    - _Requirements: 13.7_
  
  - [ ] 14.4 Test responsive design across devices
    - Test on iOS Safari, Chrome Mobile, Samsung Internet
    - Test on screens as small as 320px width
    - Verify touch-friendly gestures work
    - _Requirements: 13.13, 13.14, 13.15_

- [ ] 15. Implement analytics and reporting
  - [ ] 15.1 Create reporting service (`backend/services/advertisementReportingService.js`)
    - Generate monthly revenue report by pricing tier
    - Generate monthly performance report (impressions, clicks, CTR)
    - Generate customer acquisition report
    - Generate retention report (renewal rate)
    - Generate placement performance report
    - Calculate conversion rate (approved/submitted)
    - Calculate average time from submission to approval
    - Calculate average advertisement duration
    - Track renewal rate
    - Generate revenue forecast
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.7, 15.8, 15.9, 15.10, 15.11, 15.12, 15.13, 15.15_
  
  - [ ] 15.2 Add report export functionality
    - Export reports to CSV format
    - Export reports to PDF format
    - Add export buttons to admin statistics page
    - _Requirements: 15.6_
  
  - [ ] 15.3 Implement automated weekly reports
    - Create scheduled email report job
    - Allow admin to configure report recipients
    - Send weekly summary via email
    - _Requirements: 15.14_

- [ ] 16. Final integration and testing
  - [ ] 16.1 Add routes to App.js
    - Add `/advertise` route for AdvertisePage
    - Add `/dashboard/ads` route for CustomerAdsDashboard
    - Add `/admin/advertisements` route for AdminAdvertisementsPage
    - Add `/admin/advertisements/statistics` route for AdminAdStatisticsPage
    - Add `/advertisements/payment/:id` route for AdPaymentPage
    - Ensure proper authentication and authorization
    - _Requirements: 1.1, 3.1, 4.1, 8.1_
  
  - [ ] 16.2 Update navigation menus
    - Add "Advertise" link to main navigation
    - Add "My Ads" link to user dashboard menu
    - Add "Advertisements" link to admin menu
    - Add "Ad Statistics" link to admin menu
    - _Requirements: 1.1, 3.1, 4.1, 8.1_
  
  - [ ] 16.3 Create API documentation
    - Document all API endpoints with request/response examples
    - Document authentication requirements
    - Document rate limiting rules
    - Document error codes and messages
    - _Requirements: 9.1-9.20_

- [ ]* 16.4 Write end-to-end tests
  - Test complete advertisement submission and approval flow
  - Test payment integration flow
  - Test ad display and tracking flow
  - Test admin management flow
  - Test email notification flow
  - _Requirements: All requirements_

- [ ] 17. Final checkpoint - Complete system verification
  - Run all tests (unit, integration, e2e)
  - Verify all features work as expected
  - Test on multiple browsers and devices
  - Check performance metrics
  - Verify security measures are in place
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows existing codebase patterns for consistency
- Security and performance are built into each phase, not added as afterthoughts
- Mobile responsiveness is considered throughout the implementation
- Background jobs ensure automated maintenance and status updates
