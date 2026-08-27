import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://babynyar.gov.ua',
  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'uk',
        locales: {
          uk: 'uk',
          en: 'en'
        }
      }
    })
  ],
  adapter: node({ mode: 'standalone' }),
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    routing: {
      prefixDefaultLocale: false
    }
  },

  vite: {
    plugins: [tailwindcss()]
  }
})
