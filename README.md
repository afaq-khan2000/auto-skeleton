# Auto-Skeleton NPM Package

## Project Overview

Create an NPM package called `auto-skeleton` that automatically generates skeleton loaders for React/Next.js applications by analyzing existing components and matching their dimensions, styling, and layout patterns.

## Problem Statement

Currently, developers using skeleton loaders (like MUI's Skeleton) must:
- Manually define height, width, and styling for each skeleton element
- Recreate the layout structure of their components
- Maintain consistency between actual content and skeleton versions
- Spend significant time creating and updating skeleton states

## Solution

Auto-skeleton will intelligently analyze React components and automatically generate matching skeleton loaders with:
- Automatic dimension detection
- Style inheritance
- Layout preservation
- Zero manual configuration required

## Core Features

### 1. Component Analysis
- Parse React/JSX components to identify renderable elements
- Extract styling information (CSS classes, inline styles, computed styles)
- Determine element dimensions and positioning
- Map component hierarchy and layout structure

### 2. Intelligent Skeleton Generation
- Generate skeleton placeholders that match original element dimensions
- Preserve spacing, margins, and padding
- Maintain responsive behavior
- Handle different element types (text, images, buttons, cards, etc.)

### 3. Automatic Integration
- Provide React hooks and HOCs for easy integration
- Support both class and functional components
- Work seamlessly with popular UI libraries (MUI, Tailwind, Chakra UI, etc.)
- Next.js optimized with SSR support

### 4. Customization Options
- Override specific skeleton properties when needed
- Global theming and styling options
- Animation customization (shimmer, pulse, wave effects)
- Conditional skeleton rendering based on loading states

## Technical Requirements

### Dependencies
- React 16.8+ (hooks support)
- TypeScript support
- Next.js compatibility
- Support for popular CSS frameworks

### Core APIs

#### Primary Hook
```typescript
const { SkeletonComponent, isLoading, setLoading } = useAutoSkeleton(ComponentToAnalyze, options);
```

#### HOC Pattern
```typescript
const ComponentWithSkeleton = withAutoSkeleton(OriginalComponent, options);
```

#### Direct Component Analysis
```typescript
const skeletonConfig = analyzeComponent(ComponentRef, options);
const SkeletonLoader = generateSkeleton(skeletonConfig);
```

### Analysis Engine
- DOM measurement and style computation
- CSS parser for extracting relevant styling
- Layout detection (flex, grid, absolute positioning)
- Responsive breakpoint handling
- Component tree traversal and mapping

### Skeleton Generation
- SVG-based skeleton shapes for scalability
- CSS animations (shimmer, pulse, fade)
- Accessibility considerations (aria-labels, reduced motion)
- Performance optimization for multiple skeletons

## Package Structure

```
auto-skeleton/
├── src/
│   ├── core/
│   │   ├── analyzer.ts          # Component analysis logic
│   │   ├── generator.ts         # Skeleton generation engine
│   │   └── measurer.ts          # DOM measurement utilities
│   ├── components/
│   │   ├── AutoSkeleton.tsx     # Main skeleton component
│   │   ├── SkeletonProvider.tsx # Context provider
│   │   └── primitives/          # Basic skeleton elements
│   ├── hooks/
│   │   ├── useAutoSkeleton.ts   # Primary hook
│   │   └── useSkeletonState.ts  # Loading state management
│   ├── hocs/
│   │   └── withAutoSkeleton.tsx # HOC wrapper
│   ├── utils/
│   │   ├── styleExtractor.ts    # CSS style extraction
│   │   ├── dimensionCalculator.ts
│   │   └── animationPresets.ts
│   └── types/
│       └── index.ts             # TypeScript definitions
├── examples/                    # Usage examples
├── docs/                       # Documentation
└── tests/                      # Test suites
```

## Development Phases

### Phase 1: Core Analysis Engine
- Implement component parsing and DOM measurement
- Create basic skeleton shape generation
- Develop style extraction utilities

### Phase 2: React Integration
- Build primary hook and HOC patterns
- Implement loading state management
- Create skeleton component library

### Phase 3: Advanced Features
- Add animation system
- Implement responsive behavior
- Create theming and customization options

### Phase 4: Framework Integration
- Next.js SSR support
- Popular UI library integrations
- Performance optimizations

### Phase 5: Polish & Documentation
- Comprehensive testing
- Documentation and examples
- Performance benchmarking

## Usage Examples

### Basic Usage
```typescript
import { useAutoSkeleton } from 'auto-skeleton';

function MyComponent({ data, loading }) {
  const { SkeletonComponent } = useAutoSkeleton(ContentComponent);
  
  if (loading) return <SkeletonComponent />;
  return <ContentComponent data={data} />;
}
```

### Advanced Configuration
```typescript
const options = {
  animation: 'shimmer',
  theme: 'dark',
  preserveAspectRatio: true,
  customOverrides: {
    '.user-avatar': { shape: 'circle' },
    '.description': { lines: 3 }
  }
};
```

## Success Metrics
- Zero-configuration skeleton generation for 90% of common components
- Performance impact < 5% during analysis
- Bundle size < 50KB gzipped
- Support for major React frameworks and UI libraries
- High developer satisfaction and adoption rate

## Competitive Advantages
- **Zero Configuration**: No manual height/width definitions required
- **Intelligent Analysis**: Automatically matches original component styling
- **Framework Agnostic**: Works with any React setup
- **Performance Focused**: Optimized analysis and rendering
- **Developer Experience**: Simple API with powerful customization