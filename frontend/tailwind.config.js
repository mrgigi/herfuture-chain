/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6ff',
          100: '#e8ecff',
          200: '#d1dbff',
          300: '#aac1ff',
          400: '#7b9cff',
          500: '#496bff',
          600: '#2942ff',
          700: '#1b2bef',
          800: '#1624c0',
          900: '#182399',
        },
        celo: '#35D07F'
      }
    },
  },
  plugins: [],
}
