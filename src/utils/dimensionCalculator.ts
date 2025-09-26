import { ElementDimensions } from '@/types';

/**
 * Utility class for calculating and processing element dimensions
 */
export class DimensionCalculator {
  /**
   * Calculates responsive dimensions based on viewport and container
   */
  static calculateResponsiveDimensions(
    element: Element,
    containerDimensions?: ElementDimensions
  ): ElementDimensions & {
    isResponsive: boolean;
    responsiveWidth: string;
    responsiveHeight: string;
  } {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    const dimensions: ElementDimensions = {
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    };

    // Check if width/height use responsive units
    const widthStyle = computedStyle.width;
    const heightStyle = computedStyle.height;
    
    const responsiveUnits = ['%', 'vw', 'vh', 'vmin', 'vmax', 'em', 'rem'];
    const isResponsiveWidth = responsiveUnits.some(unit => widthStyle.includes(unit));
    const isResponsiveHeight = responsiveUnits.some(unit => heightStyle.includes(unit));
    
    return {
      ...dimensions,
      isResponsive: isResponsiveWidth || isResponsiveHeight,
      responsiveWidth: isResponsiveWidth ? widthStyle : `${Math.round(rect.width)}px`,
      responsiveHeight: isResponsiveHeight ? heightStyle : `${Math.round(rect.height)}px`,
    };
  }

  /**
   * Calculates optimal skeleton dimensions based on content
   */
  static calculateOptimalSkeletonDimensions(
    originalDimensions: ElementDimensions,
    elementType: string,
    textContent?: string
  ): { width: number | string; height: number | string } {
    let { width, height } = originalDimensions;

    // Handle different element types
    switch (elementType) {
      case 'text':
        return this.calculateTextDimensions(originalDimensions, textContent);
        
      case 'avatar':
        // Make avatars square
        const avatarSize = Math.min(width, height);
        return { width: avatarSize, height: avatarSize };
        
      case 'button':
        // Ensure minimum button dimensions
        return {
          width: Math.max(width, 80),
          height: Math.max(height, 32),
        };
        
      case 'image':
        return this.calculateImageDimensions(originalDimensions);
        
      case 'input':
        // Standard input field dimensions
        return {
          width: width > 0 ? width : 200,
          height: Math.max(height, 40),
        };
        
      default:
        // Handle zero dimensions
        return {
          width: width > 0 ? width : '100%',
          height: height > 0 ? height : 20,
        };
    }
  }

  /**
   * Calculates text-specific dimensions
   */
  private static calculateTextDimensions(
    dimensions: ElementDimensions,
    textContent?: string
  ): { width: number | string; height: number | string } {
    const { width, height } = dimensions;
    
    if (!textContent) {
      return {
        width: width > 0 ? width : 100,
        height: Math.max(height, 16),
      };
    }

    // Estimate based on text length
    const estimatedCharWidth = 8; // Average character width in pixels
    const minTextWidth = Math.min(textContent.length * estimatedCharWidth, width);
    
    return {
      width: Math.max(minTextWidth, 20),
      height: Math.max(height, 16),
    };
  }

  /**
   * Calculates image dimensions maintaining aspect ratio
   */
  private static calculateImageDimensions(
    dimensions: ElementDimensions
  ): { width: number | string; height: number | string } {
    const { width, height } = dimensions;
    
    if (width === 0 || height === 0) {
      return { width: 200, height: 150 }; // Default image size
    }

    // Maintain aspect ratio
    const aspectRatio = width / height;
    
    // If image is too wide, constrain width
    if (width > 800) {
      return {
        width: 800,
        height: 800 / aspectRatio,
      };
    }
    
    // If image is too tall, constrain height
    if (height > 600) {
      return {
        width: 600 * aspectRatio,
        height: 600,
      };
    }
    
    return { width, height };
  }

  /**
   * Calculates container dimensions for layout
   */
  static calculateContainerDimensions(
    element: Element,
    includeChildren = true
  ): {
    content: ElementDimensions;
    padding: { top: number; right: number; bottom: number; left: number };
    border: { top: number; right: number; bottom: number; left: number };
    margin: { top: number; right: number; bottom: number; left: number };
    total: ElementDimensions;
  } {
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Parse box model values
    const padding = {
      top: this.parsePixelValue(computedStyle.paddingTop),
      right: this.parsePixelValue(computedStyle.paddingRight),
      bottom: this.parsePixelValue(computedStyle.paddingBottom),
      left: this.parsePixelValue(computedStyle.paddingLeft),
    };
    
    const border = {
      top: this.parsePixelValue(computedStyle.borderTopWidth),
      right: this.parsePixelValue(computedStyle.borderRightWidth),
      bottom: this.parsePixelValue(computedStyle.borderBottomWidth),
      left: this.parsePixelValue(computedStyle.borderLeftWidth),
    };
    
    const margin = {
      top: this.parsePixelValue(computedStyle.marginTop),
      right: this.parsePixelValue(computedStyle.marginRight),
      bottom: this.parsePixelValue(computedStyle.marginBottom),
      left: this.parsePixelValue(computedStyle.marginLeft),
    };
    
    // Calculate content dimensions
    const contentWidth = rect.width - padding.left - padding.right - border.left - border.right;
    const contentHeight = rect.height - padding.top - padding.bottom - border.top - border.bottom;
    
    const content: ElementDimensions = {
      width: Math.max(0, contentWidth),
      height: Math.max(0, contentHeight),
      x: rect.left + border.left + padding.left,
      y: rect.top + border.top + padding.top,
    };
    
    const total: ElementDimensions = {
      width: rect.width + margin.left + margin.right,
      height: rect.height + margin.top + margin.bottom,
      x: rect.left - margin.left,
      y: rect.top - margin.top,
    };
    
    return {
      content,
      padding,
      border,
      margin,
      total,
    };
  }

  /**
   * Calculates minimum dimensions needed for skeleton
   */
  static calculateMinimumDimensions(
    elementType: string,
    computedStyle: CSSStyleDeclaration
  ): { minWidth: number; minHeight: number } {
    const fontSize = this.parsePixelValue(computedStyle.fontSize) || 16;
    
    switch (elementType) {
      case 'text':
        return {
          minWidth: fontSize,
          minHeight: fontSize * 1.2, // Line height
        };
        
      case 'button':
        return {
          minWidth: 60,
          minHeight: 32,
        };
        
      case 'input':
        return {
          minWidth: 100,
          minHeight: 36,
        };
        
      case 'avatar':
        return {
          minWidth: 24,
          minHeight: 24,
        };
        
      case 'icon':
        return {
          minWidth: 16,
          minHeight: 16,
        };
        
      default:
        return {
          minWidth: 10,
          minHeight: 10,
        };
    }
  }

  /**
   * Calculates scale factor for responsive skeletons
   */
  static calculateScaleFactor(
    originalViewport: { width: number; height: number },
    currentViewport: { width: number; height: number }
  ): { scaleX: number; scaleY: number; scale: number } {
    const scaleX = currentViewport.width / originalViewport.width;
    const scaleY = currentViewport.height / originalViewport.height;
    const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
    
    return { scaleX, scaleY, scale };
  }

  /**
   * Adjusts dimensions for different screen densities
   */
  static adjustForDevicePixelRatio(
    dimensions: ElementDimensions,
    devicePixelRatio = window.devicePixelRatio
  ): ElementDimensions {
    return {
      width: dimensions.width / devicePixelRatio,
      height: dimensions.height / devicePixelRatio,
      x: dimensions.x / devicePixelRatio,
      y: dimensions.y / devicePixelRatio,
    };
  }

  /**
   * Calculates available space within a container
   */
  static calculateAvailableSpace(
    container: Element,
    excludeElements: Element[] = []
  ): {
    width: number;
    height: number;
    usedSpace: { width: number; height: number };
  } {
    const containerRect = container.getBoundingClientRect();
    const containerStyle = window.getComputedStyle(container);
    
    // Calculate container's available space
    const padding = {
      left: this.parsePixelValue(containerStyle.paddingLeft),
      right: this.parsePixelValue(containerStyle.paddingRight),
      top: this.parsePixelValue(containerStyle.paddingTop),
      bottom: this.parsePixelValue(containerStyle.paddingBottom),
    };
    
    const availableWidth = containerRect.width - padding.left - padding.right;
    const availableHeight = containerRect.height - padding.top - padding.bottom;
    
    // Calculate space used by existing children (excluding specified elements)
    let usedWidth = 0;
    let usedHeight = 0;
    
    const children = Array.from(container.children);
    for (const child of children) {
      if (excludeElements.includes(child)) continue;
      
      const childRect = child.getBoundingClientRect();
      const childStyle = window.getComputedStyle(child);
      
      if (childStyle.position !== 'absolute' && childStyle.position !== 'fixed') {
        if (containerStyle.flexDirection === 'row') {
          usedWidth += childRect.width;
          usedHeight = Math.max(usedHeight, childRect.height);
        } else {
          usedWidth = Math.max(usedWidth, childRect.width);
          usedHeight += childRect.height;
        }
      }
    }
    
    return {
      width: Math.max(0, availableWidth),
      height: Math.max(0, availableHeight),
      usedSpace: { width: usedWidth, height: usedHeight },
    };
  }

  /**
   * Rounds dimensions to avoid subpixel rendering issues
   */
  static roundDimensions(
    dimensions: ElementDimensions,
    precision = 0
  ): ElementDimensions {
    const factor = Math.pow(10, precision);
    
    return {
      width: Math.round(dimensions.width * factor) / factor,
      height: Math.round(dimensions.height * factor) / factor,
      x: Math.round(dimensions.x * factor) / factor,
      y: Math.round(dimensions.y * factor) / factor,
    };
  }

  /**
   * Constrains dimensions within specified bounds
   */
  static constrainDimensions(
    dimensions: { width: number | string; height: number | string },
    constraints: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    }
  ): { width: number | string; height: number | string } {
    let { width, height } = dimensions;
    
    // Convert string values to numbers for constraint checking
    const numWidth = typeof width === 'string' ? this.parsePixelValue(width) : width;
    const numHeight = typeof height === 'string' ? this.parsePixelValue(height) : height;
    
    let constrainedWidth = numWidth;
    let constrainedHeight = numHeight;
    
    // Apply width constraints
    if (constraints.minWidth !== undefined) {
      constrainedWidth = Math.max(constrainedWidth, constraints.minWidth);
    }
    if (constraints.maxWidth !== undefined) {
      constrainedWidth = Math.min(constrainedWidth, constraints.maxWidth);
    }
    
    // Apply height constraints
    if (constraints.minHeight !== undefined) {
      constrainedHeight = Math.max(constrainedHeight, constraints.minHeight);
    }
    if (constraints.maxHeight !== undefined) {
      constrainedHeight = Math.min(constrainedHeight, constraints.maxHeight);
    }
    
    return {
      width: typeof width === 'string' && constrainedWidth === numWidth ? width : constrainedWidth,
      height: typeof height === 'string' && constrainedHeight === numHeight ? height : constrainedHeight,
    };
  }

  /**
   * Parses pixel values from CSS strings
   */
  private static parsePixelValue(value: string): number {
    if (!value || value === 'auto') return 0;
    const match = value.match(/^([\d.-]+)px$/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Calculates the distance between two points
   */
  static calculateDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  /**
   * Checks if two rectangles overlap
   */
  static rectanglesOverlap(
    rect1: ElementDimensions,
    rect2: ElementDimensions
  ): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Calculates the intersection area of two rectangles
   */
  static calculateIntersectionArea(
    rect1: ElementDimensions,
    rect2: ElementDimensions
  ): number {
    if (!this.rectanglesOverlap(rect1, rect2)) return 0;
    
    const left = Math.max(rect1.x, rect2.x);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const top = Math.max(rect1.y, rect2.y);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    
    return (right - left) * (bottom - top);
  }
}
