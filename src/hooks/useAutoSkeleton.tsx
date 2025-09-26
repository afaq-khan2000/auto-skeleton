import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ComponentAnalyzer } from '@/core/analyzer';
import { SkeletonGenerator } from '@/core/generator';
import {
  UseAutoSkeletonReturn,
  ComponentAnalysisResult,
  AutoSkeletonOptions,
  AutoSkeletonError,
} from '@/types';

/**
 * Primary hook for generating skeleton loaders from React components
 */
export function useAutoSkeleton(
  componentRef: React.RefObject<HTMLElement> | null,
  options: AutoSkeletonOptions = {}
): UseAutoSkeletonReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComponentAnalysisResult | null>(null);
  
  // Create stable instances
  const analyzer = useMemo(() => new ComponentAnalyzer(), []);
  const generator = useMemo(() => new SkeletonGenerator(
    options.theme,
    options.animation
  ), [options.theme, options.animation]);

  // Cache key for memoization
  const cacheKey = useMemo(() => {
    if (!options.enableCaching) return null;
    return options.cacheKey || `auto-skeleton-${Math.random().toString(36).substr(2, 9)}`;
  }, [options.enableCaching, options.cacheKey]);

  /**
   * Performs component analysis
   */
  const analyzeComponent = useCallback(async () => {
    if (!componentRef?.current) {
      setError(new AutoSkeletonError('Component ref is not available', 'REF_NOT_AVAILABLE'));
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzer.analyzeComponent(componentRef, {
        componentName: options.onAnalysisComplete?.name,
        timeout: 5000,
      });

      setAnalysisResult(result);
      
      // Call onAnalysisComplete callback if provided
      options.onAnalysisComplete?.(result);
      
      return result;
    } catch (err) {
      const error = err instanceof AutoSkeletonError 
        ? err 
        : new AutoSkeletonError(
            `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            'ANALYSIS_ERROR'
          );
      
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [componentRef, analyzer, options]);

  /**
   * Generates skeleton component
   */
  const SkeletonComponent = useMemo(() => {
    if (!analysisResult || error) {
      // Return a simple fallback skeleton
      return () => (
        <div 
          className="auto-skeleton-fallback"
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: options.theme?.baseColor || '#e0e0e0',
            borderRadius: '4px',
            animation: 'auto-skeleton-shimmer 1500ms infinite',
          }}
          aria-busy="true"
          aria-label="Loading content..."
        />
      );
    }

    try {
      const generationResult = generator.generateSkeleton(analysisResult, options);
      return () => generationResult.component;
    } catch (err) {
      // Return fallback on generation error
      return () => (
        <div 
          className="auto-skeleton-error"
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
          Skeleton generation failed
        </div>
      );
    }
  }, [analysisResult, error, generator, options]);

  /**
   * Regenerates skeleton (useful for dynamic content)
   */
  const regenerateSkeleton = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    analyzeComponent();
  }, [analyzeComponent]);

  // Auto-analyze when component ref is available
  useEffect(() => {
    if (componentRef?.current && !analysisResult && !isAnalyzing) {
      // Small delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        analyzeComponent();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [componentRef, analysisResult, isAnalyzing, analyzeComponent]);

  // Handle options changes
  useEffect(() => {
    if (analysisResult && options) {
      // Update generator configuration
      if (options.theme) generator.updateTheme(options.theme);
      if (options.animation) generator.updateAnimation(options.animation);
    }
  }, [options, generator, analysisResult]);

  return {
    SkeletonComponent,
    isAnalyzing,
    error,
    analysisResult,
    regenerateSkeleton,
  };
}

/**
 * Hook variant that takes a component type instead of ref
 */
export function useAutoSkeletonFromComponent<T = any>(
  Component: React.ComponentType<T>,
  props: T,
  options: AutoSkeletonOptions = {}
): UseAutoSkeletonReturn {
  const componentRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Create a wrapper component to get the ref
  const WrappedComponent = useMemo(() => {
    return React.forwardRef<HTMLElement, T>((componentProps, ref) => 
      React.createElement(Component as any, {
        ...componentProps,
        ref,
      })
    );
  }, [Component]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const result = useAutoSkeleton(componentRef, options);

  // Render the component to get measurements (hidden)
  useEffect(() => {
    if (isMounted && componentRef.current) {
      // The component is now mounted and ref is available
      result.regenerateSkeleton();
    }
  }, [isMounted, result]);

  return result;
}

/**
 * Hook for managing skeleton loading state
 */
export function useSkeletonState(initialLoading: boolean = false) {
  const [isLoading, setLoading] = useState(initialLoading);

  const toggleLoading = useCallback(() => {
    setLoading(prev => !prev);
  }, []);

  return {
    isLoading,
    setLoading,
    toggleLoading,
  };
}
