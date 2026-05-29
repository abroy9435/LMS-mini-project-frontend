/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#fdf7ff',
        'on-background': '#1d1b20',
        surface: '#fdf7ff',
        'surface-dim': '#ded8e0',
        'surface-container': '#f2ecf4',
        'surface-container-low': '#f8f2fa',
        'surface-container-high': '#ece6ee',
        'on-surface': '#1d1b20',
        'on-surface-variant': '#494551',
        primary: '#4f378a',
        'on-primary': '#ffffff',
        'primary-container': '#6750a4',
        secondary: '#63597c',
        tertiary: '#765b00',
        outline: '#7a7582',
        'outline-variant': '#cbc4d2',
        error: '#ba1a1a',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
      }
    },
  },
  plugins: [],
};