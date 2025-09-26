// Main components and hooks
export { useAutoSkeleton, useAutoSkeletonFromComponent, useSkeletonState } from './hooks/useAutoSkeleton';
export { withAutoSkeleton, withAutoSkeletonAdvanced, createSkeletonComponent } from './hocs/withAutoSkeleton';
export {
  AutoSkeleton,
  SkeletonProvider,
  useSkeletonContext,
  SimpleSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
} from './components/AutoSkeleton';

// Import for default export
import { useAutoSkeleton } from './hooks/useAutoSkeleton';
import { withAutoSkeleton } from './hocs/withAutoSkeleton';
import { AutoSkeleton, SkeletonProvider } from './components/AutoSkeleton';
import { SkeletonPrimitives } from './components/primitives';

// Primitive components
export {
  SkeletonPrimitive,
  TextSkeletonPrimitive,
  AvatarSkeletonPrimitive,
  ButtonSkeletonPrimitive,
  ImageSkeletonPrimitive,
  CardSkeletonPrimitive,
  ListSkeletonPrimitive,
  TableSkeletonPrimitive,
  SkeletonPrimitives,
  injectSkeletonCSS,
  skeletonAnimationCSS,
} from './components/primitives';

// Core analysis and generation
export { ComponentAnalyzer } from './core/analyzer';
export { SkeletonGenerator } from './core/generator';
export { DOMmeasurer } from './core/measurer';

// Utilities
export { StyleExtractor } from './utils/styleExtractor';
export { DimensionCalculator } from './utils/dimensionCalculator';
export { AnimationPresets } from './utils/animationPresets';

// Types
export type {
  // Core types
  AnimationType,
  AnimationConfig,
  ThemeType,
  ThemeConfig,
  ElementDimensions,
  ElementStyles,
  AnalyzedElement,
  ElementType,
  
  // Configuration types
  SkeletonElementConfig,
  ComponentAnalysisResult,
  LayoutInfo,
  ComponentMetadata,
  AutoSkeletonOptions,
  SkeletonProviderProps,
  
  // Hook return types
  UseAutoSkeletonReturn,
  UseSkeletonStateReturn,
  
  // HOC types
  WithAutoSkeletonOptions,
  WithAutoSkeletonComponent,
  
  // Engine types
  AnalysisEngineConfig,
  MeasurementResult,
  GeneratorConfig,
  SkeletonGenerationResult,
  
  // Cache types
  CacheEntry,
  CacheManager,
  
  // Error types
  AutoSkeletonError,
  
  // Utility types
  DeepPartial,
  RequireAtLeastOne,
  SupportedElement,
} from './types';

// Constants
export {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_CACHE_SIZE,
  DEFAULT_ANALYSIS_TIMEOUT,
  SUPPORTED_ELEMENTS,
} from './types';

// Version
export const VERSION = '1.0.0';

/**
 * Quick setup function for common use cases
 */
export function quickSetup(theme: 'light' | 'dark' = 'light') {
  return {
    theme: { type: theme },
    animation: { type: 'shimmer' as const, duration: 1500 },
    preserveAspectRatio: true,
    respectUserMotion: true,
    enableCaching: true,
  };
}

/**
 * Validates the package environment
 */
export function validateEnvironment(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check browser environment
  if (typeof window === 'undefined') {
    issues.push('Browser environment required - auto-skeleton requires DOM APIs');
  } else {
    // Check for required APIs
    if (typeof window.getComputedStyle === 'undefined') {
      issues.push('getComputedStyle API not available');
    }
    
    if (typeof Element.prototype.getBoundingClientRect === 'undefined') {
      issues.push('getBoundingClientRect API not available');
    }
    
    if (typeof window.matchMedia === 'undefined') {
      recommendations.push('matchMedia API not available - reduced motion detection disabled');
    }
    
    if (typeof window.requestAnimationFrame === 'undefined') {
      recommendations.push('requestAnimationFrame API not available - may affect performance');
    }
  }

  // Check React environment
  try {
    require('react');
  } catch {
    issues.push('React not found - auto-skeleton requires React 16.8+');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Measures the time taken for skeleton analysis
   */
  measureAnalysisTime: <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    return fn().then(result => ({
      result,
      duration: performance.now() - start,
    }));
  },

  /**
   * Monitors memory usage during skeleton operations
   */
  monitorMemory: (): { used: number; total: number } | null => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      };
    }
    return null;
  },

  /**
   * Creates a performance observer for skeleton operations
   */
  createPerformanceObserver: (callback: (entries: PerformanceEntry[]) => void) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: ['measure', 'mark'] });
      return observer;
    }
    return null;
  },
};

/**
 * Debug utilities for development
 */
export const debugUtils = {
  /**
   * Enables verbose logging for skeleton operations
   */
  enableDebugMode: () => {
    if (typeof window !== 'undefined') {
      (window as any).__AUTO_SKELETON_DEBUG__ = true;
    }
  },

  /**
   * Disables verbose logging
   */
  disableDebugMode: () => {
    if (typeof window !== 'undefined') {
      (window as any).__AUTO_SKELETON_DEBUG__ = false;
    }
  },

  /**
   * Logs debug information if debug mode is enabled
   */
  log: (message: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).__AUTO_SKELETON_DEBUG__) {
      console.log(`[AutoSkeleton] ${message}`, data || '');
    }
  },

  /**
   * Creates a visual overlay showing analyzed elements
   */
  showAnalysisOverlay: (analysisResult: any) => {
    if (typeof document === 'undefined') return;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.id = 'auto-skeleton-debug-overlay';

    analysisResult.elements.forEach((element: any, index: number) => {
      const rect = document.createElement('div');
      rect.style.position = 'absolute';
      rect.style.left = `${element.dimensions.x}px`;
      rect.style.top = `${element.dimensions.y}px`;
      rect.style.width = `${element.dimensions.width}px`;
      rect.style.height = `${element.dimensions.height}px`;
      rect.style.border = '2px solid #ff6b6b';
      rect.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
      rect.style.fontSize = '12px';
      rect.style.color = '#ff6b6b';
      rect.style.padding = '2px';
      rect.textContent = `${element.elementType} #${index}`;
      overlay.appendChild(rect);
    });

    document.body.appendChild(overlay);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const existingOverlay = document.getElementById('auto-skeleton-debug-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    }, 5000);
  },
};

/**
 * Default export for convenience
 */
export default {
  // Main hooks and components
  useAutoSkeleton,
  withAutoSkeleton,
  AutoSkeleton,
  SkeletonProvider,
  
  // Primitives
  SkeletonPrimitives,
  
  // Utilities
  quickSetup,
  validateEnvironment,
  performanceUtils,
  debugUtils,
  
  // Constants
  VERSION,
};
