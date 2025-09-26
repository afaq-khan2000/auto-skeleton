import React from 'react';
import { AnimationConfig, ElementType } from '@/types';

// CSS Animation styles - these would be injected into the document head
export const skeletonAnimationCSS = `
@keyframes auto-skeleton-shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes auto-skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes auto-skeleton-wave {
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: skewX(-20deg);
  }
}

@keyframes auto-skeleton-fade {
  0%, 50% {
    opacity: 0.3;
  }
  25%, 75% {
    opacity: 1;
  }
}

.auto-skeleton-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
  background-size: 400px 100%;
  animation: auto-skeleton-shimmer 1.5s ease-in-out infinite;
}

.auto-skeleton-shimmer-dark {
  background: linear-gradient(90deg, #2d2d2d 25%, #1a1a1a 37%, #2d2d2d 63%);
  background-size: 400px 100%;
  animation: auto-skeleton-shimmer 1.5s ease-in-out infinite;
}

.auto-skeleton-pulse {
  animation: auto-skeleton-pulse 1.5s ease-in-out infinite;
}

.auto-skeleton-wave {
  animation: auto-skeleton-wave 1.5s ease-in-out infinite;
}

.auto-skeleton-fade {
  animation: auto-skeleton-fade 2s ease-in-out infinite;
}

/* Accessibility: Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .auto-skeleton-shimmer,
  .auto-skeleton-pulse,
  .auto-skeleton-wave,
  .auto-skeleton-fade {
    animation: none;
  }
}

/* Theme variations */
.auto-skeleton-light {
  background-color: #f0f0f0;
}

.auto-skeleton-dark {
  background-color: #2d2d2d;
}
`;

/**
 * Injects skeleton CSS into document head
 */
export function injectSkeletonCSS() {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('auto-skeleton-styles');
  if (existingStyle) return; // Already injected

  const style = document.createElement('style');
  style.id = 'auto-skeleton-styles';
  style.textContent = skeletonAnimationCSS;
  document.head.appendChild(style);
}

/**
 * Base skeleton primitive component
 */
interface SkeletonPrimitiveProps {
  width?: number | string;
  height?: number | string;
  shape?: 'rectangular' | 'circular' | 'rounded';
  animation?: AnimationConfig;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'aria-label'?: string;
}

export function SkeletonPrimitive({
  width = '100%',
  height = 20,
  shape = 'rectangular',
  animation = { type: 'shimmer', duration: 1500 },
  theme = 'light',
  className = '',
  style = {},
  children,
  'aria-label': ariaLabel = 'Loading...',
}: SkeletonPrimitiveProps) {
  // Inject CSS on first use
  React.useEffect(() => {
    injectSkeletonCSS();
  }, []);

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

  const getAnimationClass = () => {
    if (animation.type === 'none') return '';
    
    const baseClass = `auto-skeleton-${animation.type}`;
    if (animation.type === 'shimmer') {
      return theme === 'dark' ? `${baseClass}-dark` : baseClass;
    }
    return baseClass;
  };

  const getThemeClass = () => {
    if (theme === 'auto') {
      // Detect system theme
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'auto-skeleton-dark'
          : 'auto-skeleton-light';
      }
    }
    return `auto-skeleton-${theme}`;
  };

  const animationStyle = animation.type !== 'none' ? {
    animationDuration: `${animation.duration || 1500}ms`,
    animationDirection: animation.direction || 'normal',
    animationDelay: `${animation.delay || 0}ms`,
  } : {};

  return (
    <div
      className={`auto-skeleton-primitive ${getAnimationClass()} ${getThemeClass()} ${className}`}
      style={{
        width,
        height,
        borderRadius: getBorderRadius(),
        display: 'inline-block',
        verticalAlign: 'top',
        ...animationStyle,
        ...style,
      }}
      aria-busy="true"
      aria-label={ariaLabel}
      role="progressbar"
    >
      {children}
    </div>
  );
}

/**
 * Text skeleton primitive
 */
interface TextSkeletonPrimitiveProps extends Omit<SkeletonPrimitiveProps, 'shape'> {
  lines?: number;
  fontSize?: number;
  lineHeight?: number;
  lastLineWidth?: string;
}

export function TextSkeletonPrimitive({
  lines = 1,
  fontSize = 16,
  lineHeight = 1.2,
  lastLineWidth = '70%',
  ...props
}: TextSkeletonPrimitiveProps) {
  const lineHeightPx = fontSize * lineHeight;

  if (lines === 1) {
    return (
      <SkeletonPrimitive
        {...props}
        height={lineHeightPx}
        shape="rectangular"
      />
    );
  }

  return (
    <div className="auto-skeleton-text-primitive">
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonPrimitive
          key={index}
          {...props}
          width={index === lines - 1 ? lastLineWidth : props.width || '100%'}
          height={lineHeightPx}
          shape="rectangular"
          style={{
            ...props.style,
            marginBottom: index < lines - 1 ? '4px' : '0',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton primitive
 */
interface AvatarSkeletonPrimitiveProps extends Omit<SkeletonPrimitiveProps, 'shape' | 'width' | 'height'> {
  size?: number;
}

export function AvatarSkeletonPrimitive({
  size = 40,
  ...props
}: AvatarSkeletonPrimitiveProps) {
  return (
    <SkeletonPrimitive
      {...props}
      width={size}
      height={size}
      shape="circular"
      aria-label="Loading profile picture..."
    />
  );
}

/**
 * Button skeleton primitive
 */
interface ButtonSkeletonPrimitiveProps extends SkeletonPrimitiveProps {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function ButtonSkeletonPrimitive({
  variant = 'primary',
  height = 40,
  width = 120,
  ...props
}: ButtonSkeletonPrimitiveProps) {
  return (
    <SkeletonPrimitive
      {...props}
      width={width}
      height={height}
      shape="rounded"
      aria-label="Loading button..."
    />
  );
}

/**
 * Image skeleton primitive
 */
interface ImageSkeletonPrimitiveProps extends SkeletonPrimitiveProps {
  aspectRatio?: number; // width/height ratio
}

export function ImageSkeletonPrimitive({
  aspectRatio = 16/9,
  width = 200,
  ...props
}: ImageSkeletonPrimitiveProps) {
  const calculatedHeight = typeof width === 'number' ? width / aspectRatio : 150;

  return (
    <SkeletonPrimitive
      {...props}
      width={width}
      height={calculatedHeight}
      shape="rounded"
      aria-label="Loading image..."
    />
  );
}

/**
 * Card skeleton primitive
 */
interface CardSkeletonPrimitiveProps extends Omit<SkeletonPrimitiveProps, 'children'> {
  showHeader?: boolean;
  showAvatar?: boolean;
  showImage?: boolean;
  headerLines?: number;
  bodyLines?: number;
  padding?: number | string;
}

export function CardSkeletonPrimitive({
  showHeader = true,
  showAvatar = true,
  showImage = false,
  headerLines = 1,
  bodyLines = 3,
  padding = 16,
  width = '100%',
  height = 'auto',
  ...props
}: CardSkeletonPrimitiveProps) {
  return (
    <div
      className="auto-skeleton-card-primitive"
      style={{
        width,
        padding,
        border: '1px solid #eee',
        borderRadius: '8px',
        backgroundColor: 'transparent',
      }}
    >
      {/* Header */}
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          {showAvatar && <AvatarSkeletonPrimitive size={32} {...props} />}
          <div style={{ marginLeft: showAvatar ? '12px' : '0', flex: 1 }}>
            <TextSkeletonPrimitive
              {...props}
              lines={headerLines}
              width="60%"
              fontSize={14}
            />
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <ImageSkeletonPrimitive
          {...props}
          width="100%"
          aspectRatio={16/9}
          style={{ marginBottom: '12px' }}
        />
      )}

      {/* Body text */}
      <TextSkeletonPrimitive
        {...props}
        lines={bodyLines}
        fontSize={14}
      />
    </div>
  );
}

/**
 * List skeleton primitive
 */
interface ListSkeletonPrimitiveProps extends Omit<SkeletonPrimitiveProps, 'children'> {
  items?: number;
  itemHeight?: number;
  showAvatar?: boolean;
  spacing?: number;
}

export function ListSkeletonPrimitive({
  items = 5,
  itemHeight = 60,
  showAvatar = false,
  spacing = 8,
  ...props
}: ListSkeletonPrimitiveProps) {
  return (
    <div className="auto-skeleton-list-primitive">
      {Array.from({ length: items }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: itemHeight,
            marginBottom: index < items - 1 ? spacing : 0,
          }}
        >
          {showAvatar && (
            <AvatarSkeletonPrimitive
              {...props}
              size={32}
              style={{ marginRight: '12px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <TextSkeletonPrimitive
              {...props}
              lines={2}
              fontSize={14}
              lastLineWidth="60%"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton primitive
 */
interface TableSkeletonPrimitiveProps extends Omit<SkeletonPrimitiveProps, 'children'> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  rowHeight?: number;
  cellPadding?: number;
}

export function TableSkeletonPrimitive({
  rows = 5,
  columns = 4,
  showHeader = true,
  rowHeight = 48,
  cellPadding = 12,
  ...props
}: TableSkeletonPrimitiveProps) {
  return (
    <div className="auto-skeleton-table-primitive" style={{ width: '100%' }}>
      {/* Header */}
      {showHeader && (
        <div
          style={{
            display: 'flex',
            height: rowHeight,
            borderBottom: '1px solid #eee',
            marginBottom: '8px',
          }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <div
              key={`header-${colIndex}`}
              style={{
                flex: 1,
                padding: `0 ${cellPadding}px`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SkeletonPrimitive
                {...props}
                width="80%"
                height={16}
                shape="rectangular"
              />
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          style={{
            display: 'flex',
            height: rowHeight,
            marginBottom: '4px',
          }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              style={{
                flex: 1,
                padding: `0 ${cellPadding}px`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SkeletonPrimitive
                {...props}
                width={colIndex === 0 ? '90%' : '70%'}
                height={14}
                shape="rectangular"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Export all primitives
export const SkeletonPrimitives = {
  Base: SkeletonPrimitive,
  Text: TextSkeletonPrimitive,
  Avatar: AvatarSkeletonPrimitive,
  Button: ButtonSkeletonPrimitive,
  Image: ImageSkeletonPrimitive,
  Card: CardSkeletonPrimitive,
  List: ListSkeletonPrimitive,
  Table: TableSkeletonPrimitive,
};
