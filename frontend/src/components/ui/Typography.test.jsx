/**
 * Unit Tests for Typography Component
 * Tests font sizes, weights, line-heights, and letter-spacing
 */

import React from 'react';
import { render } from '@testing-library/react';
import Typography from './Typography';

describe('Typography Component', () => {
  describe('Font Sizes', () => {
    it('should render h1 with correct font size classes', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      const element = container.querySelector('h1');
      expect(element).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl');
    });

    it('should render h2 with correct font size classes', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      const element = container.querySelector('h2');
      expect(element).toHaveClass('text-xl', 'sm:text-2xl', 'md:text-3xl');
    });

    it('should render h3 with correct font size classes', () => {
      const { container } = render(<Typography variant="h3">Heading 3</Typography>);
      const element = container.querySelector('h3');
      expect(element).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
    });

    it('should render h4 with correct font size classes', () => {
      const { container } = render(<Typography variant="h4">Heading 4</Typography>);
      const element = container.querySelector('h4');
      expect(element).toHaveClass('text-base', 'sm:text-lg', 'md:text-xl');
    });

    it('should render h5 with correct font size classes', () => {
      const { container } = render(<Typography variant="h5">Heading 5</Typography>);
      const element = container.querySelector('h5');
      expect(element).toHaveClass('text-base');
    });

    it('should render h6 with correct font size classes', () => {
      const { container } = render(<Typography variant="h6">Heading 6</Typography>);
      const element = container.querySelector('h6');
      expect(element).toHaveClass('text-base');
    });

    it('should render body text with correct font size', () => {
      const { container } = render(<Typography variant="body">Body text</Typography>);
      const element = container.querySelector('p');
      expect(element).toHaveClass('text-base');
    });

    it('should render small text with correct font size', () => {
      const { container } = render(<Typography variant="small">Small text</Typography>);
      const element = container.querySelector('span');
      expect(element).toHaveClass('text-sm');
    });

    it('should render caption text with correct font size', () => {
      const { container } = render(<Typography variant="caption">Caption text</Typography>);
      const element = container.querySelector('span');
      expect(element).toHaveClass('text-xs');
    });
  });

  describe('Font Weights', () => {
    it('should apply bold weight to h1', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      const element = container.querySelector('h1');
      expect(element).toHaveClass('font-bold');
    });

    it('should apply bold weight to h2', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      const element = container.querySelector('h2');
      expect(element).toHaveClass('font-bold');
    });

    it('should apply semibold weight to h3', () => {
      const { container } = render(<Typography variant="h3">Heading 3</Typography>);
      const element = container.querySelector('h3');
      expect(element).toHaveClass('font-semibold');
    });

    it('should apply semibold weight to h4', () => {
      const { container } = render(<Typography variant="h4">Heading 4</Typography>);
      const element = container.querySelector('h4');
      expect(element).toHaveClass('font-semibold');
    });

    it('should apply normal weight to body text', () => {
      const { container } = render(<Typography variant="body">Body text</Typography>);
      const element = container.querySelector('p');
      expect(element).toHaveClass('font-normal');
    });

    it('should apply normal weight to small text', () => {
      const { container } = render(<Typography variant="small">Small text</Typography>);
      const element = container.querySelector('span');
      expect(element).toHaveClass('font-normal');
    });
  });

  describe('Line Height', () => {
    it('should apply tight line-height to h1', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      const element = container.querySelector('h1');
      expect(element).toHaveClass('leading-tight');
    });

    it('should apply tight line-height to h2', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      const element = container.querySelector('h2');
      expect(element).toHaveClass('leading-tight');
    });

    it('should apply snug line-height to h3', () => {
      const { container } = render(<Typography variant="h3">Heading 3</Typography>);
      const element = container.querySelector('h3');
      expect(element).toHaveClass('leading-snug');
    });

    it('should apply relaxed line-height to body text', () => {
      const { container } = render(<Typography variant="body">Body text</Typography>);
      const element = container.querySelector('p');
      expect(element).toHaveClass('leading-relaxed');
    });

    it('should apply normal line-height to small text', () => {
      const { container } = render(<Typography variant="small">Small text</Typography>);
      const element = container.querySelector('span');
      expect(element).toHaveClass('leading-normal');
    });

    it('should apply normal line-height to caption text', () => {
      const { container } = render(<Typography variant="caption">Caption text</Typography>);
      const element = container.querySelector('span');
      expect(element).toHaveClass('leading-normal');
    });
  });

  describe('Letter Spacing', () => {
    it('should apply negative letter-spacing to h1', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      const element = container.querySelector('h1');
      expect(element).toHaveClass('-tracking-wide');
    });

    it('should apply negative letter-spacing to h2', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      const element = container.querySelector('h2');
      expect(element).toHaveClass('-tracking-wide');
    });
  });

  describe('HTML Elements', () => {
    it('should render h1 as h1 element', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('should render h2 as h2 element', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('should render body as p element', () => {
      const { container } = render(<Typography variant="body">Body text</Typography>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('should render small as span element', () => {
      const { container } = render(<Typography variant="small">Small text</Typography>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should render caption as span element', () => {
      const { container } = render(<Typography variant="caption">Caption text</Typography>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <Typography variant="body" className="custom-class">
          Body text
        </Typography>
      );
      const element = container.querySelector('p');
      expect(element).toHaveClass('custom-class');
    });

    it('should accept custom as prop to override element', () => {
      const { container } = render(
        <Typography variant="h1" as="div">
          Heading 1
        </Typography>
      );
      expect(container.querySelector('div')).toBeInTheDocument();
      expect(container.querySelector('h1')).not.toBeInTheDocument();
    });

    it('should accept additional HTML attributes', () => {
      const { container } = render(
        <Typography variant="body" id="test-id" data-testid="typography">
          Body text
        </Typography>
      );
      const element = container.querySelector('p');
      expect(element).toHaveAttribute('id', 'test-id');
      expect(element).toHaveAttribute('data-testid', 'typography');
    });
  });

  describe('Content Rendering', () => {
    it('should render text content correctly', () => {
      const { getByText } = render(<Typography variant="body">Test content</Typography>);
      expect(getByText('Test content')).toBeInTheDocument();
    });

    it('should render children elements', () => {
      const { container } = render(
        <Typography variant="body">
          Text with <strong>bold</strong> content
        </Typography>
      );
      expect(container.querySelector('strong')).toBeInTheDocument();
    });

    it('should render default variant as body', () => {
      const { container } = render(<Typography>Default text</Typography>);
      const element = container.querySelector('p');
      expect(element).toHaveClass('text-base', 'font-normal', 'leading-relaxed');
    });
  });

  describe('Responsive Behavior', () => {
    it('should include responsive classes for h1', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>);
      const element = container.querySelector('h1');
      const classString = element.className;
      expect(classString).toMatch(/text-2xl/);
      expect(classString).toMatch(/sm:text-3xl/);
      expect(classString).toMatch(/md:text-4xl/);
    });

    it('should include responsive classes for h2', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>);
      const element = container.querySelector('h2');
      const classString = element.className;
      expect(classString).toMatch(/text-xl/);
      expect(classString).toMatch(/sm:text-2xl/);
      expect(classString).toMatch(/md:text-3xl/);
    });

    it('should include responsive classes for h3', () => {
      const { container } = render(<Typography variant="h3">Heading 3</Typography>);
      const element = container.querySelector('h3');
      const classString = element.className;
      expect(classString).toMatch(/text-lg/);
      expect(classString).toMatch(/sm:text-xl/);
      expect(classString).toMatch(/md:text-2xl/);
    });

    it('should include responsive classes for h4', () => {
      const { container } = render(<Typography variant="h4">Heading 4</Typography>);
      const element = container.querySelector('h4');
      const classString = element.className;
      expect(classString).toMatch(/text-base/);
      expect(classString).toMatch(/sm:text-lg/);
      expect(classString).toMatch(/md:text-xl/);
    });
  });
});
