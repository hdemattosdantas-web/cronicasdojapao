/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'japan-red': '#DC143C',
        'japan-black': '#1a1a1a',
        'japan-gold': '#FFD700',
        'japan-cream': '#FFF8DC',
      },
      fontFamily: {
        'japan': ['serif'],
      },
    },
  },
  plugins: [],
}
