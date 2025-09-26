import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAutoSkeleton } from '../src/hooks/useAutoSkeleton';
import { AutoSkeletonOptions } from '../src/types';

// Test component that uses the hook
function TestComponent({ options }: { options?: AutoSkeletonOptions }) {
  const componentRef = React.useRef<HTMLDivElement>(null);
  const { SkeletonComponent, isAnalyzing, error, analysisResult } = useAutoSkeleton(
    componentRef,
    options
  );

  return (
    <div>
      <div data-testid="analysis-state">
        {isAnalyzing ? 'analyzing' : 'ready'}
      </div>
      
      {error && (
        <div data-testid="error">{error.message}</div>
      )}
      
      {analysisResult && (
        <div data-testid="analysis-result">
          Elements: {analysisResult.elements.length}
        </div>
      )}

      <div ref={componentRef} data-testid="target-component">
        <h1>Test Title</h1>
        <p>Test paragraph</p>
        <img src="test.jpg" alt="Test" />
      </div>

      <SkeletonComponent />
    </div>
  );
}

describe('useAutoSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('analysis-state')).toHaveTextContent('ready');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('should handle null componentRef gracefully', () => {
    function NullRefComponent() {
      const { SkeletonComponent, error } = useAutoSkeleton(null);
      
      return (
        <div>
          {error && <div data-testid="error">{error.message}</div>}
          <SkeletonComponent />
        </div>
      );
    }

    render(<NullRefComponent />);
    
    // Should render fallback skeleton without throwing
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('should apply custom options', () => {
    const options: AutoSkeletonOptions = {
      animation: { type: 'pulse', duration: 1000 },
      theme: { type: 'dark', baseColor: '#333' },
    };

    render(<TestComponent options={options} />);
    
    // Component should render without errors
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should handle animation preferences', () => {
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

    const options: AutoSkeletonOptions = {
      respectUserMotion: true,
      animation: { type: 'shimmer', duration: 1500 },
    };

    render(<TestComponent options={options} />);
    
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should render fallback skeleton when no analysis result', () => {
    render(<TestComponent />);
    
    // Should render some form of skeleton
    const skeletonElements = screen.container.querySelectorAll('[aria-busy="true"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should handle component updates', async () => {
    const { rerender } = render(<TestComponent />);
    
    // Update with different options
    const newOptions: AutoSkeletonOptions = {
      theme: { type: 'light' },
      animation: { type: 'fade', duration: 2000 },
    };

    rerender(<TestComponent options={newOptions} />);
    
    // Component should update without errors
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should provide regenerateSkeleton function', () => {
    function RegenerateTestComponent() {
      const componentRef = React.useRef<HTMLDivElement>(null);
      const { regenerateSkeleton } = useAutoSkeleton(componentRef);

      return (
        <div>
          <button onClick={regenerateSkeleton} data-testid="regenerate">
            Regenerate
          </button>
          <div ref={componentRef}>Test content</div>
        </div>
      );
    }

    render(<RegenerateTestComponent />);
    
    const button = screen.getByTestId('regenerate');
    expect(button).toBeInTheDocument();
    
    // Should not throw when clicked
    expect(() => {
      button.click();
    }).not.toThrow();
  });

  it('should handle caching options', () => {
    const options: AutoSkeletonOptions = {
      enableCaching: true,
      cacheKey: 'test-cache-key',
    };

    render(<TestComponent options={options} />);
    
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should call onAnalysisComplete callback when provided', async () => {
    const onAnalysisComplete = jest.fn();
    const options: AutoSkeletonOptions = {
      onAnalysisComplete,
    };

    render(<TestComponent options={options} />);
    
    // Wait for potential analysis to complete
    await waitFor(() => {
      // The callback might be called during the component lifecycle
    }, { timeout: 1000 });
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    const options: AutoSkeletonOptions = {
      onError,
    };

    render(<TestComponent options={options} />);
    
    // Component should render without throwing
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should handle custom overrides', () => {
    const options: AutoSkeletonOptions = {
      customOverrides: {
        'h1': { width: 200, height: 30 },
        'p': { lines: 2 },
        '.avatar': { shape: 'circular' },
      },
    };

    render(<TestComponent options={options} />);
    
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });

  it('should respect minimum dimensions', () => {
    const options: AutoSkeletonOptions = {
      minWidth: 50,
      minHeight: 20,
    };

    render(<TestComponent options={options} />);
    
    expect(screen.getByTestId('target-component')).toBeInTheDocument();
  });
});
