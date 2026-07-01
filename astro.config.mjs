import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://andreaspsb.github.io',
  base: '/Lecionario',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
