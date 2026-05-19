// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react()
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL || 'http://localhost:5000'),
      'process.env.NEXT_PUBLIC_FRONTEND_URL': JSON.stringify(process.env.PUBLIC_FRONTEND_URL || 'http://localhost:4321')
    }
  }
});