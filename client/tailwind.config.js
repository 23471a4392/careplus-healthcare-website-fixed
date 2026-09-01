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
        primary: {
          DEFAULT: '#0c756e',
          light: '#e6f4f2',
          dark: '#08504b',
          hover: '#09635d'
        },
        accent: '#0d9488',
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          darkCard: '#131b26',
          darkBg: '#0b111a'
        }
      },
      borderRadius: {
        'card': '14px'
      }
    },
  },
  plugins: [],
}
