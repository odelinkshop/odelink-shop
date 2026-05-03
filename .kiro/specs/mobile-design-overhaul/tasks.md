# Implementation Plan: Mobile Design Overhaul

## Overview

This implementation plan breaks down the mobile design system into discrete, incremental coding tasks. Each task builds on previous steps, starting with design tokens and base components, progressing through page-specific optimizations, and ending with comprehensive testing. The approach ensures early validation of core functionality through automated tests.

## Tasks

- [x] 1. Set up design tokens and Tailwind CSS configuration
  - Create `frontend/src/styles/designTokens.js` with all design token definitions (typography, spacing, colors, breakpoints, shadows)
  - Update `frontend/tailwind.config.js` to extend Tailwind with custom design tokens
  - Create `frontend/src/styles/globals.css` with CSS custom properties for colors and spacing
  - Configure mobile-first breakpoints: 320px (base), 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
  - Set up viewport meta tag in `frontend/public/index.html` with width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1
  - _Requirements: 16.1, 16.2, 16.3, 18.1, 18.2, 18.3, 18.4, 19.1, 19.2, 19.3, 19.4_

- [ ]* 1.1 Write property tests for design tokens
  - **Property 2: Typography Scale Consistency** - Verify all heading levels match defined sizes (h1=32px, h2=28px, h3=24px, h4=20px, h5=18px, h6=16px, body=16px, small=14px, caption=12px)
  - **Property 13: Breakpoint Media Query Activation** - Verify media queries apply at correct viewport widths
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 16.1, 16.2, 16.3_

- [ ] 2. Create base component library - Typography
  - Create `frontend/src/components/ui/Typography.jsx` with variants: h1, h2, h3, h4, h5, h6, body, small, caption
  - Implement responsive font sizes using Tailwind breakpoints (e.g., text-2xl sm:text-3xl md:text-4xl)
  - Apply correct font weights (headings=600-700, body=400, emphasis=600)
  - Add letter-spacing: -0.025em for headings
  - Set line-height: 1.6 for body text
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ]* 2.1 Write unit tests for Typography component
  - Test each variant renders with correct font size
  - Test font weights are applied correctly
  - Test line-height is correct for body text
  - Test letter-spacing for headings
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Create base component library - Button
  - Create `frontend/src/components/ui/Button.jsx` with variants: primary, secondary, outline
  - Implement sizes: sm (40px), md (48px), lg (56px) with minimum height enforcement
  - Apply 14px padding with 12px border-radius
  - Add 0.2s transition for tap feedback
  - Disable hover effects on mobile, use active/focus states
  - Implement full-width option for mobile
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]* 3.1 Write property tests for Button component
  - **Property 1: Touch Target Minimum Size** - Verify all buttons have minimum 48x48px dimensions
  - **Property 15: Touch Feedback Transition** - Verify 0.2s transition occurs on tap without layout shift
  - **Validates: Requirements 3.1, 3.2, 3.4_

- [ ]* 3.2 Write unit tests for Button component
  - Test button renders with correct minimum height (48px)
  - Test padding is applied correctly (14px)
  - Test border-radius is 12px
  - Test all variants render correctly
  - Test disabled state
  - Test full-width option
  - _Requirements: 3.1, 3.2_

- [ ] 4. Create base component library - Form Input
  - Create `frontend/src/components/ui/FormInput.jsx` with label, error, and input elements
  - Set font size to 16px to prevent iOS auto-zoom
  - Apply 14px padding with 12px border-radius and 2px border
  - Position labels above inputs with 8px spacing
  - Show error messages below inputs with 12px font size
  - Enforce 48px minimum height
  - Add focus ring styling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 4.1 Write property tests for FormInput component
  - **Property 5: Form Input Accessibility** - Verify label is connected via for/id and input has 48px minimum height
  - **Validates: Requirements 4.1, 4.2, 4.3, 15.3_

- [ ]* 4.2 Write unit tests for FormInput component
  - Test input has 16px font size
  - Test input has 48px minimum height
  - Test label is associated with input via for/id
  - Test error message displays below input
  - Test error styling is applied
  - Test padding is 14px
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Create base component library - Card
  - Create `frontend/src/components/ui/Card.jsx` with 20px padding and 16px border-radius
  - Apply subtle shadow: 0 4px 6px rgba(0,0,0,0.1)
  - Create `CardGrid.jsx` component for responsive grid layout
  - Implement single-column on mobile, 2-3 columns on larger screens
  - Add 12px gap between cards
  - Ensure images don't exceed container width
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ]* 5.1 Write unit tests for Card component
  - Test card has 20px padding
  - Test border-radius is 16px
  - Test shadow is applied
  - Test CardGrid renders correct number of columns
  - Test gap between cards is 12px
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 6. Create responsive image component
  - Create `frontend/src/components/ui/ResponsiveImage.jsx` with srcset support
  - Implement lazy loading for below-the-fold images
  - Add aspect ratio preservation (16:9, 4:3, 1:1)
  - Constrain images to 100% viewport width
  - Add placeholder color while loading
  - Implement low-quality image placeholder (LQIP) support
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 6.1 Write property tests for ResponsiveImage component
  - **Property 4: Image Aspect Ratio Preservation** - Verify rendered image maintains specified aspect ratio
  - **Property 11: Responsive Image Srcset** - Verify browser selects appropriate image size based on viewport
  - **Property 12: Loading State Placeholder** - Verify placeholder displays before full image loads
  - **Validates: Requirements 7.2, 7.3, 7.4, 7.5_

- [ ]* 6.2 Write unit tests for ResponsiveImage component
  - Test image has lazy loading attribute
  - Test srcset is generated correctly
  - Test aspect ratio is maintained
  - Test placeholder displays
  - Test image doesn't exceed container width
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7. Create mobile navigation component
  - Create `frontend/src/components/ui/MobileNav.jsx` with hamburger menu
  - Implement 24x24px hamburger icon
  - Create full-screen overlay menu with vertical menu items
  - Apply 16px font size for menu items with 12px padding
  - Maintain 56px fixed header height
  - Prevent body scroll when menu is open (overflow:hidden)
  - Auto-close menu on link click
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 7.1 Write property tests for MobileNav component
  - **Property 7: Navigation Menu State Synchronization** - Verify body scroll is prevented when menu opens and restored when closes
  - **Validates: Requirements 5.5, 5.7_

- [ ]* 7.2 Write unit tests for MobileNav component
  - Test hamburger icon is 24x24px
  - Test menu opens on hamburger click
  - Test menu closes on link click
  - Test body overflow is hidden when menu open
  - Test menu items have correct font size and padding
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Create modal component
  - Create `frontend/src/components/ui/Modal.jsx` with full-screen/near-full-screen layout
  - Implement 90vw maximum width on mobile
  - Add 16px padding with 12px border-radius
  - Include 24x24px close button in top-right corner
  - Make content scrollable if exceeds viewport height
  - Prevent body scroll when modal is open
  - Stack buttons vertically with full width
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ]* 8.1 Write property tests for Modal component
  - **Property 6: Modal Viewport Containment** - Verify modal doesn't exceed 90vw width and is scrollable if content exceeds viewport height
  - **Validates: Requirements 8.1, 8.2, 8.4_

- [ ]* 8.2 Write unit tests for Modal component
  - Test modal has maximum 90vw width
  - Test close button is 24x24px
  - Test body overflow is hidden when modal open
  - Test content is scrollable
  - Test buttons are full-width
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

- [ ] 9. Create safe area support component
  - Create `frontend/src/components/ui/SafeAreaContainer.jsx` with safe-area-inset support
  - Implement padding based on env(safe-area-inset-*) values
  - Update fixed header to add padding-top for notch clearance
  - Update fixed footer to add padding-bottom for home indicator
  - Ensure viewport-fit=cover is set in meta tag
  - Center modals within safe area
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [ ]* 9.1 Write property tests for SafeAreaContainer component
  - **Property 8: Safe Area Inset Respect** - Verify fixed headers/footers include appropriate padding based on safe-area-inset values
  - **Validates: Requirements 17.1, 17.2, 17.3_

- [ ]* 9.2 Write unit tests for SafeAreaContainer component
  - Test safe-area-inset values are applied
  - Test fixed header has padding-top
  - Test fixed footer has padding-bottom
  - Test content is not hidden by notches
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 10. Create loading and error components
  - Create `frontend/src/components/ui/LoadingSpinner.jsx` with 24px centered spinner
  - Create `frontend/src/components/ui/SkeletonLoader.jsx` for content placeholders
  - Create `frontend/src/components/ui/ErrorMessage.jsx` with retry button
  - Implement smooth 0.2s transitions
  - Add space reservation for images to prevent layout shift
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ]* 10.1 Write unit tests for loading components
  - Test spinner is 24px
  - Test skeleton loader renders correct count
  - Test error message displays with retry button
  - Test transitions are smooth
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 11. Checkpoint - Verify all base components
  - Ensure all unit tests pass for base components
  - Verify no console errors or warnings
  - Test components on 320px, 375px, 425px, 768px viewports
  - Ask the user if questions arise.

- [ ] 12. Update Header component for mobile
  - Refactor `frontend/src/components/Header.js` to use MobileNav on mobile viewports
  - Implement responsive header with hamburger menu on mobile
  - Hide horizontal navigation on mobile (≤768px)
  - Show horizontal navigation on desktop (>768px)
  - Apply 56px fixed height
  - Add safe area padding for notch support
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 12.1 Write integration tests for Header component
  - Test hamburger menu appears on mobile
  - Test horizontal nav appears on desktop
  - Test menu opens/closes correctly
  - Test navigation links work
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 13. Update Footer component for mobile
  - Refactor `frontend/src/components/Footer.js` for mobile
  - Implement single-column layout on mobile
  - Use collapsible sections to save vertical space
  - Apply 16px font size for footer links with 12px padding
  - Add 16px gap between sections
  - Implement clickable email and phone links
  - Use 32x32px icon buttons for social links
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ]* 13.1 Write unit tests for Footer component
  - Test footer uses single-column layout on mobile
  - Test collapsible sections work
  - Test links have correct font size and padding
  - Test social icons are 32x32px
  - _Requirements: 13.1, 13.2, 13.3, 13.7_

- [ ] 14. Optimize landing pages for mobile
  - Update `frontend/src/components/Hero.js` with single-column layout
  - Implement mobile-optimized hero image (16:9 aspect ratio)
  - Update `frontend/src/components/PremiumFeatures.js` to stack cards vertically
  - Update `frontend/src/components/PremiumPricing.js` with swipeable carousel for pricing cards
  - Apply full-width buttons with 48px minimum height
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [ ]* 14.1 Write integration tests for landing pages
  - Test hero section displays correctly on mobile
  - Test feature cards stack vertically
  - Test pricing carousel works
  - Test CTA buttons are full-width
  - Test no horizontal scrolling
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] 15. Optimize authentication pages for mobile
  - Update `frontend/src/components/AuthPage.js` with centered form layout (max 400px width)
  - Apply 16px font size for all inputs
  - Stack form fields vertically with 16px gap
  - Use full-width buttons with 48px minimum height
  - Show clear error messages below form fields
  - Use 16px font size for auth links
  - Implement full-width social login buttons
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

- [ ]* 15.1 Write integration tests for auth pages
  - Test form layout is centered on mobile
  - Test inputs have 16px font size
  - Test form fields stack vertically
  - Test buttons are full-width
  - Test error messages display correctly
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 16. Optimize user dashboard for mobile
  - Update `frontend/src/components/UserPanel.js` with single-column layout
  - Implement bottom navigation or side drawer menu
  - Convert dashboard tables to card-based layout
  - Apply 20px padding to dashboard cards
  - Use full-width buttons or icon buttons (32x32px)
  - Maintain 16px font size for labels and values
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

- [ ]* 16.1 Write integration tests for user dashboard
  - Test dashboard uses single-column layout
  - Test navigation menu works
  - Test tables convert to card layout
  - Test buttons are full-width or icon buttons
  - Test no horizontal scrolling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17. Optimize site builder for mobile
  - Update `frontend/src/components/SiteBuilderWizard.js` with full-screen layout
  - Implement icon buttons (32x32px) instead of text buttons
  - Use bottom sheet or side drawer for settings panels
  - Show mobile device frame with proper aspect ratio
  - Maintain touch-friendly spacing between controls
  - Use full-width inputs with 48px minimum height
  - Hide non-essential UI elements on small screens
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ]* 17.1 Write integration tests for site builder
  - Test builder layout is full-screen on mobile
  - Test icon buttons are 32x32px
  - Test settings panel opens/closes
  - Test mobile device frame displays
  - Test inputs are full-width
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 18. Optimize admin panel for mobile
  - Update `frontend/src/components/SimpleAdminPanel.js` with single-column layout
  - Implement collapsible sections for organization
  - Convert admin tables to card-based layout with horizontal scroll
  - Use full-width inputs with 48px minimum height
  - Implement bottom navigation or side drawer menu
  - Use icon buttons (32x32px) with tooltips
  - Maintain 16px font size for labels and values
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7_

- [ ]* 18.1 Write integration tests for admin panel
  - Test admin panel uses single-column layout
  - Test collapsible sections work
  - Test tables convert to card layout
  - Test navigation menu works
  - Test no horizontal scrolling
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 19. Optimize public storefront pages for mobile
  - Update `frontend/src/components/PublicSitePage.js` with single-column product grid
  - Show product image, name, price, and rating in cards
  - Use full-width product images with proper aspect ratio
  - Implement collapsible sections for descriptions and specifications
  - Maintain 16px font size for product names and prices
  - Show cart summary with full-width checkout button
  - Implement swipeable carousel for product images
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ]* 19.1 Write integration tests for storefront pages
  - Test product grid is single-column
  - Test product cards display correctly
  - Test product images are full-width
  - Test collapsible sections work
  - Test cart button is full-width
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 20. Optimize legal and content pages for mobile
  - Update `frontend/src/components/TermsPage.js`, `PrivacyPage.js`, `CookiesPage.js` for mobile
  - Implement single-column layout with readable typography
  - Apply 16px font size for body text with 1.6 line-height
  - Use proper heading hierarchy (h1-h6)
  - Add 20px vertical spacing between sections
  - Implement collapsible sections for long content
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 20.1 Write integration tests for legal pages
  - Test pages use single-column layout
  - Test typography is readable
  - Test collapsible sections work
  - Test no horizontal scrolling
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 21. Checkpoint - Verify all page optimizations
  - Ensure all integration tests pass for page components
  - Test all pages on 320px, 375px, 425px, 768px viewports
  - Verify no horizontal scrolling on any page
  - Verify all buttons and links are 48x48px minimum
  - Ask the user if questions arise.

- [ ] 22. Implement form system with validation
  - Create `frontend/src/components/ui/FormGroup.jsx` for form field grouping
  - Create `frontend/src/components/ui/FormSelect.jsx` for select dropdowns
  - Create `frontend/src/components/ui/FormCheckbox.jsx` for checkboxes
  - Create `frontend/src/components/ui/FormRadio.jsx` for radio buttons
  - Implement form validation with error display
  - Use native mobile select for better UX
  - Apply 16px font size for all form elements
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 22.1 Write unit tests for form components
  - Test all form elements have 16px font size
  - Test validation errors display correctly
  - Test native select is used on mobile
  - Test form fields stack vertically
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 23. Implement accessibility features
  - Add ARIA labels to all interactive components
  - Implement keyboard navigation for all interactive elements
  - Add focus indicators to all focusable elements
  - Verify semantic HTML structure (button, input, nav, main, etc.)
  - Test color contrast ratios (4.5:1 for normal text)
  - Add alt text to all meaningful images
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ]* 23.1 Write accessibility tests
  - Test all buttons have ARIA labels
  - Test keyboard navigation works
  - Test focus indicators are visible
  - Test color contrast meets WCAG AA standards
  - Test semantic HTML is used
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 24. Implement performance optimizations
  - Add image optimization with responsive srcset
  - Implement lazy loading for below-the-fold images
  - Add code splitting for large components
  - Implement route-based code splitting
  - Add performance monitoring
  - Optimize bundle size
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ]* 24.1 Write performance tests
  - Test LCP < 2.5s on 4G
  - Test FID < 100ms
  - Test CLS < 0.1
  - Test image load time < 1s
  - Test no layout shifts during image loading
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 25. Checkpoint - Verify all features and optimizations
  - Ensure all tests pass (unit, integration, accessibility, performance)
  - Test all pages on real mobile devices (iPhone, Android)
  - Verify no console errors or warnings
  - Verify all requirements are met
  - Ask the user if questions arise.

- [ ] 26. Final QA and testing
  - Test layout on viewport widths: 320px, 375px, 425px, 768px
  - Verify all buttons and links are 48x48px minimum touch targets
  - Verify no horizontal scrolling on any page
  - Verify images load correctly and maintain aspect ratio
  - Verify form inputs are accessible and properly sized
  - Verify navigation works correctly on mobile menu
  - Test touch interactions on real devices
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

- [ ] 27. Documentation and handoff
  - Create component documentation with usage examples
  - Document design tokens and their usage
  - Create mobile design guidelines document
  - Document responsive breakpoints and media queries
  - Create troubleshooting guide for common issues
  - Document accessibility features and compliance
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate page-level functionality
- All components use Tailwind CSS utility classes for consistency
- Mobile-first approach with min-width media queries
- CSS custom properties for colors, spacing, and typography
- CSS Grid and Flexbox for responsive layouts
- Respect prefers-reduced-motion for accessibility
