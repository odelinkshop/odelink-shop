# Mobile Design Overhaul - Design Document

## Overview

This design document outlines the comprehensive mobile-first responsive design system for the odelink.shop platform. The system ensures all 50+ pages deliver a professional, cohesive mobile experience (320px-768px) while maintaining the existing desktop design.

The design is built on three core pillars:
1. **Mobile-First Responsive Architecture** - Progressive enhancement from mobile to desktop
2. **Professional Component System** - Reusable, accessible React components with Tailwind CSS
3. **Performance & Accessibility** - WCAG 2.1 AA compliance with optimized loading and interactions

### Key Design Principles

- **Mobile-First**: Design for 320px viewport first, enhance for larger screens
- **Consistency**: Unified typography, spacing, and component patterns across all pages
- **Accessibility**: WCAG 2.1 Level AA compliance with semantic HTML and ARIA support
- **Performance**: Optimized images, lazy loading, and minimal layout shifts
- **Touch-Friendly**: 48x48px minimum touch targets with clear visual feedback
- **Responsive**: Fluid layouts using CSS Grid and Flexbox with strategic breakpoints

---

## Architecture

### Design System Layers

```
┌─────────────────────────────────────────────────────────┐
│  Page Components (Landing, Auth, Dashboard, etc.)       │
├─────────────────────────────────────────────────────────┤
│  Feature Components (Cards, Forms, Modals, etc.)        │
├─────────────────────────────────────────────────────────┤
│  Base Components (Button, Input, Typography, etc.)      │
├─────────────────────────────────────────────────────────┤
│  Design Tokens (Colors, Spacing, Typography, etc.)      │
├─────────────────────────────────────────────────────────┤
│  Tailwind CSS + CSS Custom Properties                   │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```
Mobile-First Approach:
- Base (320px+): Mobile styles (default)
- sm (640px+): Small tablets
- md (768px+): Tablets and small desktops
- lg (1024px+): Desktops
- xl (1280px+): Large desktops
```

Tailwind CSS breakpoints are used with mobile-first media queries:
```css
/* Mobile first (default) */
.component { /* mobile styles */ }

/* Tablet and up */
@media (min-width: 640px) { .component { /* tablet styles */ } }

/* Desktop and up */
@media (min-width: 768px) { .component { /* desktop styles */ } }
```

---

## Components and Interfaces

### 1. Typography System

**Mobile Typography Scale:**
- h1: 32px, 700 weight, -0.025em letter-spacing
- h2: 28px, 700 weight, -0.025em letter-spacing
- h3: 24px, 600 weight, -0.025em letter-spacing
- h4: 20px, 600 weight
- h5: 18px, 600 weight
- h6: 16px, 600 weight
- Body: 16px, 400 weight, 1.6 line-height
- Small: 14px, 400 weight
- Caption: 12px, 400 weight

**Implementation:**
```jsx
// Typography Component
export const Typography = ({ variant, children, className }) => {
  const variants = {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-bold -tracking-wide',
    h2: 'text-xl sm:text-2xl md:text-3xl font-bold -tracking-wide',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    body: 'text-base leading-relaxed',
    small: 'text-sm',
    caption: 'text-xs'
  };
  
  return <div className={`${variants[variant]} ${className}`}>{children}</div>;
};
```

### 2. Spacing System

**4px Grid-Based Spacing:**
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 12px (0.75rem)
- lg: 16px (1rem)
- xl: 20px (1.25rem)
- 2xl: 24px (1.5rem)
- 3xl: 32px (2rem)

**Mobile Padding Standards:**
- Page sections: 16px horizontal, 20px vertical
- Cards/containers: 20px padding
- Form fields: 14px padding
- Buttons: 14px padding

### 3. Button Component

**Touch Target Requirements:**
- Minimum 48x48px for all interactive elements
- 14px padding with 12px border-radius
- Clear visual feedback on tap (0.2s transition)
- No hover effects on mobile (use active/focus states)

```jsx
export const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]'
  };
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100'
  };
  
  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} w-full sm:w-auto`} {...props}>
      {children}
    </button>
  );
};
```

### 4. Form Input Component

**Mobile Form Design:**
- 16px font size (prevents iOS auto-zoom)
- 14px padding with 12px border-radius
- 2px border with focus ring
- 48px minimum height
- Labels positioned above inputs with 8px spacing
- Error messages below inputs with 12px font size

```jsx
export const FormInput = ({ label, error, ...props }) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};
```

### 5. Card Component

**Mobile Card Design:**
- 20px padding with 16px border-radius
- Subtle shadow: 0 4px 6px rgba(0,0,0,0.1)
- Single-column layout on mobile
- 12px gap between cards
- Responsive images that don't exceed container width

```jsx
export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export const CardGrid = ({ children, columns = 1 }) => {
  return (
    <div className={`grid gap-3 grid-cols-${columns} sm:grid-cols-2 md:grid-cols-3`}>
      {children}
    </div>
  );
};
```

### 6. Navigation Component

**Mobile Navigation:**
- Hamburger menu icon (24x24px) instead of horizontal navigation
- Full-screen overlay with vertical menu items
- 16px font size for menu items with 12px padding
- 56px fixed header height
- Prevents body scroll when menu is open
- Auto-closes on link click

```jsx
export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <Logo />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </header>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      
      <nav className={`fixed top-0 left-0 h-screen w-64 bg-white z-40 transform transition-transform md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Menu items */}
      </nav>
    </>
  );
};
```

### 7. Modal Component

**Mobile Modal Design:**
- Full-screen or near-full-screen layout (90vw max width)
- 16px padding with 12px border-radius
- Close button (24x24px) in top-right corner
- Scrollable content if exceeds viewport height
- Prevents body scroll
- Full-width stacked buttons

```jsx
export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="bg-white w-full sm:w-[90vw] sm:max-w-md rounded-t-lg sm:rounded-lg p-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
```

### 8. Image Component

**Mobile Image Optimization:**
- Constrained to 100% viewport width
- Responsive image sizes via srcset
- Lazy loading for below-the-fold images
- Mobile-optimized aspect ratios (16:9 or 4:3)
- Maintains aspect ratio to prevent layout shift
- Placeholder color or low-quality image until full load

```jsx
export const ResponsiveImage = ({ src, alt, aspectRatio = '16/9', lazy = true }) => {
  return (
    <div className={`w-full bg-gray-200 overflow-hidden rounded-lg`} style={{ aspectRatio }}>
      <img
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        className="w-full h-full object-cover"
        srcSet={`
          ${src}?w=320 320w,
          ${src}?w=640 640w,
          ${src}?w=1024 1024w
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
      />
    </div>
  );
};
```

### 9. Safe Area Support

**Notch and Safe Area Handling:**
- Respects safe-area-inset values for critical content
- Fixed headers add padding-top for notch clearance
- Fixed footers add padding-bottom for home indicator
- Uses viewport-fit=cover in viewport meta tag
- Centers modals within safe area

```jsx
export const SafeAreaContainer = ({ children }) => {
  return (
    <div className="w-full" style={{
      paddingLeft: 'max(1rem, env(safe-area-inset-left))',
      paddingRight: 'max(1rem, env(safe-area-inset-right))',
      paddingTop: 'max(1rem, env(safe-area-inset-top))',
      paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
    }}>
      {children}
    </div>
  );
};
```

### 10. Loading States

**Mobile Loading Indicators:**
- Loading skeleton or spinner while content loads
- 24px spinner icon centered on screen
- Placeholder color or low-quality image until full load
- Smooth 0.2s transitions without jarring effects
- Space reserved for images to prevent layout shift
- Error message with retry button on failure

```jsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
  </div>
);

export const SkeletonLoader = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);
```

---

## Data Models

### Design Token Structure

```javascript
// Design Tokens
const designTokens = {
  // Typography
  typography: {
    h1: { size: '32px', weight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' },
    h2: { size: '28px', weight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' },
    h3: { size: '24px', weight: 600, lineHeight: 1.3 },
    body: { size: '16px', weight: 400, lineHeight: 1.6 },
    small: { size: '14px', weight: 400, lineHeight: 1.5 },
    caption: { size: '12px', weight: 400, lineHeight: 1.4 }
  },
  
  // Spacing (4px grid)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },
  
  // Colors
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b'
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  // Touch targets
  touchTarget: {
    minimum: '48px',
    recommended: '56px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};
```

### Component Props Interface

```typescript
// Button Component Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Card Component Props
interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Form Input Props
interface FormInputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

// Modal Props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Touch Target Minimum Size

*For any* interactive element (button, link, input), the computed bounding box dimensions SHALL be at least 48x48 pixels on mobile viewports (≤768px).

**Validates: Requirements 3.1, 15.1**

### Property 2: Typography Scale Consistency

*For any* heading level (h1-h6) or text variant (body, small, caption), the computed font size SHALL match the defined typography scale (h1=32px, h2=28px, h3=24px, h4=20px, h5=18px, h6=16px, body=16px, small=14px, caption=12px) on mobile viewports.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 3: Responsive Layout Reflow

*For any* multi-column layout on desktop (>768px), when viewport width changes to mobile (≤768px), the layout SHALL reflow to single-column or 2-column maximum without horizontal scrolling.

**Validates: Requirements 2.4, 2.6, 16.1, 16.2, 16.3**

### Property 4: Image Aspect Ratio Preservation

*For any* image with a defined aspect ratio, after loading completes, the rendered image dimensions SHALL maintain the specified aspect ratio without distortion or layout shift.

**Validates: Requirements 7.4, 7.5**

### Property 5: Form Input Accessibility

*For any* form input element, the associated label SHALL be properly connected via HTML attributes (for/id), and the input SHALL have minimum 48px height on mobile viewports.

**Validates: Requirements 4.1, 4.2, 4.3, 15.3**

### Property 6: Modal Viewport Containment

*For any* modal dialog on mobile viewports (≤768px), the modal content SHALL not exceed 90vw width and SHALL be scrollable if content height exceeds viewport height.

**Validates: Requirements 8.1, 8.2, 8.4**

### Property 7: Navigation Menu State Synchronization

*For any* navigation menu toggle action, when menu is opened, body scroll SHALL be prevented (overflow:hidden), and when menu is closed, body scroll SHALL be restored.

**Validates: Requirements 5.5, 5.7**

### Property 8: Safe Area Inset Respect

*For any* fixed header or footer on devices with notches/safe areas, the element SHALL include appropriate padding based on safe-area-inset values to prevent content obstruction.

**Validates: Requirements 17.1, 17.2, 17.3**

### Property 9: Viewport Meta Tag Configuration

*For any* page load, the HTML head SHALL contain a viewport meta tag with width=device-width, initial-scale=1, viewport-fit=cover, and maximum-scale=1.

**Validates: Requirements 18.1, 18.2, 18.3, 18.4**

### Property 10: Color Contrast Compliance

*For any* text element on mobile viewports, the computed color contrast ratio between text and background SHALL meet WCAG 2.1 Level AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 15.2**

### Property 11: Responsive Image Srcset

*For any* responsive image with srcset attribute, the browser SHALL select and load the appropriate image size based on viewport width and device pixel ratio.

**Validates: Requirements 7.2, 7.3**

### Property 12: Loading State Placeholder

*For any* image or content with lazy loading enabled, a placeholder (color or low-quality image) SHALL be visible before the full content loads.

**Validates: Requirements 7.3, 7.7, 14.3**

### Property 13: Breakpoint Media Query Activation

*For any* CSS media query with max-width breakpoint, the styles SHALL apply when viewport width is less than or equal to the specified breakpoint value.

**Validates: Requirements 16.1, 16.2, 19.2**

### Property 14: Semantic HTML Structure

*For any* interactive component, the rendered HTML SHALL use semantic elements (button, input, nav, main, etc.) with appropriate ARIA labels and roles.

**Validates: Requirements 15.6, 15.7**

### Property 15: Touch Feedback Transition

*For any* button or interactive element on mobile, when tapped, a visual feedback transition (0.2s) SHALL occur without jarring effects or layout shifts.

**Validates: Requirements 3.4, 14.4**

---

## Error Handling

### Mobile-Specific Error Scenarios

**1. Network Errors**
- Show error message with retry button
- Use 12px font size for error text
- Position error below form field or in modal
- Provide clear action to retry operation

**2. Form Validation Errors**
- Display error message immediately below input
- Use red color (#ef4444) for error state
- Maintain 48px minimum height for error message area
- Clear error when user corrects input

**3. Image Loading Failures**
- Show placeholder with fallback color
- Display error icon (24x24px) centered
- Provide retry mechanism if applicable
- Use alt text as fallback description

**4. Timeout Errors**
- Show timeout message with retry button
- Suggest checking internet connection
- Provide alternative action if available
- Auto-retry after 5 seconds (optional)

**5. Permission Errors**
- Show clear message explaining permission requirement
- Provide link to settings or help documentation
- Use 16px font size for readability
- Include icon for visual clarity

### Error Component

```jsx
export const ErrorMessage = ({ message, onRetry, icon = AlertCircle }) => {
  const Icon = icon;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <Icon className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-600 font-medium mt-2 hover:text-red-700"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## Testing Strategy

### Unit Testing Approach

**Component Testing:**
- Test button renders with correct size (48x48px minimum)
- Test form inputs have 16px font size
- Test card padding is 20px
- Test typography scale matches design tokens
- Test modal closes on overlay click
- Test navigation menu toggle functionality
- Test image lazy loading attribute

**Example Unit Tests:**
```javascript
describe('Button Component', () => {
  it('should have minimum 48px height', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    expect(button.offsetHeight).toBeGreaterThanOrEqual(48);
  });
  
  it('should apply correct padding', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    const styles = window.getComputedStyle(button);
    expect(styles.padding).toContain('14px');
  });
});

describe('FormInput Component', () => {
  it('should have 16px font size', () => {
    const { container } = render(<FormInput />);
    const input = container.querySelector('input');
    const styles = window.getComputedStyle(input);
    expect(styles.fontSize).toBe('16px');
  });
  
  it('should associate label with input', () => {
    const { container } = render(<FormInput label="Email" />);
    const label = container.querySelector('label');
    const input = container.querySelector('input');
    expect(label.htmlFor).toBe(input.id);
  });
});
```

### Integration Testing Approach

**Page-Level Testing:**
- Test responsive layout on 320px, 375px, 425px, 768px viewports
- Test no horizontal scrolling occurs
- Test navigation menu opens/closes correctly
- Test form submission on mobile
- Test image loading and aspect ratio
- Test modal interactions
- Test safe area handling on notched devices

**Example Integration Tests:**
```javascript
describe('Mobile Responsive Layout', () => {
  it('should not have horizontal scrolling at 320px', () => {
    window.innerWidth = 320;
    render(<App />);
    const body = document.body;
    expect(body.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  });
  
  it('should reflow layout from desktop to mobile', () => {
    const { container } = render(<CardGrid columns={3} />);
    const grid = container.querySelector('[class*="grid"]');
    
    // Desktop: 3 columns
    expect(grid).toHaveClass('md:grid-cols-3');
    
    // Mobile: 1 column
    expect(grid).toHaveClass('grid-cols-1');
  });
});
```

### Accessibility Testing

**WCAG 2.1 Level AA Compliance:**
- Color contrast ratio ≥ 4.5:1 for normal text
- All interactive elements keyboard accessible
- Semantic HTML structure
- ARIA labels for complex components
- Alt text for all meaningful images
- Focus indicators visible on all interactive elements

**Testing Tools:**
- axe DevTools for automated accessibility checks
- WAVE for color contrast verification
- Screen reader testing (NVDA, JAWS)
- Keyboard navigation testing

### Performance Testing

**Mobile Performance Metrics:**
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Image load time < 1s on 4G
- No layout shifts during image loading

**Testing Approach:**
- Use Lighthouse for performance audits
- Test on throttled 4G connection
- Monitor Core Web Vitals
- Test image optimization with different sizes
- Verify lazy loading effectiveness

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up design tokens and CSS custom properties
- [ ] Create base components (Button, Input, Card, Typography)
- [ ] Implement responsive breakpoints
- [ ] Configure Tailwind CSS for mobile-first approach

### Phase 2: Navigation & Layout (Week 2-3)
- [ ] Implement mobile navigation with hamburger menu
- [ ] Create responsive header component
- [ ] Build footer with collapsible sections
- [ ] Implement safe area support

### Phase 3: Page Components (Week 3-4)
- [ ] Update landing pages for mobile
- [ ] Optimize authentication pages
- [ ] Refactor dashboard layout
- [ ] Optimize site builder interface

### Phase 4: Forms & Inputs (Week 4-5)
- [ ] Implement mobile form system
- [ ] Create form validation UI
- [ ] Optimize input fields for touch
- [ ] Add error handling

### Phase 5: Images & Media (Week 5-6)
- [ ] Implement responsive images with srcset
- [ ] Add lazy loading
- [ ] Optimize image sizes
- [ ] Add loading placeholders

### Phase 6: Testing & Optimization (Week 6-7)
- [ ] Unit testing for all components
- [ ] Integration testing on real devices
- [ ] Performance optimization
- [ ] Accessibility audit and fixes

### Phase 7: Deployment & Monitoring (Week 7-8)
- [ ] Deploy to staging environment
- [ ] User testing on mobile devices
- [ ] Monitor performance metrics
- [ ] Gather feedback and iterate

---

## Success Metrics

### Design System Adoption
- 100% of pages use mobile-first responsive design
- 100% of components use design tokens
- 0 inline styles in component code

### Performance
- LCP < 2.5s on 4G
- FID < 100ms
- CLS < 0.1
- Image load time < 1s

### Accessibility
- WCAG 2.1 Level AA compliance
- 100% of interactive elements have 48x48px touch targets
- 100% of images have alt text
- 100% keyboard navigable

### User Experience
- 0 horizontal scrolling on any page
- 100% of forms work on mobile
- 100% of buttons/links tappable without zoom
- Smooth transitions and interactions

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Web Best Practices](https://www.w3.org/TR/mobile-bp/)
- [React Best Practices](https://react.dev/learn)
- [CSS Grid & Flexbox Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Web Vitals](https://web.dev/vitals/)
- [Safe Area Guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
