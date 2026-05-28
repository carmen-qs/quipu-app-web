/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D9E75',
          light: '#9FE1CB',
          bg: '#E1F5EE',
        },
        alert: {
          DEFAULT: '#D85A30',
          bg: '#FAECE7',
        },
        neutral: {
          dark: '#2C2C2A',
          medium: '#888780',
        },
        surface: '#FFFFFF',
        background: '#F1EFE8',
      },
    },
  },
  plugins: [],
}
