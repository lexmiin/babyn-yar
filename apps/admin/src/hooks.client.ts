import type { HandleClientError } from '@sveltejs/kit/hooks'
import * as Sentry from '@sentry/sveltekit'

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: 'https://2fa0f5212da27f8a385d59ee059814bc@o4507650143748096.ingest.us.sentry.io/4509004455149568',
  environment: import.meta.env.PROD ? 'production' : 'development',
  tracesSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.2
})

const errorHandler: HandleClientError = ({ event, error }) => {
  console.error('An error occurred on the client side: ', error, event)
}

export const handleError = Sentry.handleErrorWithSentry(errorHandler)
