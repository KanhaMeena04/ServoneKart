/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0055ff',
          dark: '#0043c7',
          light: '#3b82f6',
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#0055ff',
          600: '#0047d6',
          700: '#0036ad',
        },
        accent: {
          DEFAULT: '#00b4d8',
          dark: '#0096c7',
          light: '#48cae4',
        },
        brand: {
          blue: '#0055ff',
          dark: '#03132e',
          cyan: '#00b4d8',
        },
        darkblack: '#0f172a',
        lightgreen: '#93c5fd',
        lightorange: '#60a5fa',
        offwhite: '#f8faff',
        cream: '#eff6ff',
      },
    },
  },
  plugins: [],
};
