// Mirrors the API's upper bound (apps/api/internal/pagination); larger values
// are rejected with a 422.
const MAX_PAGE = 10_000_000

/**
 * Reads the 1-based `?page=` query parameter, falling back to the first page
 * when it is missing or not a page number the API accepts, so a malformed
 * link renders page 1 instead of failing the request.
 */
export function parsePage(url: URL): number {
  const page = Number(url.searchParams.get('page'))
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1
}
