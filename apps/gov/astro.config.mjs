import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import sentry from '@sentry/astro'

import tailwindcss from '@tailwindcss/vite'

const { SENTRY_ORG, SENTRY_AUTH_TOKEN } = process.env

// https://astro.build/config
export default defineConfig({
  site: 'https://babynyar.gov.ua',
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'public.babynyar.work',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'static.babynyar.work',
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
    }),
    // The SDK is initialised in sentry.client.config.ts and
    // sentry.server.config.ts, and only sends from production builds.
    sentry({
      project: 'babyn-yar-gov',
      telemetry: false,
      sourcemaps: {
        disable: !(SENTRY_ORG && SENTRY_AUTH_TOKEN)
      }
    })
  ],
  devToolbar: { enabled: false },
  adapter: node({ mode: 'standalone' }),
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    routing: {
      prefixDefaultLocale: false
    }
  },

  vite: {
    // Sentry only reports errors here, so drop its tracing and debug code from
    // the client bundle, which roughly halves what the SDK adds to each page.
    define: { __SENTRY_TRACING__: false, __SENTRY_DEBUG__: false },
    plugins: [tailwindcss()]
  }
})
