import { findPublicationRoute } from '$lib/publications/routes'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = ({ params }) => {
  const publicationRoute = findPublicationRoute(params.publicationKind)

  return {
    publicationRoute,
    publicationSlug: params.publicationKind
  }
}
