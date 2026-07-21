/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    './src/**/*.{ts,tsx,js,jsx}',
    '../../packages/components/**/*.{js,ts,tsx,jsx}',
    '../../packages/assets/**/*.{js,ts,tsx,jsx}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
      screens: {
        lg: '900px', // redefine lg to start at 900px
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
