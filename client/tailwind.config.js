/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'discord': {
          'primary': '#5865F2',
          'green': '#3BA55D',
          'bg': '#36393f',
          'secondary': '#2f3136',
          'tertiary': '#202225',
          'text': '#dcddde'
        }
      }
    },
  },
  plugins: [],
}