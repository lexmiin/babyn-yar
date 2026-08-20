import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
// import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://babynyar.gov.ua',
  devToolbar: { enabled: false },
  integrations: [react(), mdx(), sitemap()],
  // TODO: Restore the Node adapter before merging this branch into main.
  // adapter: node({ mode: 'standalone' }),
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()]
  }
})
