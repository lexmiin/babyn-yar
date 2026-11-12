import * as Sentry from '@sentry/astro'

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: 'https://dab8e4fea7d354bfbf770bd55b0b8b1a@o4507650143748096.ingest.us.sentry.io/4512414124408832'
})
