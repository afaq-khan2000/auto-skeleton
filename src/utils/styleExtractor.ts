import { ElementStyles } from '@/types';

/**
 * Utility class for extracting and processing CSS styles
 */
export class StyleExtractor {
  private static readonly RELEVANT_PROPERTIES = [
    'backgroundColor',
    'borderRadius',
    'margin',
    'padding',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'lineHeight',
    'display',
    'position',
    'flexDirection',
    'flexWrap',
    'justifyContent',
    'alignItems',
    'alignContent',
    'gap',
    'gridTemplate',
    'gridTemplateColumns',
    'gridTemplateRows',
    'gridGap',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'boxShadow',
    'border',
    'borderWidth',
    'borderStyle',
    'borderColor',
    'opacity',
    'transform',
    'transition',
    'overflow',
    'textAlign',
    'verticalAlign',
    'zIndex'
  ];

  /**
   * Extracts relevant styles from computed styles
   */
  static extractRelevantStyles(computedStyle: CSSStyleDeclaration): ElementStyles {
    const styles: ElementStyles = {};

    for (const property of this.RELEVANT_PROPERTIES) {
      const value = computedStyle.getPropertyValue(this.camelToKebab(property));
      
      if (value && value !== 'initial' && value !== 'inherit' && value !== 'auto') {
        (styles as any)[property] = value;
      }
    }

    return styles;
  }

  /**
   * Extracts styles with normalized values
   */
  static extractNormalizedStyles(computedStyle: CSSStyleDeclaration): ElementStyles {
    const rawStyles = this.extractRelevantStyles(computedStyle);
    const normalizedStyles: ElementStyles = {};

    // Normalize colors
    if (rawStyles.backgroundColor) {
      normalizedStyles.backgroundColor = this.normalizeColor(rawStyles.backgroundColor);
    }

    // Normalize dimensions
    if (rawStyles.borderRadius) {
      normalizedStyles.borderRadius = this.normalizeDimension(rawStyles.borderRadius);
    }

    // Normalize spacing
    if (rawStyles.margin) {
      normalizedStyles.margin = this.normalizeSpacing(rawStyles.margin);
    }
    
    if (rawStyles.padding) {
      normalizedStyles.padding = this.normalizeSpacing(rawStyles.padding);
    }

    if (rawStyles.gap) {
      normalizedStyles.gap = this.normalizeDimension(rawStyles.gap);
    }

    // Copy other properties as-is
    const otherProperties: (keyof ElementStyles)[] = [
      'fontSize', 'fontWeight', 'display', 'position', 
      'flexDirection', 'justifyContent', 'alignItems', 'gridTemplate'
    ];
    
    for (const prop of otherProperties) {
      if (rawStyles[prop]) {
        normalizedStyles[prop] = rawStyles[prop];
      }
    }

    return normalizedStyles;
  }

  /**
   * Extracts layout-specific styles
   */
  static extractLayoutStyles(computedStyle: CSSStyleDeclaration): {
    display: string;
    flexDirection?: string;
    flexWrap?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    gridTemplate?: string;
    position?: string;
  } {
    return {
      display: computedStyle.display,
      flexDirection: computedStyle.flexDirection || undefined,
      flexWrap: computedStyle.flexWrap || undefined,
      justifyContent: computedStyle.justifyContent || undefined,
      alignItems: computedStyle.alignItems || undefined,
      gap: computedStyle.gap || undefined,
      gridTemplate: computedStyle.gridTemplate || undefined,
      position: computedStyle.position || undefined,
    };
  }

  /**
   * Extracts typography styles
   */
  static extractTypographyStyles(computedStyle: CSSStyleDeclaration): {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    lineHeight?: string;
    textAlign?: string;
    color?: string;
  } {
    return {
      fontSize: computedStyle.fontSize || undefined,
      fontWeight: computedStyle.fontWeight || undefined,
      fontFamily: computedStyle.fontFamily || undefined,
      lineHeight: computedStyle.lineHeight || undefined,
      textAlign: computedStyle.textAlign || undefined,
      color: this.normalizeColor(computedStyle.color) || undefined,
    };
  }

  /**
   * Extracts visual styles (colors, borders, shadows)
   */
  static extractVisualStyles(computedStyle: CSSStyleDeclaration): {
    backgroundColor?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
    opacity?: string;
  } {
    return {
      backgroundColor: this.normalizeColor(computedStyle.backgroundColor) || undefined,
      borderRadius: computedStyle.borderRadius || undefined,
      border: computedStyle.border || undefined,
      boxShadow: computedStyle.boxShadow || undefined,
      opacity: computedStyle.opacity !== '1' ? computedStyle.opacity : undefined,
    };
  }

  /**
   * Checks if element has responsive units
   */
  static hasResponsiveUnits(computedStyle: CSSStyleDeclaration): boolean {
    const responsiveUnits = ['%', 'vw', 'vh', 'vmin', 'vmax', 'em', 'rem', 'fr'];
    const properties = ['width', 'height', 'fontSize', 'margin', 'padding', 'gap'];

    return properties.some(prop => {
      const value = computedStyle.getPropertyValue(prop);
      return responsiveUnits.some(unit => value.includes(unit));
    });
  }

  /**
   * Detects CSS Grid usage
   */
  static isGridContainer(computedStyle: CSSStyleDeclaration): boolean {
    return computedStyle.display === 'grid' || 
           computedStyle.display === 'inline-grid';
  }

  /**
   * Detects Flexbox usage
   */
  static isFlexContainer(computedStyle: CSSStyleDeclaration): boolean {
    return computedStyle.display === 'flex' || 
           computedStyle.display === 'inline-flex';
  }

  /**
   * Analyzes container type and properties
   */
  static analyzeContainer(computedStyle: CSSStyleDeclaration): {
    type: 'grid' | 'flex' | 'block' | 'inline' | 'inline-block';
    properties: Record<string, string>;
  } {
    const display = computedStyle.display;
    let type: 'grid' | 'flex' | 'block' | 'inline' | 'inline-block';
    const properties: Record<string, string> = {};

    if (this.isGridContainer(computedStyle)) {
      type = 'grid';
      properties.gridTemplateColumns = computedStyle.gridTemplateColumns;
      properties.gridTemplateRows = computedStyle.gridTemplateRows;
      properties.gap = computedStyle.gap;
      properties.justifyItems = computedStyle.justifyItems;
      properties.alignItems = computedStyle.alignItems;
    } else if (this.isFlexContainer(computedStyle)) {
      type = 'flex';
      properties.flexDirection = computedStyle.flexDirection;
      properties.flexWrap = computedStyle.flexWrap;
      properties.justifyContent = computedStyle.justifyContent;
      properties.alignItems = computedStyle.alignItems;
      properties.gap = computedStyle.gap;
    } else if (display === 'inline-block') {
      type = 'inline-block';
    } else if (display === 'inline') {
      type = 'inline';
    } else {
      type = 'block';
    }

    return { type, properties };
  }

  /**
   * Extracts CSS custom properties (CSS variables)
   */
  static extractCustomProperties(element: Element): Record<string, string> {
    const customProps: Record<string, string> = {};
    const computedStyle = window.getComputedStyle(element);

    // Get all CSS custom properties from computed styles
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle.item(i);
      if (prop.startsWith('--')) {
        customProps[prop] = computedStyle.getPropertyValue(prop).trim();
      }
    }

    return customProps;
  }

  /**
   * Converts camelCase to kebab-case
   */
  private static camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Normalizes color values to consistent format
   */
  private static normalizeColor(color: string): string {
    if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
      return 'transparent';
    }

    // Convert rgb/rgba to hex for consistency
    const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      
      if (a && parseFloat(a) < 1) {
        // Keep rgba format for transparency
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      } else {
        // Convert to hex
        return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
      }
    }

    return color;
  }

  /**
   * Normalizes dimension values
   */
  private static normalizeDimension(dimension: string): string {
    if (!dimension) return '0';
    
    // Convert px values to numbers for easier manipulation
    const pxMatch = dimension.match(/^(\d+(?:\.\d+)?)px$/);
    if (pxMatch) {
      const value = parseFloat(pxMatch[1]);
      return value < 1 ? '0' : `${Math.round(value)}px`;
    }

    return dimension;
  }

  /**
   * Normalizes spacing values (margin, padding)
   */
  private static normalizeSpacing(spacing: string): string {
    if (!spacing) return '0';

    // Handle shorthand values
    const values = spacing.split(/\s+/);
    const normalizedValues = values.map(value => this.normalizeDimension(value));
    
    return normalizedValues.join(' ');
  }

  /**
   * Calculates effective z-index taking into account stacking context
   */
  static calculateEffectiveZIndex(element: Element): number {
    let current = element as HTMLElement;
    let effectiveZIndex = 0;

    while (current && current !== document.body) {
      const computedStyle = window.getComputedStyle(current);
      const zIndex = computedStyle.zIndex;
      
      if (zIndex !== 'auto') {
        const zIndexValue = parseInt(zIndex, 10);
        if (!isNaN(zIndexValue)) {
          effectiveZIndex = Math.max(effectiveZIndex, zIndexValue);
        }
      }

      current = current.parentElement as HTMLElement;
    }

    return effectiveZIndex;
  }

  /**
   * Determines if element creates a stacking context
   */
  static createsStackingContext(computedStyle: CSSStyleDeclaration): boolean {
    const conditions = [
      computedStyle.position !== 'static' && computedStyle.zIndex !== 'auto',
      computedStyle.opacity !== '1',
      computedStyle.transform !== 'none',
      computedStyle.filter !== 'none',
      computedStyle.perspective !== 'none',
      computedStyle.clipPath !== 'none',
      computedStyle.mask !== 'none',
      computedStyle.mixBlendMode !== 'normal',
      computedStyle.isolation === 'isolate'
    ];

    return conditions.some(condition => condition);
  }

  /**
   * Extracts animation and transition properties
   */
  static extractAnimationStyles(computedStyle: CSSStyleDeclaration): {
    transition?: string;
    animation?: string;
    transform?: string;
  } {
    return {
      transition: computedStyle.transition !== 'all 0s ease 0s' ? computedStyle.transition : undefined,
      animation: computedStyle.animation !== 'none 0s ease 0s 1 normal none running' ? computedStyle.animation : undefined,
      transform: computedStyle.transform !== 'none' ? computedStyle.transform : undefined,
    };
  }
}
