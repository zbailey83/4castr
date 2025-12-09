/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}" // Just in case
  ],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#00d4ff',
        'lime-green': '#9aff00',
        'hot-pink': '#ff006e',
        'chrome-silver': '#e8e8f0',
        'cyber-purple': '#bf00ff',
      },
      fontFamily: {
        heading: ['Righteous', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
