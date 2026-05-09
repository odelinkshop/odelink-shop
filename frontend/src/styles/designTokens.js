/**
 * Design Tokens for Mobile Design System
 * Defines typography, spacing, colors, breakpoints, and shadows
 * Used by Tailwind CSS configuration and CSS custom properties
 */

export const designTokens = {
  // Typography Scale (mobile-first)
  typography: {
    h1: {
      size: '32px',
      weight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      size: '28px',
      weight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      size: '24px',
      weight: 600,
      lineHeight: 1.3,
      letterSpacing: '0',
    },
    h4: {
      size: '20px',
      weight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
    h5: {
      size: '18px',
      weight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
    h6: {
      size: '16px',
      weight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    body: {
      size: '16px',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    small: {
      size: '14px',
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    caption: {
      size: '12px',
      weight: 400,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
  },

  // Spacing System (4px grid-based)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },

  // Color Palette
  colors: {
    // Primary
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Secondary
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    // Neutral
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
  },

  // Responsive Breakpoints (mobile-first)
  breakpoints: {
    mobile: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // Touch Target Sizes
  touchTarget: {
    minimum: '48px',
    recommended: '56px',
    small: '40px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '0.15s ease-in-out',
    base: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },

  // Z-Index Scale
  zIndex: {
    hide: '-1',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },
};

export default designTokens;
