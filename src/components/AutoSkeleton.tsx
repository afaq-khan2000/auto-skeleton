import React, { createContext, useContext, ReactElement, cloneElement } from 'react';
import { useAutoSkeleton } from '@/hooks/useAutoSkeleton';
import {
  AutoSkeletonOptions,
  SkeletonProviderProps,
  ThemeConfig,
  AnimationConfig,
} from '@/types';

// Context for global skeleton configuration
interface SkeletonContextValue {
  defaultTheme: ThemeConfig;
  defaultAnimation: AnimationConfig;
  globalOptions: Partial<AutoSkeletonOptions>;
}

const SkeletonContext = createContext<SkeletonContextValue | undefined>(undefined);

/**
 * Provider component for global skeleton configuration
 */
export function SkeletonProvider({ 
  children, 
  defaultTheme = { type: 'light' },
  defaultAnimation = { type: 'shimmer', duration: 1500 },
  globalOptions = {}
}: SkeletonProviderProps) {
  const value: SkeletonContextValue = {
    defaultTheme,
    defaultAnimation,
    globalOptions,
  };

  return (
    <SkeletonContext.Provider value={value}>
      {children}
    </SkeletonContext.Provider>
  );
}

/**
 * Hook to access skeleton context
 */
export function useSkeletonContext(): SkeletonContextValue {
  const context = useContext(SkeletonContext);
  
  if (!context) {
    // Return default values if no provider
    return {
      defaultTheme: { type: 'light' },
      defaultAnimation: { type: 'shimmer', duration: 1500 },
      globalOptions: {},
    };
  }
  
  return context;
}

/**
 * Main AutoSkeleton component for declarative usage
 */
interface AutoSkeletonProps {
  /**
   * The component to analyze and create skeleton for
   */
  children: ReactElement;
  
  /**
   * Whether to show the skeleton (loading state)
   */
  loading?: boolean;
  
  /**
   * Custom skeleton options
   */
  options?: AutoSkeletonOptions;
  
  /**
   * Fallback skeleton to show while analyzing
   */
  fallback?: ReactElement;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}

export function AutoSkeleton({
  children,
  loading = false,
  options = {},
  fallback,
  className,
  style,
}: AutoSkeletonProps) {
  const context = useSkeletonContext();
  const componentRef = React.useRef<HTMLElement>(null);
  
  // Merge context options with prop options
  const mergedOptions: AutoSkeletonOptions = {
    ...context.globalOptions,
    theme: { ...context.defaultTheme, ...options.theme },
    animation: { ...context.defaultAnimation, ...options.animation },
    ...options,
  };

  const {
    SkeletonComponent,
    isAnalyzing,
    error,
    analysisResult,
  } = useAutoSkeleton(componentRef, mergedOptions);

  // Clone the child element to add ref
  const childWithRef = React.cloneElement(children, {
    ref: (element: HTMLElement) => {
      // Use type assertion to assign to current
      (componentRef as React.MutableRefObject<HTMLElement | null>).current = element;
      
      // Preserve original ref if exists
      const originalRef = (children as any).ref;
      if (typeof originalRef === 'function') {
        originalRef(element);
      } else if (originalRef) {
        originalRef.current = element;
      }
    },
  });

  // Show skeleton during loading
  if (loading) {
    // If analysis is complete and no errors, show generated skeleton
    if (analysisResult && !error) {
      return (
        <div className={className} style={style}>
          <SkeletonComponent />
        </div>
      );
    }
    
    // Show fallback during analysis or on error
    if (fallback) {
      return (
        <div className={className} style={style}>
          {fallback}
        </div>
      );
    }
    
    // Default fallback skeleton
    return (
      <div 
        className={`auto-skeleton-default-fallback ${className || ''}`}
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: mergedOptions.theme?.baseColor || '#e0e0e0',
          borderRadius: '4px',
          animation: 'auto-skeleton-shimmer 1500ms infinite',
          ...style,
        }}
        aria-busy="true"
        aria-label="Loading content..."
      />
    );
  }

  // Show the actual component
  return (
    <div className={className} style={style}>
      {childWithRef}
    </div>
  );
}

/**
 * Simple skeleton component for manual use
 */
interface SimpleSkeletonProps {
  width?: number | string;
  height?: number | string;
  shape?: 'rectangular' | 'circular' | 'rounded';
  animation?: AnimationConfig;
  className?: string;
  style?: React.CSSProperties;
}

export function SimpleSkeleton({
  width = '100%',
  height = 20,
  shape = 'rectangular',
  animation,
  className,
  style,
}: SimpleSkeletonProps) {
  const context = useSkeletonContext();
  const animationConfig = animation || context.defaultAnimation;
  
  const getBorderRadius = () => {
    switch (shape) {
      case 'circular':
        return '50%';
      case 'rounded':
        return '8px';
      default:
        return '4px';
    }
  };

  const getAnimation = () => {
    if (animationConfig.type === 'none') return 'none';
    return `auto-skeleton-${animationConfig.type} ${animationConfig.duration || 1500}ms infinite`;
  };

  return (
    <div
      className={`auto-skeleton-simple ${className || ''}`}
      style={{
        width,
        height,
        backgroundColor: context.defaultTheme.baseColor || '#e0e0e0',
        borderRadius: getBorderRadius(),
        animation: getAnimation(),
        ...style,
      }}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
interface TextSkeletonProps {
  lines?: number;
  fontSize?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TextSkeleton({
  lines = 3,
  fontSize = 16,
  lineHeight = 1.2,
  lastLineWidth = '70%',
  className,
  style,
}: TextSkeletonProps) {
  const context = useSkeletonContext();
  const lineHeightPx = fontSize * lineHeight;

  return (
    <div
      className={`auto-skeleton-text-container ${className || ''}`}
      style={{ ...style }}
    >
      {Array.from({ length: lines }, (_, index) => (
        <SimpleSkeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeightPx}
          style={{
            marginBottom: index < lines - 1 ? '4px' : '0',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
interface AvatarSkeletonProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AvatarSkeleton({
  size = 40,
  className,
  style,
}: AvatarSkeletonProps) {
  return (
    <SimpleSkeleton
      width={size}
      height={size}
      shape="circular"
      className={`auto-skeleton-avatar ${className || ''}`}
      style={style}
    />
  );
}

/**
 * Card skeleton with common layout
 */
interface CardSkeletonProps {
  showAvatar?: boolean;
  showImage?: boolean;
  titleLines?: number;
  bodyLines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CardSkeleton({
  showAvatar = true,
  showImage = false,
  titleLines = 1,
  bodyLines = 3,
  className,
  style,
}: CardSkeletonProps) {
  return (
    <div
      className={`auto-skeleton-card ${className || ''}`}
      style={{
        padding: '16px',
        border: '1px solid #eee',
        borderRadius: '8px',
        ...style,
      }}
    >
      {/* Header with avatar */}
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <AvatarSkeleton size={32} />
          <div style={{ marginLeft: '12px', flex: 1 }}>
            <SimpleSkeleton width="60%" height={14} />
          </div>
        </div>
      )}
      
      {/* Image */}
      {showImage && (
        <SimpleSkeleton
          width="100%"
          height={200}
          shape="rounded"
          style={{ marginBottom: '12px' }}
        />
      )}
      
      {/* Title */}
      <TextSkeleton
        lines={titleLines}
        fontSize={18}
        style={{ marginBottom: '8px' }}
      />
      
      {/* Body */}
      <TextSkeleton lines={bodyLines} fontSize={14} />
    </div>
  );
}
