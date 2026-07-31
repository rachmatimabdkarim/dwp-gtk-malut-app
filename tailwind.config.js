/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dwp: {
          burgundy: '#6b0f1a',
          darkBurgundy: '#4a0911',
          lightBurgundy: '#8c1626',
          gold: '#d4af37',
          darkGold: '#aa8822',
          lightGold: '#f4e086',
          cream: '#fffdf5',
          navy: '#0f172a'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
