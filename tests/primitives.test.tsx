import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  SkeletonPrimitive,
  TextSkeletonPrimitive,
  AvatarSkeletonPrimitive,
  ButtonSkeletonPrimitive,
  ImageSkeletonPrimitive,
  CardSkeletonPrimitive,
  injectSkeletonCSS,
} from '../src/components/primitives';

describe('Skeleton Primitives', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('SkeletonPrimitive', () => {
    it('should render with default props', () => {
      render(<SkeletonPrimitive />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('aria-busy', 'true');
      expect(element).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should apply custom dimensions', () => {
      render(<SkeletonPrimitive width={200} height={50} />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '200px',
        height: '50px',
      });
    });

    it('should apply different shapes', () => {
      const { rerender } = render(<SkeletonPrimitive shape="rectangular" />);
      let element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({ borderRadius: '4px' });

      rerender(<SkeletonPrimitive shape="circular" />);
      element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({ borderRadius: '50%' });

      rerender(<SkeletonPrimitive shape="rounded" />);
      element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({ borderRadius: '8px' });
    });

    it('should handle different animations', () => {
      const { rerender } = render(
        <SkeletonPrimitive animation={{ type: 'shimmer', duration: 1500 }} />
      );
      let element = screen.getByRole('progressbar');
      expect(element).toHaveClass('auto-skeleton-shimmer');

      rerender(<SkeletonPrimitive animation={{ type: 'pulse', duration: 1200 }} />);
      element = screen.getByRole('progressbar');
      expect(element).toHaveClass('auto-skeleton-pulse');

      rerender(<SkeletonPrimitive animation={{ type: 'none' }} />);
      element = screen.getByRole('progressbar');
      expect(element).not.toHaveClass('auto-skeleton-shimmer');
      expect(element).not.toHaveClass('auto-skeleton-pulse');
    });

    it('should apply custom styles', () => {
      render(
        <SkeletonPrimitive 
          style={{ margin: '10px', backgroundColor: '#f0f0f0' }}
          className="custom-skeleton"
        />
      );
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        margin: '10px',
        backgroundColor: '#f0f0f0',
      });
      expect(element).toHaveClass('custom-skeleton');
    });
  });

  describe('TextSkeletonPrimitive', () => {
    it('should render single line by default', () => {
      render(<TextSkeletonPrimitive />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toBeInTheDocument();
    });

    it('should render multiple lines', () => {
      render(<TextSkeletonPrimitive lines={3} />);
      
      const container = screen.container.querySelector('.auto-skeleton-text-primitive');
      expect(container).toBeInTheDocument();
      
      const lines = screen.getAllByRole('progressbar');
      expect(lines).toHaveLength(3);
    });

    it('should apply custom font size and line height', () => {
      render(<TextSkeletonPrimitive lines={2} fontSize={18} lineHeight={1.5} />);
      
      const lines = screen.getAllByRole('progressbar');
      expect(lines[0]).toHaveStyle({ height: '27px' }); // 18 * 1.5
    });

    it('should make last line shorter in multi-line', () => {
      render(<TextSkeletonPrimitive lines={3} lastLineWidth="60%" />);
      
      const lines = screen.getAllByRole('progressbar');
      expect(lines[2]).toHaveStyle({ width: '60%' });
      expect(lines[0]).toHaveStyle({ width: '100%' });
      expect(lines[1]).toHaveStyle({ width: '100%' });
    });
  });

  describe('AvatarSkeletonPrimitive', () => {
    it('should render with default size', () => {
      render(<AvatarSkeletonPrimitive />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '40px',
        height: '40px',
        borderRadius: '50%',
      });
      expect(element).toHaveAttribute('aria-label', 'Loading profile picture...');
    });

    it('should apply custom size', () => {
      render(<AvatarSkeletonPrimitive size={64} />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '64px',
        height: '64px',
      });
    });
  });

  describe('ButtonSkeletonPrimitive', () => {
    it('should render with button dimensions', () => {
      render(<ButtonSkeletonPrimitive />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '120px',
        height: '40px',
        borderRadius: '8px',
      });
      expect(element).toHaveAttribute('aria-label', 'Loading button...');
    });

    it('should apply custom dimensions', () => {
      render(<ButtonSkeletonPrimitive width={200} height={48} />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '200px',
        height: '48px',
      });
    });
  });

  describe('ImageSkeletonPrimitive', () => {
    it('should render with default aspect ratio', () => {
      render(<ImageSkeletonPrimitive width={320} />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '320px',
        height: '180px', // 320 / (16/9)
        borderRadius: '8px',
      });
      expect(element).toHaveAttribute('aria-label', 'Loading image...');
    });

    it('should apply custom aspect ratio', () => {
      render(<ImageSkeletonPrimitive width={200} aspectRatio={1} />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveStyle({
        width: '200px',
        height: '200px',
      });
    });
  });

  describe('CardSkeletonPrimitive', () => {
    it('should render card with default layout', () => {
      render(<CardSkeletonPrimitive />);
      
      const card = screen.container.querySelector('.auto-skeleton-card-primitive');
      expect(card).toBeInTheDocument();
      expect(card).toHaveStyle({
        padding: '16px',
        border: '1px solid #eee',
        borderRadius: '8px',
      });
    });

    it('should include avatar when showAvatar is true', () => {
      render(<CardSkeletonPrimitive showAvatar={true} />);
      
      const avatars = screen.getAllByRole('progressbar');
      const avatarElement = avatars.find(el => 
        el.getAttribute('aria-label') === 'Loading profile picture...'
      );
      expect(avatarElement).toBeInTheDocument();
    });

    it('should include image when showImage is true', () => {
      render(<CardSkeletonPrimitive showImage={true} />);
      
      const images = screen.getAllByRole('progressbar');
      const imageElement = images.find(el => 
        el.getAttribute('aria-label') === 'Loading image...'
      );
      expect(imageElement).toBeInTheDocument();
    });

    it('should render custom number of body lines', () => {
      render(<CardSkeletonPrimitive bodyLines={5} showHeader={false} />);
      
      // Should have 5 text lines
      const textElements = screen.getAllByRole('progressbar');
      expect(textElements).toHaveLength(5);
    });
  });

  describe('injectSkeletonCSS', () => {
    it('should inject CSS styles into document head', () => {
      injectSkeletonCSS();
      
      const styleElement = document.getElementById('auto-skeleton-styles');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes auto-skeleton-shimmer');
      expect(styleElement?.textContent).toContain('@keyframes auto-skeleton-pulse');
    });

    it('should not inject styles twice', () => {
      injectSkeletonCSS();
      injectSkeletonCSS();
      
      const styleElements = document.querySelectorAll('#auto-skeleton-styles');
      expect(styleElements).toHaveLength(1);
    });

    it('should handle SSR environment gracefully', () => {
      // Mock server environment
      const originalDocument = global.document;
      delete (global as any).document;

      expect(() => {
        injectSkeletonCSS();
      }).not.toThrow();

      global.document = originalDocument;
    });
  });

  describe('Theme support', () => {
    it('should apply light theme by default', () => {
      render(<SkeletonPrimitive theme="light" />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveClass('auto-skeleton-light');
    });

    it('should apply dark theme', () => {
      render(<SkeletonPrimitive theme="dark" />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveClass('auto-skeleton-dark');
    });

    it('should auto-detect system theme', () => {
      // Mock dark mode preference
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<SkeletonPrimitive theme="auto" />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveClass('auto-skeleton-dark');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SkeletonPrimitive aria-label="Custom loading message" />);
      
      const element = screen.getByRole('progressbar');
      expect(element).toHaveAttribute('aria-busy', 'true');
      expect(element).toHaveAttribute('aria-label', 'Custom loading message');
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      injectSkeletonCSS();
      
      const styleElement = document.getElementById('auto-skeleton-styles');
      expect(styleElement?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(styleElement?.textContent).toContain('animation: none');
    });
  });
});
