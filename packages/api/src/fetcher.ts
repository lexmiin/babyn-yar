import { ResponseError } from './response-error'

const DEFAULT_REQUEST_OPTS: RequestInit = {
  credentials: 'include'
}

export async function fetcher(url: URL | string, opts: RequestInit = {}) {
  const response = await fetch(url, { ...DEFAULT_REQUEST_OPTS, ...opts })
  if (!response.ok) {
    let responseError: string | Record<string, string>
    try {
      const { error } = await response.json()
      responseError = error
    } catch (_error) {
      responseError = response.statusText
    }
    const method = opts.method ?? 'GET'
    throw new ResponseError({
      method,
      status: response.status,
      url: response.url,
      error: responseError,
      requestId: response.headers.get('X-Request-Id') ?? undefined
    })
  }
  return response.json()
}
