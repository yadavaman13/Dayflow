/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#A24689',
        primary: '#714B67',
        'primary-light': '#8a5b7d',
        'primary-dark': '#5a3c52',
      },
    },
  },
  plugins: [],
}
