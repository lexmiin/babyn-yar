import { browser } from '$app/environment'
import { ResponseError } from '@babyn-yar/api-utils'
import { captureException, withScope } from '@sentry/sveltekit'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/svelte-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (error instanceof ResponseError && error.isUnauthorized()) {
        return
      }
      withScope(scope => {
        scope.setContext('mutation', {
          mutationId: mutation.mutationId
        })
        if (error instanceof ResponseError) {
          scope.setFingerprint([
            error.method,
            error.pathname,
            String(error.status)
          ])
        }
        captureException(error)
      })
    }
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof ResponseError && error.isUnauthorized()) {
        return
      }
      withScope(scope => {
        scope.setContext('query', { queryHash: query.queryHash })
        if (error instanceof ResponseError) {
          scope.setFingerprint([
            error.method,
            error.pathname,
            String(error.status)
          ])
        }
        captureException(error)
      })
    }
  }),
  defaultOptions: {
    queries: {
      enabled: browser,
      staleTime: 1000 * 5
    }
  }
})
