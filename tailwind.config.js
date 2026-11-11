/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111', // text / dark elements
        brand: {
          DEFAULT: '#FF7A00', // CTAs, active states, own chat bubbles
          dark: '#E06A00', // hover
        },
        surface: '#F5F5F5', // secondary background
        line: '#E5E5E5', // borders
      },
      boxShadow: {
        card: '0 2px 12px rgba(17, 17, 17, 0.06)',
        'card-hover': '0 8px 24px rgba(17, 17, 17, 0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
