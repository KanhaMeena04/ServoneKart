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
          navy: '#07162E',       // Deep Navy - Dark background
          royal: '#0A2B6B',      // Royal Blue - Primary gradient
          vivid: '#0B3EDB',      // Vivid Blue - Gradient highlight
          highlight: '#0D5AA6',  // Highlight Blue - Glow / accent
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c2d9ff',
          300: '#94beff',
          400: '#0D5AA6',        // Highlight Blue
          500: '#0B3EDB',        // Vivid Blue (Primary CTA)
          600: '#0A2B6B',        // Royal Blue (Primary Brand)
          700: '#092359',
          800: '#081c44',
          900: '#07162E',        // Deep Navy (Dark Background)
          dark: '#07162E',
        },
        accent: {
          green: '#10B981', // Quick commerce green
          greenDark: '#059669',
          amber: '#F59E0B',
          red: '#EF4444',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #07162E 0%, #0A2B6B 50%, #0B3EDB 100%)',
        'primary-gradient': 'linear-gradient(135deg, #07162E 0%, #0A2B6B 50%, #0B3EDB 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

