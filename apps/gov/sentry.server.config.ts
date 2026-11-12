import { ResponseError } from '@babyn-yar/api-utils'
import * as Sentry from '@sentry/astro'

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: 'https://dab8e4fea7d354bfbf770bd55b0b8b1a@o4507650143748096.ingest.us.sentry.io/4512414124408832',
  // Tag failed API calls with the API's request id, so the event can be
  // matched to the API's own event and log lines.
  beforeSend(event, hint) {
    const error = hint.originalException
    if (error instanceof ResponseError && error.requestId) {
      event.tags = { ...event.tags, request_id: error.requestId }
    }
    return event
  }
})
