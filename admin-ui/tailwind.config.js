/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          surface: '#0f172a', // Matches your Aura background
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        keyframes: {
          'slide-up': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        animation: {
          'slide-up': 'slide-up 0.5s ease-out',
        },
      },
    },
    plugins: [],
  }