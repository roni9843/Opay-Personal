/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        bkash: '#e2136e',
        nagad: '#f7931e',
        rocket: '#8c3494',
        upay: '#00a651',
        darkBg: '#090d16',
        darkCard: 'rgba(17, 24, 39, 0.7)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        glowEmerald: '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        glowPink: '0 0 25px -5px rgba(226, 19, 110, 0.4)',
      },
    },
  },
  plugins: [],
};
