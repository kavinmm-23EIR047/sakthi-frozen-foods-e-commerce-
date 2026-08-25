/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
        display: ['var(--font-bricolage)', 'sans-serif'],
        poppins: ['var(--font-bricolage)', 'sans-serif'],
      },
      colors: {
        olive: {
          50: '#f4f6f1',
          100: '#e5ebd9',
          200: '#cbd7b6',
          300: '#abba8a',
          400: '#8e9d64',
          500: '#656B4F', // Primary olive swatch
          600: '#50563D',
          700: '#353c2b',
          800: '#2b3024',
          900: '#25291f',
        },
        slateBrand: {
          50: '#f5f6f5',
          100: '#e5e7e5',
          200: '#c9cdca',
          300: '#a7ada9',
          400: '#7f8782',
          500: '#676662',
          600: '#434741',
          700: '#383b37',
          800: '#30322f',
          900: '#2b2d2a',
        },
        charcoal: {
          50: '#f4f5f4',
          100: '#e2e4e2',
          200: '#c5c8c4',
          300: '#9fa49d',
          400: '#747a71',
          500: '#4a4f47',
          600: '#393d37',
          700: '#2e312c',
          800: '#2F2F2F', // Dark charcoal swatch
          900: '#151714',
        },
        mediumSlate: {
          DEFAULT: '#676662',
        },
        brokenWhite: {
          DEFAULT: '#FBFDF2', // Broken White swatch
        },
        cameliaWhite: {
          DEFAULT: '#F3FBEE', // Camellia White swatch
        },
      },
    },
  },
  plugins: [],
};
