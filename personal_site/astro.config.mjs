// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://miguelgarglez.github.io',
  base: '/personal_site',
  integrations: [
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
          'mail',
          'map-pin',
          'moon',
          'phone',
          'shield',
          'sparkles',
          'sun',
          'trophy',
          'users',
        ],
      },
    }),
  ],
});
