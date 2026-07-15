import type { PublicationSchema } from '@babyn-yar/schema'

export type PublicationRoute = {
  kind: PublicationSchema.Kind
  title: string
}

const publicationRoutesBySlug: Record<string, PublicationRoute> = {
  events: {
    title: 'Події',
    kind: 'event'
  },
  'development-concept': {
    title: 'Концепція розвитку',
    kind: 'development_concept'
  },
  'media-articles': {
    title: 'ЗМІ про заповідник',
    kind: 'media_article'
  },
  'holocaust-documents': {
    title: 'Документи Голокосту',
    kind: 'holocaust_document'
  },
  'legal-documents': {
    title: 'Документи',
    kind: 'legal_document'
  },
  library: {
    title: 'Бібліотека',
    kind: 'book'
  },
  partners: {
    title: 'Партнери',
    kind: 'partner'
  },
  'victim-testimonies': {
    title: 'Свідчення очевидців трагедії',
    kind: 'victim_testimony'
  }
}

export function findPublicationRoute(slug: string | undefined) {
  if (!slug) return undefined
  return publicationRoutesBySlug[slug]
}
