module.exports = {
  mode: 'jit',
  purge: ['./src/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      height: {
        ribbon: 'calc(100vh - 25px)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
