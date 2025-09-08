/**
 * Aetosky Design System Types
 * TypeScript type definitions for the design system
 */

export interface TypographyVariant {
  fontSize: string
  lineHeight: string
  fontWeight: string
  letterSpacing?: string
}

export interface ColorPalette {
  primary: {
    green: string
    greenHover: string
    greenActive: string
    greenBg: string
    greenBgHover: string
    greenBgActive: string
  }
  surface: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
    neutral: string
    disabled: string
    brand: string
    onPrimary: string
    onSurface: string
    inverse: string
  }
  border: {
    primary: string
    secondary: string
    tertiary: string
    focus: string
    error: string
    warning: string
    success: string
  }
  state: {
    hover: string
    active: string
    selected: string
    disabled: string
  }
  semantic: {
    error: string
    errorBg: string
    warning: string
    warningBg: string
    success: string
    successBg: string
    info: string
    infoBg: string
  }
}

export interface TypographySystem {
  fontFamily: {
    sans: string
    mono: string
  }
  display: Record<string, TypographyVariant>
  text: Record<string, TypographyVariant>
  semibold: Record<string, TypographyVariant>
}

export interface ComponentVariants {
  base: string
  variants: Record<string, string>
  sizes?: Record<string, string>
  padding?: Record<string, string>
}

export interface DesignSystemReturn {
  colors: ColorPalette
  typography: TypographySystem
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  boxShadow: Record<string, string>
  transitions: Record<string, string>
  zIndex: Record<string, number>
  getTypographyStyles: (variant: string, weight?: 'normal' | 'semibold') => Partial<CSSStyleDeclaration>
  getColorWithOpacity: (colorPath: string, opacity?: number) => string
  getSpacing: (key: string) => string
  createComponentStyle: (baseClasses?: string, variants?: Record<string, string>) => ComponentVariants
}

// Theme configuration interface
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  fontFamily: string
}

// Component prop types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type InputVariant = 'default' | 'error'
export type InputSize = 'sm' | 'md' | 'lg'

export type CardVariant = 'default' | 'elevated' | 'interactive'
export type CardPadding = 'sm' | 'md' | 'lg'

// Responsive breakpoints
export interface Breakpoints {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export const breakpoints: Breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Animation curves
export interface AnimationCurves {
  linear: string
  easeIn: string
  easeOut: string
  easeInOut: string
  bounce: string
}

export const animationCurves: AnimationCurves = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

export default {}
