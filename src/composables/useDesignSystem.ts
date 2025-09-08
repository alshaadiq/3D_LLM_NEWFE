/**
 * Aetosky Design System Composable (TypeScript)
 * Provides programmatic access to design tokens and utilities
 */

import type { 
  ColorPalette, 
  TypographySystem, 
  ComponentVariants, 
  DesignSystemReturn 
} from '@/types/design-system'

// Color Tokens
export const colors: ColorPalette = {
  // Primary Brand Colors
  primary: {
    green: '#BEF975',
    greenHover: '#A8E356',
    greenActive: '#96D142',
    greenBg: 'rgba(190, 249, 117, 0.08)',
    greenBgHover: 'rgba(190, 249, 117, 0.12)',
    greenBgActive: 'rgba(190, 249, 117, 0.16)',
  },

  // Surface Colors (Dark Theme)
  surface: {
    primary: '#181818',
    secondary: '#1E1E1E',
    tertiary: '#2A2A2A',
    quaternary: '#333333',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E5E5',
    tertiary: '#B3B3B3',
    quaternary: '#808080',
    neutral: '#666666',
    disabled: '#404040',
    brand: '#08070B',
    onPrimary: '#08070B',
    onSurface: '#FFFFFF',
    inverse: '#181818',
  },

  // Border Colors
  border: {
    primary: 'rgba(255, 255, 255, 0.12)',
    secondary: 'rgba(255, 255, 255, 0.08)',
    tertiary: 'rgba(255, 255, 255, 0.04)',
    focus: '#BEF975',
    error: '#FF4444',
    warning: '#FFA726',
    success: '#66BB6A',
  },

  // State Colors
  state: {
    hover: 'rgba(255, 255, 255, 0.04)',
    active: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(190, 249, 117, 0.12)',
    disabled: 'rgba(255, 255, 255, 0.02)',
  },

  // Semantic Colors
  semantic: {
    error: '#FF4444',
    errorBg: 'rgba(255, 68, 68, 0.08)',
    warning: '#FFA726',
    warningBg: 'rgba(255, 167, 38, 0.08)',
    success: '#66BB6A',
    successBg: 'rgba(102, 187, 106, 0.08)',
    info: '#42A5F5',
    infoBg: 'rgba(66, 165, 245, 0.08)',
  },
}

// Typography Tokens
export const typography: TypographySystem = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    mono: 'JetBrains Mono, SF Mono, Consolas, monospace',
  },

  // Display Typography
  display: {
    '2xl': { fontSize: '72px', lineHeight: '90px', fontWeight: '700', letterSpacing: '-0.025em' },
    'xl': { fontSize: '60px', lineHeight: '72px', fontWeight: '700', letterSpacing: '-0.025em' },
    'lg': { fontSize: '48px', lineHeight: '60px', fontWeight: '700', letterSpacing: '-0.025em' },
    'md': { fontSize: '36px', lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.025em' },
    'sm': { fontSize: '30px', lineHeight: '38px', fontWeight: '700', letterSpacing: '-0.025em' },
    'xs': { fontSize: '24px', lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.025em' },
  },

  // Text Typography
  text: {
    'xl': { fontSize: '20px', lineHeight: '30px', fontWeight: '400' },
    'lg': { fontSize: '18px', lineHeight: '28px', fontWeight: '400' },
    'md': { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    'sm': { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    'xs': { fontSize: '12px', lineHeight: '18px', fontWeight: '400' },
  },

  // Semibold variants
  semibold: {
    'xl': { fontSize: '20px', lineHeight: '30px', fontWeight: '600' },
    'lg': { fontSize: '18px', lineHeight: '28px', fontWeight: '600' },
    'md': { fontSize: '16px', lineHeight: '24px', fontWeight: '600' },
    'sm': { fontSize: '14px', lineHeight: '20px', fontWeight: '600' },
    'xs': { fontSize: '12px', lineHeight: '18px', fontWeight: '600' },
  },
}

// Spacing Tokens (8px base unit)
export const spacing: Record<string, string> = {
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  '3.5': '14px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
  '11': '44px',
  '12': '48px',
  '14': '56px',
  '16': '64px',
  '18': '72px',
  '20': '80px',
  '24': '96px',
  '28': '112px',
  '32': '128px',
  '36': '144px',
  '40': '160px',
  '44': '176px',
  '48': '192px',
  '52': '208px',
  '56': '224px',
  '60': '240px',
  '64': '256px',
  '72': '288px',
  '80': '320px',
  '96': '384px',
}

// Border Radius Tokens
export const borderRadius: Record<string, string> = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
}

// Box Shadow Tokens
export const boxShadow: Record<string, string> = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  focus: '0 0 0 3px rgba(190, 249, 117, 0.3)',
}

// Animation & Transition Tokens
export const transitions: Record<string, string> = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
}

// Z-Index Scale
export const zIndex: Record<string, number> = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
}

// Utility Functions
export const useDesignSystem = (): DesignSystemReturn => {
  // Helper function to get typography styles as CSS object
  const getTypographyStyles = (variant: string, weight: 'normal' | 'semibold' = 'normal') => {
    const weights = weight === 'semibold' ? typography.semibold : 
                   variant.startsWith('display') ? typography.display : 
                   typography.text

    const variantKey = variant.replace('display-', '').replace('text-', '')
    const styles = weights[variantKey]
    
    if (!styles) {
      console.warn(`Typography variant "${variant}" not found`)
      return {}
    }

    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
      letterSpacing: styles.letterSpacing || 'normal',
      fontFamily: typography.fontFamily.sans,
    }
  }

  // Helper function to get color with opacity
  const getColorWithOpacity = (colorPath: string, opacity: number = 1): string => {
    const pathArray = colorPath.split('.')
    let color: any = colors
    
    for (const key of pathArray) {
      color = color[key]
      if (!color) {
        console.warn(`Color path "${colorPath}" not found`)
        return 'transparent'
      }
    }
    
    if (opacity === 1 || typeof color !== 'string') {
      return color
    }
    
    // Convert hex to rgba if opacity is provided
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    
    return color
  }

  // Helper function to get spacing value
  const getSpacing = (key: string): string => spacing[key] || '0px'

  // Helper function to create consistent component styles
  const createComponentStyle = (baseClasses: string = '', variants: Record<string, string> = {}): ComponentVariants => {
    return {
      base: baseClasses,
      variants,
    }
  }

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    boxShadow,
    transitions,
    zIndex,
    getTypographyStyles,
    getColorWithOpacity,
    getSpacing,
    createComponentStyle,
  }
}

// Component Style Presets
export const componentStyles = {
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-surface-primary',
    variants: {
      primary: 'bg-primary-green text-text-brand hover:bg-primary-green-hover active:bg-primary-green-active',
      secondary: 'bg-surface-secondary text-text-primary border border-border-primary hover:bg-state-hover active:bg-state-active',
      ghost: 'text-text-primary hover:bg-state-hover active:bg-state-active',
      destructive: 'bg-semantic-error text-white hover:bg-red-600 active:bg-red-700',
    },
    sizes: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-md',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
  },
  
  input: {
    base: 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green',
    variants: {
      default: 'bg-surface-secondary border-border-primary text-text-primary placeholder-text-quaternary',
      error: 'bg-surface-secondary border-semantic-error text-text-primary placeholder-text-quaternary',
    },
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-md',
      lg: 'px-6 py-4 text-lg',
    },
  },

  card: {
    base: 'rounded-xl border border-border-primary bg-surface-secondary',
    variants: {
      default: '',
      elevated: 'shadow-lg',
      interactive: 'hover:border-border-secondary transition-colors duration-200 cursor-pointer',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
}

export default useDesignSystem
