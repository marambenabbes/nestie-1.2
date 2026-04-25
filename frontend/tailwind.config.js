/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        mama: {
          blush: '#FFF5F7',
          cream: '#FFF9F5',
          pink: '#F4C0D1',
          'pink-dark': '#ED93B1',
          'pink-light': '#fce4ec',
          lavender: '#E8C4D8',
          'lavender-dark': '#C98DB8',
          'lavender-light': '#F9EEF4',
          peach: '#F9D4C8',
          'peach-dark': '#F0B0A0',
          'peach-light': '#FFF0EB',
          rose: '#D4537E',
          'rose-deep': '#993556',
          berry: '#72243E',
          purple: '#A85B8F',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'cute': '20px',
        'xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(212, 83, 126, 0.12)',
        'card': '0 8px 32px rgba(200, 141, 184, 0.15)',
        'hover': '0 16px 48px rgba(212, 83, 126, 0.2)',
        'glass': '0 8px 32px rgba(200, 141, 184, 0.1)',
        'glow-rose': '0 0 30px rgba(212, 83, 126, 0.2)',
        'glow-deep': '0 0 40px rgba(153, 53, 86, 0.15)',
      },
    },
  },
  plugins: [],
}
