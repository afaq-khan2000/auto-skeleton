import { ReactElement, ComponentType, CSSProperties } from 'react';

// Animation types
export type AnimationType = 'shimmer' | 'pulse' | 'wave' | 'fade' | 'none';

export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  direction?: 'ltr' | 'rtl' | 'normal' | 'reverse';
}

// Theme types
export type ThemeType = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  type: ThemeType;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: number;
}

// Element analysis types
export interface ElementDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ElementStyles {
  backgroundColor?: string;
  borderRadius?: string;
  margin?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  display?: string;
  position?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gridTemplate?: string;
  gap?: string;
}

export interface AnalyzedElement {
  id: string;
  tagName: string;
  dimensions: ElementDimensions;
  styles: ElementStyles;
  children: AnalyzedElement[];
  textContent?: string;
  isVisible: boolean;
  elementType: ElementType;
}

export type ElementType = 
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

// Skeleton configuration types
export interface SkeletonElementConfig {
  type: ElementType;
  width: number | string;
  height: number | string;
  shape?: 'rectangular' | 'circular' | 'rounded';
  lines?: number;
  animation?: AnimationConfig;
  style?: CSSProperties;
}

export interface ComponentAnalysisResult {
  elements: AnalyzedElement[];
  layout: LayoutInfo;
  metadata: ComponentMetadata;
}

export interface LayoutInfo {
  containerType: 'flex' | 'grid' | 'block' | 'inline-block';
  direction?: 'row' | 'column';
  wrap?: boolean;
  gap?: number;
  alignItems?: string;
  justifyContent?: string;
}

export interface ComponentMetadata {
  componentName?: string;
  props?: Record<string, any>;
  responsive?: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  analysisTime?: number;
}

// Options and configuration
export interface AutoSkeletonOptions {
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

export interface SkeletonProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  defaultAnimation?: AnimationConfig;
  globalOptions?: Partial<AutoSkeletonOptions>;
}

// Hook return types
export interface UseAutoSkeletonReturn {
  SkeletonComponent: ComponentType<any>;
  isAnalyzing: boolean;
  error: Error | null;
  analysisResult: ComponentAnalysisResult | null;
  regenerateSkeleton: () => void;
}

export interface UseSkeletonStateReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
}

// HOC types
export interface WithAutoSkeletonOptions extends AutoSkeletonOptions {
  fallback?: ReactElement;
  loadingProp?: string;
}

export type WithAutoSkeletonComponent<P = {}> = ComponentType<P & {
  [K in string]?: boolean;
}>;

// Analysis engine types
export interface AnalysisEngineConfig {
  measurementThreshold: number;
  maxDepth: number;
  ignoreInvisibleElements: boolean;
  includePseudoElements: boolean;
  respectMediaQueries: boolean;
}

export interface MeasurementResult {
  boundingRect: DOMRect;
  computedStyle: CSSStyleDeclaration;
  isVisible: boolean;
  children: Element[];
}

// Generator types
export interface GeneratorConfig {
  preserveHierarchy: boolean;
  optimizeForPerformance: boolean;
  generateAccessibilityAttributes: boolean;
  respectUserPreferences: boolean;
}

export interface SkeletonGenerationResult {
  component: ReactElement;
  config: SkeletonElementConfig[];
  metadata: {
    generationTime: number;
    complexity: number;
    elementCount: number;
  };
}

// Cache types
export interface CacheEntry {
  key: string;
  result: ComponentAnalysisResult;
  timestamp: number;
  options: AutoSkeletonOptions;
}

export interface CacheManager {
  get: (key: string) => CacheEntry | null;
  set: (key: string, entry: CacheEntry) => void;
  clear: () => void;
  size: number;
}

// Error types
export class AutoSkeletonError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AutoSkeletonError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

// Constants
export const DEFAULT_ANIMATION_DURATION = 1500;
export const DEFAULT_CACHE_SIZE = 50;
export const DEFAULT_ANALYSIS_TIMEOUT = 5000;
export const SUPPORTED_ELEMENTS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'button', 'input', 'textarea', 'select', 'a',
  'ul', 'ol', 'li', 'article', 'section', 'header', 'footer',
  'nav', 'main', 'aside'
] as const;

export type SupportedElement = typeof SUPPORTED_ELEMENTS[number];
