// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://miguelgarglez.github.io',
  base: '/personal_site',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    icon({
      include: {
        lucide: [
          'brain',
          'book-open',
          'command',
          'cpu',
          'globe',
          'graduation-cap',
          'linkedin',
          'map-pin',
          'moon',
          'arrow-up-right',
          'chevron-down',
          'shield',
          'sparkles',
          'sun',
          'trophy',
          'users',
        ],
        'simple-icons': ['x'],
      },
    }),
  ],
});
