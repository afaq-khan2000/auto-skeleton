# Auto-Skeleton API Reference

## Table of Contents
- [Hooks](#hooks)
- [Components](#components)
- [HOCs](#hocs)
- [Primitives](#primitives)
- [Utilities](#utilities)
- [Types](#types)

## Hooks

### useAutoSkeleton

Primary hook for generating skeleton loaders from React components.

```typescript
function useAutoSkeleton(
  componentRef: React.RefObject<HTMLElement> | null,
  options?: AutoSkeletonOptions
): UseAutoSkeletonReturn
```

**Parameters:**
- `componentRef`: Reference to the component element to analyze
- `options`: Configuration options for skeleton generation

**Returns:**
```typescript
interface UseAutoSkeletonReturn {
  SkeletonComponent: ComponentType<any>;
  isAnalyzing: boolean;
  error: Error | null;
  analysisResult: ComponentAnalysisResult | null;
  regenerateSkeleton: () => void;
}
```

**Example:**
```typescript
const componentRef = useRef<HTMLDivElement>(null);
const { SkeletonComponent } = useAutoSkeleton(componentRef, {
  animation: { type: 'shimmer', duration: 1500 },
  theme: { type: 'light' }
});
```

### useSkeletonState

Hook for managing skeleton loading state.

```typescript
function useSkeletonState(initialLoading?: boolean): UseSkeletonStateReturn
```

**Returns:**
```typescript
interface UseSkeletonStateReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
}
```

## Components

### AutoSkeleton

Declarative component for skeleton generation.

```typescript
interface AutoSkeletonProps {
  children: ReactElement;
  loading?: boolean;
  options?: AutoSkeletonOptions;
  fallback?: ReactElement;
  className?: string;
  style?: React.CSSProperties;
}
```

**Example:**
```typescript
<AutoSkeleton loading={isLoading} options={quickSetup('light')}>
  <MyComponent />
</AutoSkeleton>
```

### SkeletonProvider

Context provider for global skeleton configuration.

```typescript
interface SkeletonProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  defaultAnimation?: AnimationConfig;
  globalOptions?: Partial<AutoSkeletonOptions>;
}
```

### SimpleSkeleton

Basic skeleton element for manual use.

```typescript
interface SimpleSkeletonProps {
  width?: number | string;
  height?: number | string;
  shape?: 'rectangular' | 'circular' | 'rounded';
  animation?: AnimationConfig;
  className?: string;
  style?: React.CSSProperties;
}
```

### TextSkeleton

Multi-line text skeleton.

```typescript
interface TextSkeletonProps {
  lines?: number;
  fontSize?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

### AvatarSkeleton

Circular skeleton for avatars.

```typescript
interface AvatarSkeletonProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}
```

### CardSkeleton

Complete card layout skeleton.

```typescript
interface CardSkeletonProps {
  showAvatar?: boolean;
  showImage?: boolean;
  titleLines?: number;
  bodyLines?: number;
  className?: string;
  style?: React.CSSProperties;
}
```

## HOCs

### withAutoSkeleton

Higher-Order Component that adds skeleton functionality.

```typescript
function withAutoSkeleton<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAutoSkeletonOptions
): WithAutoSkeletonComponent<P>
```

**Example:**
```typescript
const MyComponentWithSkeleton = withAutoSkeleton(MyComponent, {
  theme: { type: 'light' },
  animation: { type: 'pulse' }
});
```

### withAutoSkeletonAdvanced

Enhanced HOC with additional features.

```typescript
function withAutoSkeletonAdvanced<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAutoSkeletonOptions & {
    analysisDelay?: number;
    retryAttempts?: number;
    enableDevTools?: boolean;
    customLoadingCheck?: (props: P) => boolean;
  }
): WithAutoSkeletonComponent<P>
```

## Primitives

### SkeletonPrimitive

Base skeleton component.

```typescript
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
```

### Specialized Primitives

- `TextSkeletonPrimitive`: Multi-line text skeleton
- `AvatarSkeletonPrimitive`: Circular avatar skeleton
- `ButtonSkeletonPrimitive`: Button-shaped skeleton
- `ImageSkeletonPrimitive`: Image skeleton with aspect ratio
- `CardSkeletonPrimitive`: Complete card layout
- `ListSkeletonPrimitive`: List of items skeleton
- `TableSkeletonPrimitive`: Table structure skeleton

## Utilities

### AnimationPresets

Pre-defined animation configurations.

```typescript
class AnimationPresets {
  static readonly SHIMMER: AnimationConfig;
  static readonly PULSE: AnimationConfig;
  static readonly WAVE: AnimationConfig;
  static readonly FADE: AnimationConfig;
  static readonly NONE: AnimationConfig;
  
  static getPreset(name: string): AnimationConfig | null;
  static respectUserPreferences(animation: AnimationConfig): AnimationConfig;
  static scaleForComplexity(animation: AnimationConfig, complexity: 'simple' | 'medium' | 'complex'): AnimationConfig;
}
```

### StyleExtractor

CSS style analysis utilities.

```typescript
class StyleExtractor {
  static extractRelevantStyles(computedStyle: CSSStyleDeclaration): ElementStyles;
  static extractLayoutStyles(computedStyle: CSSStyleDeclaration): object;
  static hasResponsiveUnits(computedStyle: CSSStyleDeclaration): boolean;
  static isGridContainer(computedStyle: CSSStyleDeclaration): boolean;
  static isFlexContainer(computedStyle: CSSStyleDeclaration): boolean;
}
```

### DimensionCalculator

Dimension calculation and optimization utilities.

```typescript
class DimensionCalculator {
  static calculateOptimalSkeletonDimensions(
    originalDimensions: ElementDimensions,
    elementType: string,
    textContent?: string
  ): { width: number | string; height: number | string };
  
  static calculateMinimumDimensions(
    elementType: string,
    computedStyle: CSSStyleDeclaration
  ): { minWidth: number; minHeight: number };
}
```

## Types

### Core Types

```typescript
type AnimationType = 'shimmer' | 'pulse' | 'wave' | 'fade' | 'none';

interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  direction?: 'ltr' | 'rtl' | 'normal' | 'reverse';
}

type ThemeType = 'light' | 'dark' | 'auto';

interface ThemeConfig {
  type: ThemeType;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: number;
}

interface ElementDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

type ElementType = 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'input' 
  | 'container' 
  | 'icon' 
  | 'avatar' 
  | 'card' 
  | 'list' 
  | 'unknown';
```

### Configuration Types

```typescript
interface AutoSkeletonOptions {
  animation?: AnimationConfig;
  theme?: ThemeConfig;
  preserveAspectRatio?: boolean;
  respectUserMotion?: boolean;
  customOverrides?: Record<string, Partial<SkeletonElementConfig>>;
  minHeight?: number;
  minWidth?: number;
  ignoreElements?: string[];
  enableCaching?: boolean;
  cacheKey?: string;
  onAnalysisComplete?: (result: ComponentAnalysisResult) => void;
  onError?: (error: Error) => void;
}

interface SkeletonElementConfig {
  type: ElementType;
  width: number | string;
  height: number | string;
  shape?: 'rectangular' | 'circular' | 'rounded';
  lines?: number;
  animation?: AnimationConfig;
  style?: React.CSSProperties;
}
```

## Utility Functions

### quickSetup

Convenience function for common configurations.

```typescript
function quickSetup(theme: 'light' | 'dark' = 'light'): AutoSkeletonOptions
```

### validateEnvironment

Checks if the current environment supports auto-skeleton.

```typescript
function validateEnvironment(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}
```

### Performance Utils

```typescript
const performanceUtils = {
  measureAnalysisTime: <T>(fn: () => Promise<T>) => Promise<{ result: T; duration: number }>,
  monitorMemory: () => { used: number; total: number } | null,
  createPerformanceObserver: (callback: (entries: PerformanceEntry[]) => void) => PerformanceObserver | null
};
```

### Debug Utils

```typescript
const debugUtils = {
  enableDebugMode: () => void,
  disableDebugMode: () => void,
  log: (message: string, data?: any) => void,
  showAnalysisOverlay: (analysisResult: ComponentAnalysisResult) => void
};
```

## Error Handling

### AutoSkeletonError

Custom error class for package-specific errors.

```typescript
class AutoSkeletonError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  );
}
```

**Common Error Codes:**
- `ENVIRONMENT_ERROR`: Browser environment not available
- `ELEMENT_NOT_FOUND`: Component element not found
- `ANALYSIS_FAILED`: Component analysis failed
- `GENERATION_FAILED`: Skeleton generation failed
- `FEATURE_NOT_SUPPORTED`: Required browser feature not supported

## Best Practices

### Performance
- Use caching for components that don't change frequently
- Consider using `respectUserMotion` for accessibility
- Limit analysis depth for complex components

### Accessibility
- Always provide meaningful `aria-label` attributes
- Respect user's motion preferences
- Ensure proper color contrast for themes

### Integration
- Use the provider pattern for global configuration
- Combine with suspense boundaries for optimal UX
- Test skeleton loaders with actual loading states
