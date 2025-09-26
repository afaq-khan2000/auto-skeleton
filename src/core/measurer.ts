import {
  MeasurementResult,
  ElementDimensions,
  ElementStyles,
  AnalysisEngineConfig,
  AutoSkeletonError,
} from '@/types';

export class DOMmeasurer {
  private config: AnalysisEngineConfig;

  constructor(config: Partial<AnalysisEngineConfig> = {}) {
    this.config = {
      measurementThreshold: 5,
      maxDepth: 10,
      ignoreInvisibleElements: true,
      includePseudoElements: false,
      respectMediaQueries: true,
      ...config,
    };
  }

  /**
   * Measures dimensions of a DOM element
   */
  measureElement(element: Element): ElementDimensions {
    const rect = element.getBoundingClientRect();
    
    return {
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    };
  }

  /**
   * Extracts relevant styles from computed styles
   */
  extractStyles(element: Element): ElementStyles {
    const computedStyle = window.getComputedStyle(element);
    
    return {
      backgroundColor: this.normalizeColor(computedStyle.backgroundColor),
      borderRadius: computedStyle.borderRadius,
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      display: computedStyle.display,
      position: computedStyle.position,
      flexDirection: computedStyle.flexDirection,
      justifyContent: computedStyle.justifyContent,
      alignItems: computedStyle.alignItems,
      gridTemplate: computedStyle.gridTemplate,
      gap: computedStyle.gap,
    };
  }

  /**
   * Performs complete measurement of an element including all relevant data
   */
  measureComplete(element: Element): MeasurementResult {
    const boundingRect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const isVisible = this.isElementVisible(element, boundingRect);
    const children = Array.from(element.children);

    return {
      boundingRect,
      computedStyle,
      isVisible,
      children,
    };
  }

  /**
   * Determines if an element is visible and should be measured
   */
  isElementVisible(element: Element, rect?: DOMRect): boolean {
    const boundingRect = rect || element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // Check basic visibility properties
    if (
      computedStyle.visibility === 'hidden' ||
      computedStyle.display === 'none' ||
      computedStyle.opacity === '0'
    ) {
      return false;
    }

    // Check if element has meaningful dimensions
    if (
      boundingRect.width < this.config.measurementThreshold ||
      boundingRect.height < this.config.measurementThreshold
    ) {
      return false;
    }

    // Check if element is within viewport (expanded check)
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const isInViewport = (
      boundingRect.left < viewport.width + 100 &&
      boundingRect.right > -100 &&
      boundingRect.top < viewport.height + 100 &&
      boundingRect.bottom > -100
    );

    return isInViewport;
  }

  /**
   * Measures all children elements recursively
   */
  measureChildren(
    element: Element, 
    depth: number = 0
  ): MeasurementResult[] {
    if (depth >= this.config.maxDepth) {
      return [];
    }

    const results: MeasurementResult[] = [];
    const children = Array.from(element.children);

    for (const child of children) {
      const measurement = this.measureComplete(child);
      
      if (this.config.ignoreInvisibleElements && !measurement.isVisible) {
        continue;
      }

      results.push(measurement);

      // Recursively measure children
      const childResults = this.measureChildren(child, depth + 1);
      results.push(...childResults);
    }

    return results;
  }

  /**
   * Gets the effective text content of an element
   */
  getTextContent(element: Element): string {
    const text = element.textContent?.trim() || '';
    
    // Filter out very short text that might be artifacts
    if (text.length < 2) {
      return '';
    }

    return text;
  }

  /**
   * Determines the responsive behavior of an element
   */
  analyzeResponsiveBehavior(element: Element): {
    isResponsive: boolean;
    breakpoints: string[];
  } {
    const computedStyle = window.getComputedStyle(element);
    const isResponsive = this.hasResponsiveUnits(computedStyle);
    
    // This would be expanded to actually detect breakpoints
    const breakpoints: string[] = [];

    return { isResponsive, breakpoints };
  }

  /**
   * Checks if computed styles use responsive units
   */
  private hasResponsiveUnits(style: CSSStyleDeclaration): boolean {
    const responsiveUnits = ['%', 'vw', 'vh', 'vmin', 'vmax', 'em', 'rem'];
    const properties = ['width', 'height', 'fontSize', 'margin', 'padding'];

    return properties.some(prop => {
      const value = style.getPropertyValue(prop);
      return responsiveUnits.some(unit => value.includes(unit));
    });
  }

  /**
   * Normalizes color values for consistent comparison
   */
  private normalizeColor(color: string): string {
    if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
      return 'transparent';
    }

    // Convert rgb/rgba to hex for consistency
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }

    return color;
  }

  /**
   * Creates a measurement report for debugging
   */
  generateMeasurementReport(element: Element): {
    summary: string;
    details: MeasurementResult;
    warnings: string[];
  } {
    const details = this.measureComplete(element);
    const warnings: string[] = [];

    if (!details.isVisible) {
      warnings.push('Element is not visible');
    }

    if (details.boundingRect.width === 0 || details.boundingRect.height === 0) {
      warnings.push('Element has zero dimensions');
    }

    const summary = `${element.tagName.toLowerCase()} - ${details.boundingRect.width}x${details.boundingRect.height}`;

    return { summary, details, warnings };
  }

  /**
   * Validates that measurement is possible in current environment
   */
  static validateEnvironment(): void {
    if (typeof window === 'undefined') {
      throw new AutoSkeletonError(
        'DOM measurement requires browser environment',
        'ENVIRONMENT_ERROR'
      );
    }

    if (typeof window.getComputedStyle === 'undefined') {
      throw new AutoSkeletonError(
        'getComputedStyle is not available',
        'FEATURE_NOT_SUPPORTED'
      );
    }

    if (typeof Element.prototype.getBoundingClientRect === 'undefined') {
      throw new AutoSkeletonError(
        'getBoundingClientRect is not available',
        'FEATURE_NOT_SUPPORTED'
      );
    }
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<AnalysisEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): AnalysisEngineConfig {
    return { ...this.config };
  }
}
