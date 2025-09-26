import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useAutoSkeleton } from '@/hooks/useAutoSkeleton';
import {
  WithAutoSkeletonOptions,
  WithAutoSkeletonComponent,
  AutoSkeletonError,
} from '@/types';

/**
 * Higher-Order Component that adds auto-skeleton functionality to any React component
 */
export function withAutoSkeleton<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAutoSkeletonOptions = {}
): WithAutoSkeletonComponent<P> {
  const {
    fallback,
    loadingProp = 'loading',
    ...skeletonOptions
  } = options;

  const WithAutoSkeletonComponent = forwardRef<any, P & { [K in string]?: boolean }>((props, ref) => {
    const componentRef = useRef<HTMLElement>(null);
    const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
    const [isComponentMounted, setIsComponentMounted] = useState(false);

    // Extract loading state from props
    const isLoading = props[loadingProp as keyof typeof props] as boolean;

    const {
      SkeletonComponent,
      isAnalyzing,
      error,
      analysisResult,
      regenerateSkeleton,
    } = useAutoSkeleton(componentRef, skeletonOptions);

    // Handle component mounting
    useEffect(() => {
      if (componentRef.current) {
        setIsComponentMounted(true);
      }
    }, []);

    // Determine when to show skeleton
    useEffect(() => {
      if (isLoading) {
        setShouldShowSkeleton(true);
      } else {
        // Small delay before hiding skeleton to prevent flashing
        const timer = setTimeout(() => {
          setShouldShowSkeleton(false);
        }, 50);
        
        return () => clearTimeout(timer);
      }
    }, [isLoading]);

    // Handle error reporting
    useEffect(() => {
      if (error && skeletonOptions.onError) {
        skeletonOptions.onError(error);
      }
    }, [error]);

    // Render loading state
    if (shouldShowSkeleton) {
      // If we have analysis results, show generated skeleton
      if (analysisResult && !error) {
        return <SkeletonComponent />;
      }
      
      // If analysis is still in progress, show fallback or simple skeleton
      if (isAnalyzing || !isComponentMounted) {
        if (fallback) {
          return fallback;
        }
        
        return (
          <div 
            className="auto-skeleton-hoc-fallback"
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: skeletonOptions.theme?.baseColor || '#e0e0e0',
              borderRadius: '4px',
              animation: 'auto-skeleton-shimmer 1500ms infinite',
            }}
            aria-busy="true"
            aria-label="Loading content..."
          />
        );
      }

      // If there's an error, show fallback or error state
      if (error) {
        if (fallback) {
          return fallback;
        }
        
        return (
          <div 
            className="auto-skeleton-hoc-error"
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: '#f5f5f5',
              border: '1px dashed #ccc',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
            }}
          >
            Skeleton loading failed
          </div>
        );
      }

      // Show generated skeleton if available
      return <SkeletonComponent />;
    }

    // Render the actual component with measurement capabilities
    return (
      <>
        <WrappedComponent
          {...(props as P)}
          ref={(element: HTMLElement) => {
            // Handle ref forwarding
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
            
            // Set our internal ref for measurement
            (componentRef as React.MutableRefObject<HTMLElement | null>).current = element;
          }}
        />
        
        {/* Hidden measurement component - only rendered once for analysis */}
        {!analysisResult && !isAnalyzing && !error && (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <WrappedComponent
              {...(props as P)}
              ref={componentRef}
            />
          </div>
        )}
      </>
    );
  });

  // Set display name for debugging
  WithAutoSkeletonComponent.displayName = `withAutoSkeleton(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAutoSkeletonComponent as unknown as WithAutoSkeletonComponent<P>;
}

/**
 * Enhanced HOC with additional configuration options
 */
export function withAutoSkeletonAdvanced<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAutoSkeletonOptions & {
    analysisDelay?: number;
    retryAttempts?: number;
    enableDevTools?: boolean;
    customLoadingCheck?: (props: P) => boolean;
  } = {}
): WithAutoSkeletonComponent<P> {
  const {
    analysisDelay = 100,
    retryAttempts = 3,
    enableDevTools = false,
    customLoadingCheck,
    ...baseOptions
  } = options;

  const WithAutoSkeletonAdvancedComponent = forwardRef<any, P & { [K in string]?: boolean }>((props, ref) => {
    const [retryCount, setRetryCount] = useState(0);
    
    // Use custom loading check if provided
    const isLoading = customLoadingCheck 
      ? customLoadingCheck(props as P)
      : props[baseOptions.loadingProp || 'loading' as keyof typeof props] as boolean;

    const componentRef = useRef<HTMLElement>(null);
    
    const {
      SkeletonComponent,
      isAnalyzing,
      error,
      analysisResult,
      regenerateSkeleton,
    } = useAutoSkeleton(componentRef, {
      ...baseOptions,
      onError: (error) => {
        baseOptions.onError?.(error);
        
        // Retry on error if attempts remaining
        if (retryCount < retryAttempts) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            regenerateSkeleton();
          }, 1000 * (retryCount + 1)); // Exponential backoff
        }
        
        // Dev tools logging
        if (enableDevTools) {
          console.warn('[AutoSkeleton] Analysis error:', error);
        }
      },
      onAnalysisComplete: (result) => {
        baseOptions.onAnalysisComplete?.(result);
        setRetryCount(0); // Reset retry count on success
        
        // Dev tools logging
        if (enableDevTools) {
          console.log('[AutoSkeleton] Analysis complete:', result);
        }
      }
    });

    // Show loading skeleton
    if (isLoading) {
      return <SkeletonComponent />;
    }

    // Render component with delayed analysis
    return (
      <div style={{ position: 'relative' }}>
        <WrappedComponent
          {...(props as P)}
          ref={(element: HTMLElement) => {
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
            
            // Delayed analysis to ensure component is stable
            if (element && !analysisResult && !isAnalyzing) {
              setTimeout(() => {
                (componentRef as React.MutableRefObject<HTMLElement | null>).current = element;
                regenerateSkeleton();
              }, analysisDelay);
            }
          }}
        />
        
        {/* Dev tools indicator */}
        {enableDevTools && (isAnalyzing || error) && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: error ? '#ff4444' : '#4444ff',
              color: 'white',
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '0 0 0 4px',
              zIndex: 9999,
            }}
          >
            {error ? `Error (${retryCount}/${retryAttempts})` : 'Analyzing...'}
          </div>
        )}
      </div>
    );
  });

  WithAutoSkeletonAdvancedComponent.displayName = `withAutoSkeletonAdvanced(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAutoSkeletonAdvancedComponent as unknown as WithAutoSkeletonComponent<P>;
}

/**
 * Utility function to create a skeleton-enabled component with default options
 */
export function createSkeletonComponent<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  defaultTheme?: 'light' | 'dark'
) {
  return withAutoSkeleton(WrappedComponent, {
    theme: { type: defaultTheme || 'light' },
    animation: { type: 'shimmer', duration: 1500 },
    preserveAspectRatio: true,
    respectUserMotion: true,
  });
}
