import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        button: 'hsla(54, 100%, 88%, 1)',
        tint: 'hsla(54, 65%, 90%, 1)',
        primary: 'hsla(54, 100%, 20%, 1)',
        white: 'hsla(55, 100%, 98%, 1)',
        black: 'hsla(54, 100%, 13%, 1)',
        secondary: 'hsla(54, 100%, 50%, 1)',
        tertiary: '#CDDC39',
        muted: 'hsla(54, 32%, 57%, 1)',
        'dark-muted': 'hsla(54, 32%, 44%, 1)',
      },
      width: { icon: '24px', 'large-icon': '36px' },
      fontFamily: {
        sans: ['GeneralSans-Variable'],
        serif: ['Boska-Variable'],
      },
      scale: {
        200: '2',
      },
    },
  },
  plugins: [require('daisyui')],
  darkMode: 'class',
  daisyui: {
    themes: [{
      mytheme: {
        button: 'hsla(54, 100%, 88%, 1)',
        tint: 'hsla(54, 65%, 90%, 1)',
        primary: 'hsla(54, 100%, 20%, 1)',
        neutral: 'hsla(54, 100%, 20%, 1)',
        white: 'hsla(55, 100%, 98%, 1)',
        'base-content': 'hsla(55, 100%, 13%, 1)',
        black: 'hsla(54, 100%, 13%, 1)',
        'base-100': 'hsla(54, 65%, 90%, 1)',
        secondary: 'hsla(54, 100%, 50%, 1)',
        tertiary: '#CDDC39',
        accent: '#CDDC39',
        muted: 'hsla(54, 32%, 57%, 1)',
        'dark-muted': 'hsla(54, 32%, 44%, 1)',
        'info': 'hsl(198 100% 50%)',
        'success': '#36d399',
        'warning': '#fbbd23',
        'error': '#f87272',
      },
    }],
    base: false,
  },
} satisfies Config
