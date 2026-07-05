import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://babynyar.gov.ua',
  integrations: [react(), mdx(), sitemap()],
  adapter: node({ mode: 'standalone' }),

  vite: {
    plugins: [tailwindcss()]
  }
})
