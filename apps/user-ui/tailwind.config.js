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
        libre: ['Libre Franklin', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
      },
      screens: {
        lg: '900px', // redefine lg to start at 900px
      },
      keyframes: {
        'fade-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
      },
      animation: {
        'fade-scale-in': 'fade-scale-in 0.2s ease-out forwards',
        'fade-scale-out': 'fade-scale-out 0.15s ease-in forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
