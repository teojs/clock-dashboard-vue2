module.exports = {
  purge: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Huninn',
          'Varela Round',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        display: ['Huninn', 'sans-serif'],
      },
      colors: {
        accent: {
          glow: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  variants: {},
  plugins: [],
}
