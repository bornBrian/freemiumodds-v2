/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4E5B2',
          dark: '#B8942C',
        },
        platinum: {
          DEFAULT: '#E5E4E2',
          light: '#F5F5F3',
          dark: '#C0BFBD',
        },
        accent: {
          green: '#10B981',
          red: '#EF4444',
          blue: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}
