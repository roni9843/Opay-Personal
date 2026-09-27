/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fancyBg: '#130c25',
        fancySidebar: '#1d1339',
        fancyCard: 'rgba(38, 24, 69, 0.65)',
        fancyCardHover: 'rgba(56, 35, 102, 0.8)',
        fancyBorder: 'rgba(255, 255, 255, 0.12)',
        fancyPink: '#ff2d85',
        fancyPurple: '#9333ea',
        fancyCyan: '#00f2fe',
        fancyBlue: '#3b82f6',
        fancyGreen: '#10b981',
        bkash: '#e2136e',
        nagad: '#f7931e',
        rocket: '#8c3494',
        upay: '#00a651',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        fancyGlow: '0 0 30px -5px rgba(255, 45, 133, 0.5)',
        fancyPurpleGlow: '0 0 30px -5px rgba(147, 51, 234, 0.5)',
        fancyCyanGlow: '0 0 30px -5px rgba(0, 242, 254, 0.5)',
      },
      backgroundImage: {
        'fancy-topbar': 'linear-gradient(90deg, #ff2d85 0%, #b829ea 40%, #4f46e5 100%)',
        'fancy-card-gradient': 'linear-gradient(135deg, rgba(62, 36, 110, 0.7) 0%, rgba(33, 19, 61, 0.7) 100%)',
      },
    },
  },
  plugins: [],
};
