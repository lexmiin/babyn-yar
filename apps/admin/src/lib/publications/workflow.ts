import type { PublicationSchema } from '@babyn-yar/schema'
import type { PublicationForm } from './schema'

export type PublicationCommand =
  | { type: 'create'; input: PublicationSchema.CreateInput }
  | {
      type: 'addTranslation'
      publicationId: number
      expectedVersion: number
      input: PublicationSchema.AddTranslationInput
    }

function publicationWriteFields(form: PublicationForm) {
  return {
    occurredOn: new Date(form.occurredOn).toISOString(),
    title: form.title,
    description: form.description,
    content: form.content,
    cover: form.cover,
    documents: form.documents
  }
}

export function buildPublicationCommand(
  kind: PublicationSchema.Kind,
  form: PublicationForm
): PublicationCommand {
  const fields = publicationWriteFields(form)
  if (form.selectedPublication) {
    return {
      type: 'addTranslation',
      publicationId: form.selectedPublication.id,
      expectedVersion: form.selectedPublication.publicationVersion,
      input: {
        locale: form.locale,
        ...fields
      }
    }
  }
  return { type: 'create', input: { kind, locale: form.locale, ...fields } }
}

export function buildPublicationUpdate(
  form: PublicationForm
): PublicationSchema.UpdateTranslationInput {
  return publicationWriteFields(form)
}

const publicationSections = {
  event: 'events',
  book: 'library',
  holocaust_document: 'holocaust-documents',
  legal_document: 'legal-documents',
  victim_testimony: 'victim-testimonies',
  media_article: 'media-articles',
  partner: 'partners',
  development_concept: 'development-concept'
} satisfies Record<PublicationSchema.Kind, string>

export function publicationEditHref(
  kind: PublicationSchema.Kind,
  id: number,
  locale: PublicationSchema.Locale
) {
  return `/content/${publicationSections[kind]}/${id}/${locale}`
}
