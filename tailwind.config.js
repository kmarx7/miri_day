/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Pretendard','Inter','sans-serif'] },
      colors: {
        banner: '#FFFBEB',
        cardBlue: '#EAF2FF',
        cardOrange: '#FFF3E0',
        cardGreen: '#E8F8F0',
        cardPurple: '#F3E8FF',
      }
    },
  },
  plugins: [],
}