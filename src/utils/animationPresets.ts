import { AnimationConfig, ThemeConfig } from '@/types';

/**
 * Predefined animation presets for skeleton loaders
 */
export class AnimationPresets {
  /**
   * Shimmer animation preset
   */
  static readonly SHIMMER: AnimationConfig = {
    type: 'shimmer',
    duration: 1500,
    direction: 'normal',
  };

  /**
   * Pulse animation preset
   */
  static readonly PULSE: AnimationConfig = {
    type: 'pulse',
    duration: 1200,
    direction: 'normal',
  };

  /**
   * Wave animation preset
   */
  static readonly WAVE: AnimationConfig = {
    type: 'wave',
    duration: 1800,
    direction: 'normal',
  };

  /**
   * Fade animation preset
   */
  static readonly FADE: AnimationConfig = {
    type: 'fade',
    duration: 2000,
    direction: 'normal',
  };

  /**
   * No animation preset
   */
  static readonly NONE: AnimationConfig = {
    type: 'none',
    duration: 0,
  };

  /**
   * Fast shimmer for quick loading states
   */
  static readonly FAST_SHIMMER: AnimationConfig = {
    type: 'shimmer',
    duration: 800,
    direction: 'normal',
  };

  /**
   * Slow pulse for calm loading states
   */
  static readonly SLOW_PULSE: AnimationConfig = {
    type: 'pulse',
    duration: 2500,
    direction: 'normal',
  };

  /**
   * Reverse shimmer animation
   */
  static readonly REVERSE_SHIMMER: AnimationConfig = {
    type: 'shimmer',
    duration: 1500,
    direction: 'reverse',
  };

  /**
   * Gets all available presets
   */
  static getAllPresets(): Record<string, AnimationConfig> {
    return {
      shimmer: this.SHIMMER,
      pulse: this.PULSE,
      wave: this.WAVE,
      fade: this.FADE,
      none: this.NONE,
      fastShimmer: this.FAST_SHIMMER,
      slowPulse: this.SLOW_PULSE,
      reverseShimmer: this.REVERSE_SHIMMER,
    };
  }

  /**
   * Gets animation preset by name
   */
  static getPreset(name: string): AnimationConfig | null {
    const presets = this.getAllPresets();
    return presets[name] || null;
  }

  /**
   * Creates a custom animation config
   */
  static createCustom(
    type: AnimationConfig['type'],
    duration: number,
    options: Partial<AnimationConfig> = {}
  ): AnimationConfig {
    return {
      type,
      duration,
      direction: 'normal',
      delay: 0,
      ...options,
    };
  }

  /**
   * Adjusts animation based on user preferences
   */
  static respectUserPreferences(
    animation: AnimationConfig,
    respectReducedMotion = true
  ): AnimationConfig {
    if (respectReducedMotion && typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        return { ...animation, type: 'none' };
      }
    }

    return animation;
  }

  /**
   * Scales animation duration based on complexity
   */
  static scaleForComplexity(
    animation: AnimationConfig,
    complexity: 'simple' | 'medium' | 'complex'
  ): AnimationConfig {
    const scalingFactors = {
      simple: 0.8,
      medium: 1.0,
      complex: 1.3,
    };

    const factor = scalingFactors[complexity];
    
    return {
      ...animation,
      duration: Math.round((animation.duration || 1500) * factor),
    };
  }

  /**
   * Adapts animation for different themes
   */
  static adaptForTheme(
    animation: AnimationConfig,
    theme: ThemeConfig
  ): AnimationConfig {
    // For dark theme, we might want slower, more subtle animations
    if (theme.type === 'dark') {
      return {
        ...animation,
        duration: Math.round((animation.duration || 1500) * 1.2),
      };
    }

    return animation;
  }

  /**
   * Creates staggered animation for multiple elements
   */
  static createStaggered(
    baseAnimation: AnimationConfig,
    elementIndex: number,
    staggerDelay = 100
  ): AnimationConfig {
    return {
      ...baseAnimation,
      delay: (baseAnimation.delay || 0) + (elementIndex * staggerDelay),
    };
  }

  /**
   * Gets random animation from a set of presets
   */
  static getRandomAnimation(
    excludeTypes: AnimationConfig['type'][] = []
  ): AnimationConfig {
    const allPresets = Object.values(this.getAllPresets());
    const validPresets = allPresets.filter(preset => 
      !excludeTypes.includes(preset.type)
    );
    
    if (validPresets.length === 0) {
      return this.SHIMMER;
    }
    
    const randomIndex = Math.floor(Math.random() * validPresets.length);
    return validPresets[randomIndex];
  }

  /**
   * Creates a synchronized animation group
   */
  static createSynchronized(
    animations: AnimationConfig[]
  ): AnimationConfig[] {
    if (animations.length === 0) return [];

    // Find the longest duration to synchronize all animations
    const maxDuration = Math.max(...animations.map(a => a.duration || 0));
    
    return animations.map(animation => ({
      ...animation,
      duration: maxDuration,
    }));
  }

  /**
   * Validates animation configuration
   */
  static validateAnimation(animation: AnimationConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check animation type
    const validTypes = ['shimmer', 'pulse', 'wave', 'fade', 'none'];
    if (!validTypes.includes(animation.type)) {
      errors.push(`Invalid animation type: ${animation.type}`);
    }

    // Check duration
    if (animation.duration !== undefined) {
      if (animation.duration < 0) {
        errors.push('Animation duration cannot be negative');
      }
      if (animation.type !== 'none' && animation.duration === 0) {
        errors.push('Animation duration should be greater than 0 for animated types');
      }
    }

    // Check delay
    if (animation.delay !== undefined && animation.delay < 0) {
      errors.push('Animation delay cannot be negative');
    }

    // Check direction
    if (animation.direction && !['normal', 'reverse', 'ltr', 'rtl'].includes(animation.direction)) {
      errors.push(`Invalid animation direction: ${animation.direction}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Optimizes animation for performance
   */
  static optimizeForPerformance(
    animation: AnimationConfig,
    elementCount: number
  ): AnimationConfig {
    // For many elements, use simpler animations to improve performance
    if (elementCount > 20) {
      return {
        ...animation,
        type: animation.type === 'wave' ? 'pulse' : animation.type,
        duration: Math.min(animation.duration || 1500, 1000),
      };
    }

    // For very high element counts, disable animations
    if (elementCount > 50) {
      return { ...animation, type: 'none' };
    }

    return animation;
  }

  /**
   * Creates animation based on element type
   */
  static getAnimationForElementType(elementType: string): AnimationConfig {
    const elementAnimations: Record<string, AnimationConfig> = {
      text: this.SHIMMER,
      image: this.PULSE,
      avatar: this.SHIMMER,
      button: this.PULSE,
      input: this.SHIMMER,
      icon: this.FADE,
      card: this.SHIMMER,
      list: this.WAVE,
      container: this.PULSE,
      unknown: this.SHIMMER,
    };

    return elementAnimations[elementType] || this.SHIMMER;
  }

  /**
   * Creates CSS keyframes for custom animations
   */
  static generateCSSKeyframes(
    animationName: string,
    keyframes: Record<string, Record<string, string>>
  ): string {
    const keyframeEntries = Object.entries(keyframes)
      .map(([percentage, styles]) => {
        const styleEntries = Object.entries(styles)
          .map(([property, value]) => `    ${property}: ${value};`)
          .join('\n');
        return `  ${percentage} {\n${styleEntries}\n  }`;
      })
      .join('\n');

    return `@keyframes ${animationName} {\n${keyframeEntries}\n}`;
  }

  /**
   * Creates smooth transition between animations
   */
  static createTransition(
    fromAnimation: AnimationConfig,
    toAnimation: AnimationConfig,
    transitionDuration = 300
  ): {
    intermediateAnimation: AnimationConfig;
    finalAnimation: AnimationConfig;
  } {
    // Create an intermediate state for smooth transition
    const intermediateAnimation: AnimationConfig = {
      type: 'fade',
      duration: transitionDuration,
      direction: 'normal',
    };

    return {
      intermediateAnimation,
      finalAnimation: toAnimation,
    };
  }

  /**
   * Calculates optimal animation duration based on element size
   */
  static calculateOptimalDuration(
    baseAnimation: AnimationConfig,
    elementWidth: number,
    elementHeight: number
  ): AnimationConfig {
    // Larger elements might need longer animations to look smooth
    const elementArea = elementWidth * elementHeight;
    const areaFactor = Math.min(Math.sqrt(elementArea) / 100, 2); // Cap at 2x
    
    const optimizedDuration = Math.round(
      (baseAnimation.duration || 1500) * (0.8 + areaFactor * 0.4)
    );

    return {
      ...baseAnimation,
      duration: optimizedDuration,
    };
  }

  /**
   * Creates responsive animation that adapts to screen size
   */
  static createResponsiveAnimation(
    baseAnimation: AnimationConfig,
    viewportWidth: number
  ): AnimationConfig {
    // Adjust animation speed based on viewport size
    let speedFactor = 1;

    if (viewportWidth < 768) {
      // Mobile: faster animations
      speedFactor = 0.8;
    } else if (viewportWidth > 1920) {
      // Large screens: slower animations
      speedFactor = 1.2;
    }

    return {
      ...baseAnimation,
      duration: Math.round((baseAnimation.duration || 1500) * speedFactor),
    };
  }

  /**
   * Gets animation configuration for loading states
   */
  static getLoadingStateAnimation(
    loadingState: 'initial' | 'progress' | 'complete' | 'error'
  ): AnimationConfig {
    const stateAnimations = {
      initial: this.FAST_SHIMMER,
      progress: this.SHIMMER,
      complete: this.FADE,
      error: this.SLOW_PULSE,
    };

    return stateAnimations[loadingState];
  }
}
