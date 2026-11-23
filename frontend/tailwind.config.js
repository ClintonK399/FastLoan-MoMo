/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- This line is crucial. It tells Tailwind to scan your new file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}