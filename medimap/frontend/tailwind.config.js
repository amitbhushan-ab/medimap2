// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          blue:   '#1B6EF3',
          teal:   '#00C2A8',
          indigo: '#4B5AE8',
          green:  '#12B76A',
          amber:  '#F79009',
          red:    '#F04438',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'blue':  '0 8px 32px rgba(27,110,243,0.25)',
        'teal':  '0 8px 32px rgba(0,194,168,0.2)',
        'green': '0 4px 16px rgba(18,183,106,0.3)',
        'xl2':   '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':    'fadeIn 0.4s ease both',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
      keyframes: {
        fadeUp:      { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown:   { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:       { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:     { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'pulse-ring':{ '0%': { transform: 'scale(1)', opacity: '0.6' }, '100%': { transform: 'scale(1.8)', opacity: '0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
