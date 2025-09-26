import React, { ComponentType, ReactElement } from 'react';
import { DOMmeasurer } from './measurer';
import {
  AnalyzedElement,
  ComponentAnalysisResult,
  ElementType,
  LayoutInfo,
  ComponentMetadata,
  AnalysisEngineConfig,
  AutoSkeletonError,
  SUPPORTED_ELEMENTS,
} from '@/types';

export class ComponentAnalyzer {
  private measurer: DOMmeasurer;
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
    
    this.measurer = new DOMmeasurer(this.config);
  }

  /**
   * Analyzes a React component by examining its rendered DOM
   */
  async analyzeComponent(
    componentRef: React.RefObject<HTMLElement> | HTMLElement,
    options: { 
      componentName?: string;
      timeout?: number;
    } = {}
  ): Promise<ComponentAnalysisResult> {
    const element = this.resolveElement(componentRef);
    
    if (!element) {
      throw new AutoSkeletonError(
        'Component element not found or not yet rendered',
        'ELEMENT_NOT_FOUND'
      );
    }

    // Validate environment before starting analysis
    DOMmeasurer.validateEnvironment();

    const startTime = Date.now();
    const timeout = options.timeout || 5000;

    try {
      // Wait for component to be fully rendered
      await this.waitForComponentReady(element, timeout);

      const elements = await this.analyzeElements(element);
      const layout = this.analyzeLayout(element);
      const metadata = this.analyzeMetadata(element, options.componentName);

      const analysisTime = Date.now() - startTime;
      
      return {
        elements,
        layout,
        metadata: {
          ...metadata,
          analysisTime,
        },
      };
    } catch (error) {
      throw new AutoSkeletonError(
        `Component analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ANALYSIS_FAILED',
        { componentName: options.componentName, analysisTime: Date.now() - startTime }
      );
    }
  }

  /**
   * Analyzes all elements within a component recursively
   */
  private async analyzeElements(
    rootElement: Element,
    depth: number = 0
  ): Promise<AnalyzedElement[]> {
    if (depth >= this.config.maxDepth) {
      return [];
    }

    const results: AnalyzedElement[] = [];
    const children = Array.from(rootElement.children);

    for (const element of children) {
      const measurement = this.measurer.measureComplete(element);
      
      if (this.config.ignoreInvisibleElements && !measurement.isVisible) {
        continue;
      }

      const analyzedElement: AnalyzedElement = {
        id: this.generateElementId(element, depth),
        tagName: element.tagName.toLowerCase(),
        dimensions: this.measurer.measureElement(element),
        styles: this.measurer.extractStyles(element),
        children: await this.analyzeElements(element, depth + 1),
        textContent: this.measurer.getTextContent(element),
        isVisible: measurement.isVisible,
        elementType: this.classifyElement(element),
      };

      results.push(analyzedElement);
    }

    return results;
  }

  /**
   * Classifies an element based on its characteristics
   */
  private classifyElement(element: Element): ElementType {
    const tagName = element.tagName.toLowerCase();
    const computedStyle = window.getComputedStyle(element);
    const classList = Array.from(element.classList);
    const textContent = element.textContent?.trim() || '';

    // Check for specific tag types first
    if (tagName === 'img') return 'image';
    if (tagName === 'button' || element.getAttribute('role') === 'button') return 'button';
    if (['input', 'textarea', 'select'].includes(tagName)) return 'input';

    // Check for common class patterns
    if (this.hasAnyClass(classList, ['avatar', 'profile', 'user-image'])) return 'avatar';
    if (this.hasAnyClass(classList, ['icon', 'svg-icon', 'fa-', 'icon-'])) return 'icon';
    if (this.hasAnyClass(classList, ['card', 'panel', 'tile'])) return 'card';
    if (this.hasAnyClass(classList, ['list', 'menu', 'nav'])) return 'list';

    // Check for text content
    if (textContent && computedStyle.display !== 'flex' && computedStyle.display !== 'grid') {
      return 'text';
    }

    // Check for container elements
    if (
      computedStyle.display === 'flex' ||
      computedStyle.display === 'grid' ||
      ['div', 'section', 'article'].includes(tagName)
    ) {
      return 'container';
    }

    return 'unknown';
  }

  /**
   * Analyzes the layout structure of the component
   */
  private analyzeLayout(element: Element): LayoutInfo {
    const computedStyle = window.getComputedStyle(element);
    
    const containerType = this.determineContainerType(computedStyle);
    
    return {
      containerType,
      direction: computedStyle.flexDirection as 'row' | 'column' | undefined,
      wrap: computedStyle.flexWrap === 'wrap',
      gap: this.parseGapValue(computedStyle.gap),
      alignItems: computedStyle.alignItems,
      justifyContent: computedStyle.justifyContent,
    };
  }

  /**
   * Analyzes metadata about the component
   */
  private analyzeMetadata(
    element: Element,
    componentName?: string
  ): ComponentMetadata {
    const children = Array.from(element.children);
    const complexity = this.determineComplexity(element, children);
    const responsive = this.measurer.analyzeResponsiveBehavior(element).isResponsive;

    return {
      componentName,
      responsive,
      complexity,
    };
  }

  /**
   * Determines container type based on computed styles
   */
  private determineContainerType(
    style: CSSStyleDeclaration
  ): 'flex' | 'grid' | 'block' | 'inline-block' {
    if (style.display === 'flex') return 'flex';
    if (style.display === 'grid') return 'grid';
    if (style.display === 'inline-block') return 'inline-block';
    return 'block';
  }

  /**
   * Determines component complexity based on structure
   */
  private determineComplexity(
    element: Element,
    children: Element[]
  ): 'simple' | 'medium' | 'complex' {
    const totalElements = this.countTotalElements(element);
    const nestingDepth = this.calculateMaxDepth(element);

    if (totalElements <= 5 && nestingDepth <= 2) return 'simple';
    if (totalElements <= 20 && nestingDepth <= 4) return 'medium';
    return 'complex';
  }

  /**
   * Waits for component to be fully rendered and stable
   */
  private async waitForComponentReady(
    element: Element,
    timeout: number
  ): Promise<void> {
    const start = Date.now();
    let lastDimensions = this.measurer.measureElement(element);

    return new Promise((resolve, reject) => {
      const check = () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Component ready timeout'));
          return;
        }

        const currentDimensions = this.measurer.measureElement(element);
        
        // Check if dimensions have stabilized
        if (
          Math.abs(currentDimensions.width - lastDimensions.width) < 1 &&
          Math.abs(currentDimensions.height - lastDimensions.height) < 1 &&
          currentDimensions.width > 0 &&
          currentDimensions.height > 0
        ) {
          resolve();
          return;
        }

        lastDimensions = currentDimensions;
        requestAnimationFrame(check);
      };

      requestAnimationFrame(check);
    });
  }

  /**
   * Utility methods
   */
  private resolveElement(
    ref: React.RefObject<HTMLElement> | HTMLElement
  ): HTMLElement | null {
    if ('current' in ref) {
      return ref.current;
    }
    return ref;
  }

  private generateElementId(element: Element, depth: number): string {
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? element.className.split(' ')[0] : '';
    const id = element.id || '';
    
    return `${tagName}-${depth}-${id || className || Math.random().toString(36).substr(2, 9)}`;
  }

  private hasAnyClass(classList: string[], patterns: string[]): boolean {
    return patterns.some(pattern => 
      classList.some(cls => 
        cls.toLowerCase().includes(pattern.toLowerCase())
      )
    );
  }

  private parseGapValue(gap: string): number {
    if (!gap || gap === 'normal') return 0;
    const match = gap.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private countTotalElements(element: Element): number {
    let count = 1;
    const children = Array.from(element.children);
    
    for (const child of children) {
      count += this.countTotalElements(child);
    }
    
    return count;
  }

  private calculateMaxDepth(element: Element, currentDepth: number = 0): number {
    const children = Array.from(element.children);
    
    if (children.length === 0) {
      return currentDepth;
    }

    return Math.max(
      ...children.map(child => this.calculateMaxDepth(child, currentDepth + 1))
    );
  }

  /**
   * Configuration methods
   */
  updateConfig(newConfig: Partial<AnalysisEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.measurer.updateConfig(this.config);
  }

  getConfig(): AnalysisEngineConfig {
    return { ...this.config };
  }
}
