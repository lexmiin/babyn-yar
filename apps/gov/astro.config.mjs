import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
// import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://babynyar.gov.ua',
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'public.babynyar.work',
        pathname: '/**'
      }
    ]
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Roboto',
      cssVariable: '--font-roboto',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/RobotoCondensed-Regular.woff2'],
            weight: '400',
            style: 'normal'
          },
          {
            src: ['./src/assets/fonts/RobotoCondensed-Bold.woff2'],
            weight: '700',
            style: 'normal'
          },
          {
            src: ['./src/assets/fonts/RobotoCondensed-Italic.woff2'],
            weight: '400',
            style: 'italic'
          },
          {
            src: ['./src/assets/fonts/RobotoCondensed-LightItalic.woff2'],
            weight: '300',
            style: 'italic'
          },
          {
            src: ['./src/assets/fonts/RobotoCondensed-BoldItalic.woff2'],
            weight: '700',
            style: 'italic'
          }
        ]
      }
    }
  ],
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
  devToolbar: { enabled: false },
  // TODO: Restore the Node adapter before merging this branch into main.
  // adapter: node({ mode: 'standalone' }),
  adapter: vercel(),
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
