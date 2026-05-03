/**
 * Typography Component
 * Provides a reusable component for rendering text with predefined variants
 * Supports responsive font sizes using Tailwind breakpoints
 * 
 * Variants: h1, h2, h3, h4, h5, h6, body, small, caption
 * 
 * Usage:
 * <Typography variant="h1">Main Heading</Typography>
 * <Typography variant="body">Body text content</Typography>
 * <Typography variant="caption">Small caption text</Typography>
 */

import React from 'react';
import PropTypes from 'prop-types';

const Typography = ({
  variant = 'body',
  children,
  className = '',
  as: Component,
  ...props
}) => {
  // Define variant styles with responsive font sizes using Tailwind breakpoints
  const variantStyles = {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-bold -tracking-wide leading-tight',
    h2: 'text-xl sm:text-2xl md:text-3xl font-bold -tracking-wide leading-tight',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold leading-snug',
    h4: 'text-base sm:text-lg md:text-xl font-semibold leading-snug',
    h5: 'text-base font-semibold leading-snug',
    h6: 'text-base font-semibold leading-snug',
    body: 'text-base font-normal leading-relaxed',
    small: 'text-sm font-normal leading-normal',
    caption: 'text-xs font-normal leading-normal',
  };

  // Determine the HTML element to render based on variant
  const elementMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    small: 'span',
    caption: 'span',
  };

  const Element = Component || elementMap[variant];
  const styles = variantStyles[variant] || variantStyles.body;

  return (
    <Element
      className={`${styles} ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

export default Typography;
