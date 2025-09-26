import '@testing-library/jest-dom';

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 120,
  height: 120,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    width: '120px',
    height: '120px',
    backgroundColor: 'transparent',
    borderRadius: '0px',
    margin: '0px',
    padding: '0px',
    fontSize: '16px',
    fontWeight: 'normal',
    position: 'static',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 'normal',
    gridTemplate: 'none',
    getPropertyValue: jest.fn((prop: string) => {
      const values: Record<string, string> = {
        'display': 'block',
        'visibility': 'visible',
        'opacity': '1',
        'width': '120px',
        'height': '120px',
        'background-color': 'transparent',
        'border-radius': '0px',
        'margin': '0px',
        'padding': '0px',
        'font-size': '16px',
        'font-weight': 'normal',
        'position': 'static',
        'flex-direction': 'row',
        'justify-content': 'flex-start',
        'align-items': 'flex-start',
        'gap': 'normal',
        'grid-template': 'none',
      };
      return values[prop] || '';
    }),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock performance.now
Object.defineProperty(global.performance, 'now', {
  value: jest.fn(() => Date.now()),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Add helpful custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveSkeletonAnimation(): R;
      toBeValidSkeletonConfig(): R;
    }
  }
}

expect.extend({
  toHaveSkeletonAnimation(received) {
    const hasAnimation = received.style?.animation && received.style.animation !== 'none';
    return {
      message: () => 
        `expected element ${hasAnimation ? 'not ' : ''}to have skeleton animation`,
      pass: hasAnimation,
    };
  },
  
  toBeValidSkeletonConfig(received) {
    const requiredProps = ['type', 'width', 'height'];
    const hasRequiredProps = requiredProps.every(prop => prop in received);
    
    return {
      message: () =>
        `expected skeleton config ${hasRequiredProps ? '' : 'not '}to have required properties: ${requiredProps.join(', ')}`,
      pass: hasRequiredProps,
    };
  },
});

// Silence console errors in tests unless explicitly testing them
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
