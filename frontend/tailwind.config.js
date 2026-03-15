/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        mama: {
          pink: '#f8bbd0',
          'pink-dark': '#f48fb1',
          'pink-light': '#fce4ec',
          lavender: '#e1bee7',
          'lavender-dark': '#ce93d8',
          'lavender-light': '#f3e5f5',
          peach: '#ffccbc',
          'peach-dark': '#ffab91',
          'peach-light': '#fbe9e7',
          cream: '#fff8f0',
          rose: '#f06292',
          purple: '#ba68c8',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'cute': '20px',
        'xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(248, 187, 208, 0.3)',
        'card': '0 8px 32px rgba(225, 190, 231, 0.2)',
        'hover': '0 12px 40px rgba(248, 187, 208, 0.4)',
      },
    },
  },
  plugins: [],
}
