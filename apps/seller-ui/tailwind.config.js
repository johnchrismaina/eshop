/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '../seller-ui/src/**/*.{js,ts,tsx,jsx}',
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
      keyframes: {
        'fade-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        'slide-up-in': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down-out': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'fade-scale-in': 'fade-scale-in 0.2s ease-out forwards',
        'fade-scale-out': 'fade-scale-out 0.15s ease-in forwards',
        'slide-up-in': 'slide-up-in 0.25s ease-out forwards',
        'slide-down-out': 'slide-down-out 0.2s ease-in forwards',
      },
    },
  },
  plugins: [],
};
