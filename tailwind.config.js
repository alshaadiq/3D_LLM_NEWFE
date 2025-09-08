/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          green: '#BEF975',
          'green-hover': '#A8E356',
          'green-active': '#96D142',
          'green-bg': 'rgba(190, 249, 117, 0.08)',
          'green-bg-hover': 'rgba(190, 249, 117, 0.12)',
          'green-bg-active': 'rgba(190, 249, 117, 0.16)',
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
          'on-primary': '#08070B',
          'on-surface': '#FFFFFF',
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
          'error-bg': 'rgba(255, 68, 68, 0.08)',
          warning: '#FFA726',
          'warning-bg': 'rgba(255, 167, 38, 0.08)',
          success: '#66BB6A',
          'success-bg': 'rgba(102, 187, 106, 0.08)',
          info: '#42A5F5',
          'info-bg': 'rgba(66, 165, 245, 0.08)',
        },
      },
      
      // Typography System
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        // Display Typography
        'display-2xl': ['72px', { lineHeight: '90px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-xl': ['60px', { lineHeight: '72px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '60px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-sm': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-xs': ['24px', { lineHeight: '32px', letterSpacing: '-0.025em', fontWeight: '700' }],
        
        // Text Typography
        'text-xl': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        'text-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'text-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'text-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'text-xs': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        
        // Weight variants
        'text-xl-semibold': ['20px', { lineHeight: '30px', fontWeight: '600' }],
        'text-lg-semibold': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'text-md-semibold': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'text-sm-semibold': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'text-xs-semibold': ['12px', { lineHeight: '18px', fontWeight: '600' }],
      },
      
      // Spacing System (8px base unit)
      spacing: {
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
      },
      
      // Border Radius System
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
      
      // Box Shadow System
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(190, 249, 117, 0.3)',
      },
      
      // Animation Durations
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // Z-Index Scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [],
}
