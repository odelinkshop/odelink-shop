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
        className={svgTextClassName}
      >
        <g transform="rotate(-45 12 12)">
          <path
            d="M15 7h3a5 5 0 0 1 0 10h-3"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 17H6a5 5 0 0 1 0-10h3"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="12"
            x2="16"
            y2="12"
            stroke="#EF4444"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {withText ? (
        <span className={`text-2xl font-black tracking-tight ${wordmarkTextClassName} ${textClassName}`.trim()}>
          Ödelink
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
