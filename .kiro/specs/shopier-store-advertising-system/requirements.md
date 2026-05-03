FFF# Requirements Document

## Introduction

This document defines the requirements for a comprehensive advertising management system that enables Shopier store owners to purchase and manage advertisements on the Odelink platform. The system includes customer-facing features for ad submission and statistics viewing, admin features for ad approval and management, and a dynamic ad display system with real-time analytics tracking.

## Glossary

- **Advertisement**: A promotional listing for a Shopier store that includes brand name, store URL, description, Instagram handle, and optional logo
- **Ad_System**: The complete advertising management platform including customer dashboard, admin panel, and display components
- **Customer**: A Shopier store owner who purchases advertising space on Odelink
- **Admin**: Platform administrator who approves, manages, and configures advertisements
- **Impression**: A single view of an advertisement by a visitor
- **Click**: A user interaction where a visitor clicks on an advertisement
- **CTR**: Click-Through Rate, calculated as (clicks / impressions) × 100
- **Ad_Placement**: The specific location where an advertisement is displayed (header, hero, sidebar, etc.)
- **Ad_Status**: The current state of an advertisement (pending, approved, rejected, active, expired)
- **Pricing_Tier**: One of three subscription levels (Başlangıç, Profesyonel, Premium) with different pricing and features
- **Analytics_Service**: The backend service responsible for tracking and aggregating ad statistics
- **Advertisement_Model**: MongoDB schema for storing advertisement data
- **AdStatistics_Model**: MongoDB schema for storing impression and click data

## Requirements

### Requirement 1: Advertisement Submission

**User Story:** As a Shopier store owner, I want to submit my store for advertising, so that I can promote my products to Odelink visitors

#### Acceptance Criteria

1. WHEN a customer accesses the /advertise page, THE Ad_System SHALL display an advertisement submission form
2. THE Ad_System SHALL require the following fields: Shopier store URL, brand name, Instagram handle, description
3. THE Ad_System SHALL allow optional logo upload with file size limit of 5MB
4. THE Ad_System SHALL validate Shopier store URL format matches pattern: https?://.*shopier\.com/.*
5. WHEN a customer submits the form, THE Ad_System SHALL create an Advertisement record with status "pending"
6. WHEN logo upload is provided, THE Ad_System SHALL store the file in backend/uploads/logos directory
7. THE Ad_System SHALL validate logo file type is one of: PNG, JPG, JPEG, SVG
8. WHEN submission is successful, THE Ad_System SHALL display a confirmation message
9. THE Ad_System SHALL associate the Advertisement with the authenticated user ID
10. THE Ad_System SHALL record the selected pricing tier (Başlangıç, Profesyonel, Premium) with the Advertisement

### Requirement 2: Advertisement Database Schema

**User Story:** As a developer, I want a robust database schema for advertisements, so that all ad data is stored consistently and efficiently

#### Acceptance Criteria

1. THE Advertisement_Model SHALL include fields: id (UUID), userId (UUID reference), shopierUrl (String), brandName (String), instagramHandle (String), description (String), logoUrl (String), pricingTier (String), status (String), startDate (Date), endDate (Date), placementPosition (String), createdAt (Date), updatedAt (Date)
2. THE Advertisement_Model SHALL enforce status values: pending, approved, rejected, active, expired
3. THE Advertisement_Model SHALL enforce pricingTier values: baslangic, profesyonel, premium
4. THE Advertisement_Model SHALL create an index on userId for efficient user queries
5. THE Advertisement_Model SHALL create an index on status for efficient filtering
6. THE Advertisement_Model SHALL create a compound index on (status, startDate, endDate) for active ad queries
7. THE AdStatistics_Model SHALL include fields: id (UUID), advertisementId (UUID reference), impressions (Number), clicks (Number), hourlyBreakdown (Array), lastUpdated (Date)
8. THE AdStatistics_Model SHALL initialize impressions and clicks to 0 when created
9. THE AdStatistics_Model SHALL store hourlyBreakdown as array of objects with structure: { hour: String, impressions: Number, clicks: Number }
10. THE Advertisement_Model SHALL validate shopierUrl matches Shopier domain pattern

### Requirement 3: Customer Dashboard

**User Story:** As a customer, I want to view my advertisement statistics, so that I can measure the effectiveness of my investment

#### Acceptance Criteria

1. WHEN an authenticated customer accesses /dashboard/ads, THE Ad_System SHALL display all advertisements owned by that customer
2. THE Ad_System SHALL display for each advertisement: brand name, status, start date, end date, total impressions, total clicks, CTR percentage
3. WHEN an advertisement has status "active", THE Ad_System SHALL display real-time statistics updated every 30 seconds
4. THE Ad_System SHALL calculate CTR as (clicks / impressions) × 100, displaying 0% when impressions is 0
5. THE Ad_System SHALL display hourly breakdown chart showing impressions and clicks per hour for the last 24 hours
6. WHEN an advertisement has status "pending", THE Ad_System SHALL display "Awaiting Approval" message
7. WHEN an advertisement has status "rejected", THE Ad_System SHALL display rejection reason if provided
8. THE Ad_System SHALL display remaining days until expiration for active advertisements
9. THE Ad_System SHALL allow customers to view only their own advertisements
10. THE Ad_System SHALL display advertisements in descending order by creation date

### Requirement 4: Admin Advertisement Management

**User Story:** As an admin, I want to manage all advertisements, so that I can maintain quality control and optimize ad placements

#### Acceptance Criteria

1. WHEN an admin accesses /admin/advertisements, THE Ad_System SHALL display all advertisements regardless of owner
2. THE Ad_System SHALL allow admin to filter advertisements by status: all, pending, approved, rejected, active, expired
3. WHEN admin selects an advertisement, THE Ad_System SHALL display full details including customer email and phone
4. THE Ad_System SHALL allow admin to approve pending advertisements
5. WHEN admin approves an advertisement, THE Ad_System SHALL require setting start date and end date
6. WHEN admin approves an advertisement, THE Ad_System SHALL require selecting placement position from: header-banner, hero-section, sidebar-top, sidebar-bottom, footer-banner
7. WHEN admin approves an advertisement, THE Ad_System SHALL update status to "approved"
8. WHEN current date is between start date and end date for approved advertisement, THE Ad_System SHALL automatically update status to "active"
9. WHEN current date exceeds end date for active advertisement, THE Ad_System SHALL automatically update status to "expired"
10. THE Ad_System SHALL allow admin to reject pending advertisements with optional rejection reason
11. WHEN admin rejects an advertisement, THE Ad_System SHALL update status to "rejected" and store rejection reason
12. THE Ad_System SHALL allow admin to edit start date, end date, and placement position for approved advertisements
13. THE Ad_System SHALL display total impressions and clicks for each advertisement in admin view
14. THE Ad_System SHALL allow admin to delete advertisements with confirmation dialog
15. THE Ad_System SHALL restrict advertisement management to users with admin privileges

### Requirement 5: Advertisement Display System

**User Story:** As a visitor, I want to see relevant store advertisements, so that I can discover new products and stores

#### Acceptance Criteria

1. WHEN a visitor views any Odelink page, THE Ad_System SHALL check for active advertisements
2. THE Ad_System SHALL display advertisements where status is "active" and current date is between startDate and endDate
3. WHEN multiple advertisements exist for same placement position, THE Ad_System SHALL rotate them using round-robin algorithm
4. THE Ad_System SHALL display advertisement with format: [LOGO] Brand Name - Shopier Store
5. WHEN logo is provided, THE Ad_System SHALL display logo image with maximum dimensions 80px × 80px
6. WHEN logo is not provided, THE Ad_System SHALL display default store icon
7. THE Ad_System SHALL display brand name as clickable link to Shopier store URL
8. THE Ad_System SHALL display description text with maximum 200 characters
9. WHEN Instagram handle is provided, THE Ad_System SHALL display Instagram icon linking to instagram.com/{handle}
10. THE Ad_System SHALL display "Visit Store" CTA button linking to Shopier store URL
11. THE Ad_System SHALL open all advertisement links in new browser tab (target="_blank")
12. THE Ad_System SHALL apply rel="noopener noreferrer" to all external links for security
13. THE Ad_System SHALL render advertisements responsive for mobile, tablet, and desktop viewports
14. WHEN no active advertisements exist for a placement position, THE Ad_System SHALL hide that ad container
15. THE Ad_System SHALL cache active advertisements for 5 minutes to reduce database queries

### Requirement 6: Impression Tracking

**User Story:** As the system, I want to track advertisement impressions accurately, so that customers can see how many times their ads were viewed

#### Acceptance Criteria

1. WHEN an advertisement is rendered in the viewport, THE Analytics_Service SHALL record one impression
2. THE Analytics_Service SHALL use Intersection Observer API to detect when advertisement enters viewport
3. THE Analytics_Service SHALL record impression only when advertisement is visible for at least 1 second
4. THE Analytics_Service SHALL prevent duplicate impressions from same visitor within 30-second window using session storage
5. WHEN impression is recorded, THE Analytics_Service SHALL send POST request to /api/advertisements/:id/impression
6. THE Analytics_Service SHALL increment impressions count in AdStatistics_Model by 1
7. THE Analytics_Service SHALL update hourly breakdown by incrementing impression count for current hour
8. WHEN hourly breakdown does not have entry for current hour, THE Analytics_Service SHALL create new entry with structure: { hour: "YYYY-MM-DD HH:00", impressions: 1, clicks: 0 }
9. THE Analytics_Service SHALL handle impression tracking failures gracefully without blocking page render
10. THE Analytics_Service SHALL batch impression updates when multiple ads are visible simultaneously

### Requirement 7: Click Tracking

**User Story:** As the system, I want to track advertisement clicks accurately, so that customers can measure engagement with their ads

#### Acceptance Criteria

1. WHEN a visitor clicks on any advertisement link or CTA button, THE Analytics_Service SHALL record one click
2. THE Analytics_Service SHALL attach click tracking to all clickable elements: brand name link, CTA button, Instagram link
3. WHEN click is recorded, THE Analytics_Service SHALL send POST request to /api/advertisements/:id/click
4. THE Analytics_Service SHALL increment clicks count in AdStatistics_Model by 1
5. THE Analytics_Service SHALL update hourly breakdown by incrementing click count for current hour
6. WHEN hourly breakdown does not have entry for current hour, THE Analytics_Service SHALL create new entry with structure: { hour: "YYYY-MM-DD HH:00", impressions: 0, clicks: 1 }
7. THE Analytics_Service SHALL allow navigation to target URL even if tracking request fails
8. THE Analytics_Service SHALL use sendBeacon API when available for reliable tracking during page unload
9. THE Analytics_Service SHALL prevent duplicate click tracking from same visitor within 5-second window using session storage
10. THE Analytics_Service SHALL track which specific element was clicked (brand-link, cta-button, instagram-link) for detailed analytics

### Requirement 8: Admin Statistics Dashboard

**User Story:** As an admin, I want to view comprehensive statistics for all advertisements, so that I can optimize ad placements and pricing

#### Acceptance Criteria

1. WHEN admin accesses /admin/advertisements/statistics, THE Ad_System SHALL display aggregate statistics for all advertisements
2. THE Ad_System SHALL display total impressions across all active advertisements
3. THE Ad_System SHALL display total clicks across all active advertisements
4. THE Ad_System SHALL display average CTR across all active advertisements
5. THE Ad_System SHALL display statistics grouped by pricing tier showing: tier name, total ads, total impressions, total clicks, average CTR
6. THE Ad_System SHALL display statistics grouped by placement position showing: position name, total ads, total impressions, total clicks, average CTR
7. THE Ad_System SHALL display top 10 performing advertisements ranked by CTR
8. THE Ad_System SHALL display revenue summary showing: total active ads, revenue by pricing tier (Başlangıç: ₺500, Profesyonel: ₺1,200, Premium: ₺2,500)
9. THE Ad_System SHALL allow admin to filter statistics by date range
10. THE Ad_System SHALL display daily trend chart showing impressions and clicks over selected date range
11. THE Ad_System SHALL calculate projected monthly revenue based on active advertisements
12. THE Ad_System SHALL display average ad duration in days
13. THE Ad_System SHALL export statistics to CSV format when admin clicks export button
14. THE Ad_System SHALL refresh statistics automatically every 60 seconds
15. THE Ad_System SHALL restrict statistics dashboard to users with admin privileges

### Requirement 9: API Endpoints

**User Story:** As a developer, I want well-defined API endpoints, so that frontend and backend communicate reliably

#### Acceptance Criteria

1. THE Ad_System SHALL provide POST /api/advertisements endpoint for creating new advertisements
2. THE Ad_System SHALL provide GET /api/advertisements/my endpoint for retrieving customer's own advertisements
3. THE Ad_System SHALL provide GET /api/advertisements/:id endpoint for retrieving single advertisement details
4. THE Ad_System SHALL provide GET /api/advertisements/active endpoint for retrieving all active advertisements
5. THE Ad_System SHALL provide POST /api/advertisements/:id/impression endpoint for recording impressions
6. THE Ad_System SHALL provide POST /api/advertisements/:id/click endpoint for recording clicks
7. THE Ad_System SHALL provide GET /api/advertisements/:id/statistics endpoint for retrieving advertisement statistics
8. THE Ad_System SHALL provide GET /api/admin/advertisements endpoint for admin to retrieve all advertisements
9. THE Ad_System SHALL provide PATCH /api/admin/advertisements/:id/approve endpoint for admin to approve advertisements
10. THE Ad_System SHALL provide PATCH /api/admin/advertisements/:id/reject endpoint for admin to reject advertisements
11. THE Ad_System SHALL provide PATCH /api/admin/advertisements/:id endpoint for admin to update advertisement details
12. THE Ad_System SHALL provide DELETE /api/admin/advertisements/:id endpoint for admin to delete advertisements
13. THE Ad_System SHALL provide GET /api/admin/advertisements/statistics endpoint for admin statistics dashboard
14. THE Ad_System SHALL require authentication for all endpoints except /api/advertisements/active
15. THE Ad_System SHALL require admin privileges for all /api/admin/* endpoints
16. THE Ad_System SHALL return 401 status code when authentication fails
17. THE Ad_System SHALL return 403 status code when authorization fails
18. THE Ad_System SHALL return 404 status code when advertisement is not found
19. THE Ad_System SHALL return 400 status code when request validation fails
20. THE Ad_System SHALL return 500 status code when server error occurs

### Requirement 10: Security and Validation

**User Story:** As a security-conscious developer, I want robust input validation and access control, so that the system is protected from malicious actors

#### Acceptance Criteria

1. THE Ad_System SHALL validate all user inputs against XSS attacks by sanitizing HTML tags
2. THE Ad_System SHALL validate Shopier URL format before storing in database
3. THE Ad_System SHALL validate Instagram handle contains only alphanumeric characters, underscores, and periods
4. THE Ad_System SHALL limit description field to 500 characters maximum
5. THE Ad_System SHALL limit brand name field to 100 characters maximum
6. THE Ad_System SHALL validate logo file size does not exceed 5MB
7. THE Ad_System SHALL validate logo file type using MIME type checking, not just file extension
8. THE Ad_System SHALL prevent path traversal attacks in logo file uploads
9. THE Ad_System SHALL generate unique filenames for uploaded logos using UUID
10. THE Ad_System SHALL verify authenticated user owns advertisement before allowing updates or deletions
11. THE Ad_System SHALL implement rate limiting on impression and click tracking endpoints: maximum 100 requests per minute per IP
12. THE Ad_System SHALL implement rate limiting on advertisement creation: maximum 5 advertisements per user per day
13. THE Ad_System SHALL validate date ranges ensuring startDate is before endDate
14. THE Ad_System SHALL validate startDate is not in the past when admin approves advertisement
15. THE Ad_System SHALL prevent SQL injection by using parameterized queries for all database operations
16. THE Ad_System SHALL log all admin actions (approve, reject, delete) with timestamp and admin user ID
17. THE Ad_System SHALL validate placement position is one of allowed values before saving
18. THE Ad_System SHALL validate pricing tier is one of allowed values before saving
19. THE Ad_System SHALL sanitize all text fields before rendering in HTML to prevent XSS
20. THE Ad_System SHALL use HTTPS for all API requests in production environment

### Requirement 11: Payment Integration

**User Story:** As a customer, I want to pay for my advertisement, so that my ad can be activated

#### Acceptance Criteria

1. WHEN customer submits advertisement, THE Ad_System SHALL display payment options: Shopier payment gateway or manual bank transfer
2. WHEN customer selects Shopier payment, THE Ad_System SHALL redirect to Shopier payment page with correct amount based on pricing tier
3. THE Ad_System SHALL map pricing tiers to amounts: Başlangıç = 500 TRY, Profesyonel = 1200 TRY, Premium = 2500 TRY
4. WHEN Shopier payment is completed, THE Ad_System SHALL receive webhook notification at /api/advertisements/payment/callback
5. WHEN payment webhook is received, THE Ad_System SHALL verify payment signature using Shopier API credentials
6. WHEN payment is verified, THE Ad_System SHALL update advertisement payment status to "paid"
7. WHEN customer selects manual payment, THE Ad_System SHALL display bank account details and reference number
8. THE Ad_System SHALL generate unique payment reference number for each advertisement
9. THE Ad_System SHALL allow admin to manually mark advertisement as paid after verifying bank transfer
10. THE Ad_System SHALL prevent advertisement approval until payment status is "paid"
11. THE Ad_System SHALL send email confirmation to customer when payment is received
12. THE Ad_System SHALL store payment transaction details: payment method, transaction ID, amount, payment date
13. WHEN payment fails, THE Ad_System SHALL display error message and allow customer to retry
14. THE Ad_System SHALL expire unpaid advertisements after 7 days
15. THE Ad_System SHALL send payment reminder email to customer 3 days after submission if still unpaid

### Requirement 12: Email Notifications

**User Story:** As a customer, I want to receive email notifications about my advertisement status, so that I stay informed about the approval process

#### Acceptance Criteria

1. WHEN customer submits advertisement, THE Ad_System SHALL send confirmation email with submission details
2. WHEN admin approves advertisement, THE Ad_System SHALL send approval email to customer with start date and end date
3. WHEN admin rejects advertisement, THE Ad_System SHALL send rejection email to customer with rejection reason
4. WHEN advertisement becomes active, THE Ad_System SHALL send activation email to customer
5. WHEN advertisement expires, THE Ad_System SHALL send expiration email to customer
6. WHEN advertisement is 7 days from expiration, THE Ad_System SHALL send renewal reminder email to customer
7. THE Ad_System SHALL send daily statistics summary email to customer for active advertisements
8. THE Ad_System SHALL include unsubscribe link in all marketing emails
9. THE Ad_System SHALL use email templates with Odelink branding
10. THE Ad_System SHALL send emails from noreply@odelink.shop address
11. WHEN email sending fails, THE Ad_System SHALL log error and retry up to 3 times
12. THE Ad_System SHALL queue emails for asynchronous sending to avoid blocking API responses
13. THE Ad_System SHALL include advertisement details in all notification emails: brand name, pricing tier, dates
14. THE Ad_System SHALL send admin notification email when new advertisement is submitted
15. THE Ad_System SHALL allow customers to configure email notification preferences in dashboard

### Requirement 13: Mobile Responsiveness

**User Story:** As a mobile user, I want the advertising system to work seamlessly on my device, so that I can manage ads on the go

#### Acceptance Criteria

1. WHEN customer accesses /advertise on mobile device, THE Ad_System SHALL display mobile-optimized submission form
2. THE Ad_System SHALL stack form fields vertically on screens smaller than 768px width
3. THE Ad_System SHALL increase touch target size to minimum 44px × 44px for all buttons on mobile
4. WHEN customer accesses dashboard on mobile, THE Ad_System SHALL display statistics in card layout
5. THE Ad_System SHALL hide hourly breakdown chart on screens smaller than 640px width
6. THE Ad_System SHALL display simplified statistics table on mobile: impressions, clicks, CTR only
7. WHEN admin accesses admin panel on mobile, THE Ad_System SHALL display horizontal scrolling table for advertisement list
8. THE Ad_System SHALL render advertisement display components responsive across all viewport sizes
9. THE Ad_System SHALL scale logo images proportionally on mobile devices
10. THE Ad_System SHALL use mobile-friendly font sizes: minimum 16px for body text
11. THE Ad_System SHALL optimize image loading on mobile using lazy loading
12. THE Ad_System SHALL reduce animation complexity on mobile devices for better performance
13. THE Ad_System SHALL test responsive design on iOS Safari, Chrome Mobile, and Samsung Internet browsers
14. THE Ad_System SHALL maintain functionality on devices with screen width as small as 320px
15. THE Ad_System SHALL use touch-friendly gestures for interactive elements on mobile

### Requirement 14: Performance Optimization

**User Story:** As a developer, I want the advertising system to perform efficiently, so that page load times remain fast

#### Acceptance Criteria

1. THE Ad_System SHALL cache active advertisements in memory for 5 minutes
2. THE Ad_System SHALL use database indexes on frequently queried fields: status, userId, startDate, endDate
3. THE Ad_System SHALL lazy load advertisement images using Intersection Observer API
4. THE Ad_System SHALL compress uploaded logo images to maximum 200KB file size
5. THE Ad_System SHALL serve logo images with appropriate cache headers: max-age=86400 (24 hours)
6. THE Ad_System SHALL batch statistics updates using aggregation pipeline instead of individual updates
7. THE Ad_System SHALL limit hourly breakdown storage to last 30 days to prevent unbounded growth
8. THE Ad_System SHALL use connection pooling for database connections with maximum 20 connections
9. THE Ad_System SHALL implement pagination for admin advertisement list: 50 items per page
10. THE Ad_System SHALL implement pagination for customer dashboard: 20 items per page
11. THE Ad_System SHALL use CDN for serving static advertisement assets in production
12. THE Ad_System SHALL minify and bundle JavaScript files for advertisement display components
13. THE Ad_System SHALL implement database query timeout of 5 seconds to prevent long-running queries
14. THE Ad_System SHALL monitor API endpoint response times and log warnings when exceeding 500ms
15. THE Ad_System SHALL use asynchronous processing for non-critical operations: email sending, statistics aggregation

### Requirement 15: Analytics and Reporting

**User Story:** As an admin, I want detailed analytics reports, so that I can make data-driven decisions about advertising strategy

#### Acceptance Criteria

1. THE Ad_System SHALL generate monthly revenue report showing total revenue by pricing tier
2. THE Ad_System SHALL generate monthly performance report showing total impressions, clicks, and average CTR
3. THE Ad_System SHALL generate customer acquisition report showing new customers per month
4. THE Ad_System SHALL generate retention report showing percentage of customers who renew advertisements
5. THE Ad_System SHALL generate placement performance report comparing CTR across different placement positions
6. THE Ad_System SHALL allow admin to export reports in CSV and PDF formats
7. THE Ad_System SHALL display year-over-year comparison for key metrics
8. THE Ad_System SHALL calculate conversion rate: (approved ads / submitted ads) × 100
9. THE Ad_System SHALL display average time from submission to approval
10. THE Ad_System SHALL display average advertisement duration in days
11. THE Ad_System SHALL identify top performing advertisements by CTR for each pricing tier
12. THE Ad_System SHALL track advertisement renewal rate: (renewed ads / expired ads) × 100
13. THE Ad_System SHALL display revenue forecast based on current active advertisements and historical renewal rates
14. THE Ad_System SHALL allow admin to schedule automated weekly reports via email
15. THE Ad_System SHALL store historical statistics for trend analysis over time
