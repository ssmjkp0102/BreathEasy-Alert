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
        'aqi-good': '#00E400',
        'aqi-moderate': '#FFFF00',
        'aqi-unhealthy-sensitive': '#FF7E00',
        'aqi-unhealthy': '#FF0000',
        'aqi-very-unhealthy': '#8F3F97',
        'aqi-hazardous': '#7E0023',
      },
    },
  },
  plugins: [],
}

