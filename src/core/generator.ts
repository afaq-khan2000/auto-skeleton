import React from 'react';
import {
  AnalyzedElement,
  ComponentAnalysisResult,
  SkeletonElementConfig,
  SkeletonGenerationResult,
  ElementType,
  AnimationConfig,
  ThemeConfig,
  GeneratorConfig,
  AutoSkeletonOptions,
  AutoSkeletonError,
} from '@/types';

export class SkeletonGenerator {
  private config: GeneratorConfig;
  private theme: ThemeConfig;
  private animation: AnimationConfig;

  constructor(
    theme: ThemeConfig = { type: 'light' },
    animation: AnimationConfig = { type: 'shimmer', duration: 1500 },
    config: Partial<GeneratorConfig> = {}
  ) {
    this.theme = theme;
    this.animation = animation;
    this.config = {
      preserveHierarchy: true,
      optimizeForPerformance: true,
      generateAccessibilityAttributes: true,
      respectUserPreferences: true,
      ...config,
    };
  }

  /**
   * Generates skeleton components from analysis result
   */
  generateSkeleton(
    analysisResult: ComponentAnalysisResult,
    options: AutoSkeletonOptions = {}
  ): SkeletonGenerationResult {
    const startTime = Date.now();
    
    try {
      // Apply custom overrides if provided
      const mergedOptions = this.mergeOptions(options);
      
      // Convert analyzed elements to skeleton configs
      const skeletonConfigs = this.convertElementsToSkeletonConfig(
        analysisResult.elements,
        mergedOptions
      );

      // Generate React component
      const component = this.createSkeletonComponent(
        skeletonConfigs,
        analysisResult.layout,
        mergedOptions
      );

      const generationTime = Date.now() - startTime;

      return {
        component,
        config: skeletonConfigs,
        metadata: {
          generationTime,
          complexity: this.calculateComplexity(skeletonConfigs),
          elementCount: skeletonConfigs.length,
        },
      };
    } catch (error) {
      throw new AutoSkeletonError(
        `Skeleton generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        { generationTime: Date.now() - startTime }
      );
    }
  }

  /**
   * Converts analyzed elements to skeleton element configurations
   */
  private convertElementsToSkeletonConfig(
    elements: AnalyzedElement[],
    options: AutoSkeletonOptions
  ): SkeletonElementConfig[] {
    return elements.map(element => this.convertSingleElement(element, options));
  }

  /**
   * Converts a single analyzed element to skeleton config
   */
  private convertSingleElement(
    element: AnalyzedElement,
    options: AutoSkeletonOptions
  ): SkeletonElementConfig {
    const baseConfig: SkeletonElementConfig = {
      type: element.elementType,
      width: this.calculateWidth(element),
      height: this.calculateHeight(element),
      shape: this.determineShape(element),
      animation: { ...this.animation, ...options.animation },
      style: this.generateBaseStyle(element),
    };

    // Apply type-specific configurations
    const enhancedConfig = this.enhanceConfigForElementType(baseConfig, element);

    // Apply custom overrides
    const finalConfig = this.applyCustomOverrides(
      enhancedConfig,
      element,
      options.customOverrides
    );

    return finalConfig;
  }

  /**
   * Calculates appropriate width for skeleton element
   */
  private calculateWidth(element: AnalyzedElement): number | string {
    const { width } = element.dimensions;
    
    // Handle different width scenarios
    if (width === 0) return '100%';
    if (width < 50) return Math.max(width, 20);
    if (width > 800) return '100%';
    
    return Math.round(width);
  }

  /**
   * Calculates appropriate height for skeleton element
   */
  private calculateHeight(element: AnalyzedElement): number | string {
    const { height } = element.dimensions;
    
    // Handle text elements differently
    if (element.elementType === 'text') {
      return this.calculateTextHeight(element);
    }
    
    if (height === 0) return 20;
    if (height < 10) return 16;
    
    return Math.round(height);
  }

  /**
   * Calculates height for text elements based on content
   */
  private calculateTextHeight(element: AnalyzedElement): number | string {
    const fontSize = this.extractFontSize(element.styles.fontSize);
    const lineHeight = fontSize * 1.2; // Default line height multiplier
    
    if (!element.textContent) return lineHeight;
    
    // Estimate number of lines based on text length and element width
    const averageCharWidth = fontSize * 0.6;
    const maxCharsPerLine = Math.floor(element.dimensions.width / averageCharWidth);
    const estimatedLines = Math.ceil(element.textContent.length / maxCharsPerLine);
    
    return Math.max(lineHeight, estimatedLines * lineHeight);
  }

  /**
   * Determines the shape of the skeleton element
   */
  private determineShape(element: AnalyzedElement): 'rectangular' | 'circular' | 'rounded' {
    // Avatar and icons are usually circular
    if (element.elementType === 'avatar' || element.elementType === 'icon') {
      return 'circular';
    }

    // Check border radius from styles
    const borderRadius = element.styles.borderRadius;
    if (borderRadius && borderRadius !== '0px') {
      const radiusValue = this.extractPixelValue(borderRadius);
      const minDimension = Math.min(element.dimensions.width, element.dimensions.height);
      
      // If border radius is more than half the minimum dimension, treat as circular
      if (radiusValue >= minDimension / 2) {
        return 'circular';
      }
      
      // If it has border radius, make it rounded
      if (radiusValue > 4) {
        return 'rounded';
      }
    }

    return 'rectangular';
  }

  /**
   * Enhances config based on element type
   */
  private enhanceConfigForElementType(
    config: SkeletonElementConfig,
    element: AnalyzedElement
  ): SkeletonElementConfig {
    switch (element.elementType) {
      case 'text':
        return {
          ...config,
          lines: this.calculateTextLines(element),
          height: this.calculateTextHeight(element),
        };

      case 'image':
        return {
          ...config,
          shape: config.shape === 'rectangular' ? 'rounded' : config.shape,
        };

      case 'button':
        return {
          ...config,
          shape: 'rounded',
          height: Math.max(config.height as number, 36),
        };

      case 'avatar':
        return {
          ...config,
          shape: 'circular',
          width: Math.min(element.dimensions.width, element.dimensions.height),
          height: Math.min(element.dimensions.width, element.dimensions.height),
        };

      case 'input':
        return {
          ...config,
          shape: 'rounded',
          height: Math.max(config.height as number, 40),
        };

      default:
        return config;
    }
  }

  /**
   * Generates base styles for skeleton element
   */
  private generateBaseStyle(element: AnalyzedElement): React.CSSProperties {
    return {
      margin: element.styles.margin || '0',
      padding: '0', // Skeleton elements shouldn't have padding
      display: element.styles.display || 'block',
      position: element.styles.position === 'absolute' ? 'absolute' : 'static',
      flexDirection: element.styles.flexDirection as any,
      justifyContent: element.styles.justifyContent,
      alignItems: element.styles.alignItems,
    };
  }

  /**
   * Creates the main skeleton React component
   */
  private createSkeletonComponent(
    configs: SkeletonElementConfig[],
    layout: any,
    options: AutoSkeletonOptions
  ): React.ReactElement {
    const SkeletonComponent = React.createElement(
      'div',
      {
        className: 'auto-skeleton-root',
        style: {
          display: layout.containerType === 'flex' ? 'flex' : layout.containerType,
          flexDirection: layout.direction || 'row',
          gap: layout.gap || 0,
          alignItems: layout.alignItems,
          justifyContent: layout.justifyContent,
          width: '100%',
        },
        'aria-busy': 'true',
        'aria-label': 'Loading content...',
      },
      configs.map((config, index) => 
        this.createSkeletonElement(config, index, options)
      )
    );

    return SkeletonComponent;
  }

  /**
   * Creates individual skeleton elements
   */
  private createSkeletonElement(
    config: SkeletonElementConfig,
    key: number,
    options: AutoSkeletonOptions
  ): React.ReactElement {
    const baseStyle: React.CSSProperties = {
      width: config.width,
      height: config.height,
      backgroundColor: this.getSkeletonColor(),
      borderRadius: this.getBorderRadius(config.shape || 'rectangular'),
      animation: this.getAnimationCSS(config.animation),
      ...config.style,
    };

    // Handle text elements with multiple lines
    if (config.type === 'text' && config.lines && config.lines > 1) {
      return React.createElement(
        'div',
        {
          key,
          className: `auto-skeleton-text auto-skeleton-${config.type}`,
          style: { ...baseStyle, height: 'auto' },
        },
        Array.from({ length: config.lines }, (_, lineIndex) =>
          React.createElement('div', {
            key: lineIndex,
            style: {
              ...baseStyle,
              height: this.extractFontSize(config.style?.fontSize?.toString()) * 1.2 || 16,
              marginBottom: lineIndex < config.lines! - 1 ? '4px' : '0',
              width: lineIndex === config.lines! - 1 ? '70%' : '100%', // Last line shorter
            },
          })
        )
      );
    }

    return React.createElement('div', {
      key,
      className: `auto-skeleton-element auto-skeleton-${config.type}`,
      style: baseStyle,
    });
  }

  /**
   * Utility methods
   */
  private mergeOptions(options: AutoSkeletonOptions): AutoSkeletonOptions {
    return {
      animation: { ...this.animation, ...options.animation },
      theme: { ...this.theme, ...options.theme },
      ...options,
    };
  }

  private calculateTextLines(element: AnalyzedElement): number {
    if (!element.textContent) return 1;
    
    const fontSize = this.extractFontSize(element.styles.fontSize);
    const lineHeight = fontSize * 1.2;
    const approximateLines = Math.ceil(element.dimensions.height / lineHeight);
    
    return Math.max(1, Math.min(approximateLines, 5)); // Cap at 5 lines
  }

  private extractFontSize(fontSize?: string): number {
    if (!fontSize) return 16;
    const match = fontSize.match(/(\d+)/);
    return match ? parseInt(match[1]) : 16;
  }

  private extractPixelValue(value: string): number {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private getSkeletonColor(): string {
    if (this.theme.type === 'dark') {
      return this.theme.baseColor || '#2d2d2d';
    }
    return this.theme.baseColor || '#e0e0e0';
  }

  private getBorderRadius(shape: string): string {
    switch (shape) {
      case 'circular':
        return '50%';
      case 'rounded':
        return `${this.theme.borderRadius || 8}px`;
      default:
        return '4px';
    }
  }

  private getAnimationCSS(animation?: AnimationConfig): string {
    if (!animation || animation.type === 'none') return 'none';
    
    const duration = animation.duration || 1500;
    const direction = animation.direction || 'normal';
    
    return `auto-skeleton-${animation.type} ${duration}ms infinite ${direction}`;
  }

  private calculateComplexity(configs: SkeletonElementConfig[]): number {
    return configs.reduce((complexity, config) => {
      let elementComplexity = 1;
      
      if (config.lines && config.lines > 1) elementComplexity += config.lines;
      if (config.animation?.type !== 'none') elementComplexity += 1;
      if (config.shape === 'circular') elementComplexity += 1;
      
      return complexity + elementComplexity;
    }, 0);
  }

  private applyCustomOverrides(
    config: SkeletonElementConfig,
    element: AnalyzedElement,
    overrides?: Record<string, Partial<SkeletonElementConfig>>
  ): SkeletonElementConfig {
    if (!overrides) return config;

    // Try to find override by element ID, class, or tag name
    const possibleKeys = [
      element.id,
      `.${element.tagName}`,
      element.tagName,
      `.auto-skeleton-${element.elementType}`,
    ];

    for (const key of possibleKeys) {
      if (overrides[key]) {
        return { ...config, ...overrides[key] };
      }
    }

    return config;
  }

  /**
   * Configuration methods
   */
  updateTheme(theme: Partial<ThemeConfig>): void {
    this.theme = { ...this.theme, ...theme };
  }

  updateAnimation(animation: Partial<AnimationConfig>): void {
    this.animation = { ...this.animation, ...animation };
  }

  updateConfig(config: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getTheme(): ThemeConfig {
    return { ...this.theme };
  }

  getAnimation(): AnimationConfig {
    return { ...this.animation };
  }

  getConfig(): GeneratorConfig {
    return { ...this.config };
  }
}
