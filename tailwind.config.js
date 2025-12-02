/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        'screen': '100vw',
      },
      spacing: {
        'safe': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    container: false,
  },
}
