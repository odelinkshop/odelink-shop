import React from 'react';

const BrandLogo = ({ size = 40, withText = false, className = '', textClassName = '' }) => {
  const svgTextClassName = textClassName.includes('text-white') ? 'text-white' : 'text-gray-900';
  const wordmarkTextClassName = textClassName.includes('text-white') ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex items-center space-x-2 ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <defs>
          <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="cyberRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g transform="rotate(-45 12 12)">
          <path
            d="M15 7h3a5 5 0 0 1 0 10h-3"
            stroke="url(#silverGradient)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 17H6a5 5 0 0 1 0-10h3"
            stroke="url(#silverGradient)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="12"
            x2="16"
            y2="12"
            stroke="#EF4444"
            strokeWidth="3.2"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.4))' }}
          />
        </g>
      </svg>

      {withText ? (
        <span className={`text-2xl font-black tracking-tighter text-white ${textClassName}`.trim()} style={{ letterSpacing: '-0.04em' }}>
          Ödelink
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
