/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#BEF975',
          'green-bg': 'rgba(190, 249, 117, 0.15)',
        },
        surface: {
          primary: '#EFEFEF',
          secondary: '#E6E6E6',
          tertiary: '#D9D9D9',
        },
        text: {
          primary: '#151515',
          secondary: '#444444',
          tertiary: '#757575',
          neutral: '#B3B3B3',
          brand: '#08070B',
          white: '#FFFFFF',
        },
        border: {
          primary: 'rgba(12, 12, 13, 0.1)',
          secondary: 'rgba(12, 12, 13, 0.2)',
        },
        opacity: {
          100: 'rgba(12, 12, 13, 0.05)',
          200: 'rgba(12, 12, 13, 0.1)',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '2xl': ['32px', { lineHeight: '150%', letterSpacing: '-0.32px' }],
        'xl': ['24px', { lineHeight: '150%' }],
        'lg': ['20px', { lineHeight: '150%' }],
        'base': ['16px', { lineHeight: '120%' }],
        'sm': ['14px', { lineHeight: '120%' }],
      },
    },
  },
  plugins: [],
}
