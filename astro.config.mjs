import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://andreaspsb.github.io',
  base: '/Lecionario',
  output: 'static',
  integrations: [tailwind()],
});
