/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stardew: {
          bg: '#f8f6f0',
          card: '#fffef9',
          'green-dark': '#2d5a27',
          green: '#3d7c2f',
          'green-light': '#5a9e4a',
          brown: '#4a3728',
          'brown-soft': '#6b5344',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
