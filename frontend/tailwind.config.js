/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe6',
          300: '#a6bfd3',
          400: '#739bb9',
          500: '#527e9f',
          600: '#3e6382',
          700: '#33506a',
          800: '#2c435a',
          900: '#293a4c',
          950: '#1a2432',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
