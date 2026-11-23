/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0145F2',
          royal: '#0145F2',
          vivid: '#0145F2',
          highlight: '#0145F2',
          50: '#EEF4FF',
          100: '#DCE8FF',
          200: '#BDD1FF',
          300: '#90ADFF',
          400: '#5E7FFF',
          500: '#0145F2',
          600: '#0145F2',
          700: '#0038C7',
          800: '#002FA3',
          900: '#00297F',
          dark: '#00297F',
        },
        accent: {
          green: '#10B981', // Quick commerce green
          greenDark: '#059669',
          amber: '#F59E0B',
          red: '#EF4444',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0145F2 0%, #0145F2 50%, #90ADFF 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0145F2 0%, #0145F2 50%, #90ADFF 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
