/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stardew: {
          bg: '#f2eee3',
          card: '#fffdf7',
          'green-dark': '#2f5f3a',
          green: '#4f7d4e',
          'green-light': '#79a36d',
          brown: '#4f3a2a',
          'brown-soft': '#7a6753',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
