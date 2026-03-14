/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2E7DFF',
          600: '#1d6ef5',
          700: '#1a5fd6',
        },
        teal: {
          400: '#2dd4bf',
          500: '#00C2A8',
          600: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Clash Display', 'DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
