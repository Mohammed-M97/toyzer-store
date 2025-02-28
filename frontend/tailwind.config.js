/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: {
          600: '#E6E6FA', // Original lavender color
          700: '#6B21A8', // Darker lavender color
        },
      },
    },
  },
  plugins: [],
}