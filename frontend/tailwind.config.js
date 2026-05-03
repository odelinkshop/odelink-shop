/** @type {import('tailwindcss').Config} */
const { designTokens } = require('./src/styles/designTokens');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Typography
      fontSize: {
        h1: ['32px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        h5: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        h6: ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      // Spacing (4px grid-based)
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

      // Colors
      colors: {
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
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },

      // Border Radius
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },

      // Shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },

      // Transitions
      transitionDuration: {
        fast: '0.15s',
        base: '0.2s',
        slow: '0.3s',
      },

      // Min Height for touch targets
      minHeight: {
        touch: '48px',
        'touch-lg': '56px',
        'touch-sm': '40px',
      },

      // Min Width for touch targets
      minWidth: {
        touch: '48px',
        'touch-lg': '56px',
        'touch-sm': '40px',
      },

      // Font Family
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },

      // Z-Index
      zIndex: {
        hide: '-1',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        backdrop: '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
    },
  },

  // Mobile-first breakpoints
  screens: {
    'mobile': '320px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
  },

  plugins: [],
}
