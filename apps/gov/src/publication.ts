import { PublicationAPI, ResponseError } from '@babyn-yar/api-utils'
import type { PublicationSchema } from '@babyn-yar/schema'

type DetailParams = Parameters<typeof PublicationAPI.detail>[0]

/**
 * Fetches a publication for a detail page, returning `undefined` and marking
 * the response 404 when it does not exist.
 *
 * Call this from page frontmatter: Astro has already started streaming by the
 * time a child component runs, so a status set there is silently dropped.
 */
export async function loadPublication(
  params: DetailParams,
  response: { status: number }
): Promise<PublicationSchema.Detail | undefined> {
  try {
    return (await PublicationAPI.detail(params)).publication
  } catch (error) {
    if (error instanceof ResponseError && error.isNotFoundError()) {
      response.status = 404
      return undefined
    }
    throw error
  }
}
