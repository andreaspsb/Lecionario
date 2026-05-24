/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        parchment: {
          50: '#fdf9f0',
          100: '#faf0d7',
          200: '#f4dfa8',
        },
        liturgical: {
          purple: '#6b21a8',
          green: '#166534',
          white: '#f8fafc',
          red: '#991b1b',
          gold: '#b45309',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
