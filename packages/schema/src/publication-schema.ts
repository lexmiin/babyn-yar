import * as v from 'valibot'
import { Metadata } from './metadata'

export namespace PublicationSchema {
  export const Kind = v.picklist([
    'event',
    'book',
    'holocaust_document',
    'legal_document',
    'victim_testimony',
    'media_article',
    'partner',
    'development_concept'
  ])

  export const Locale = v.picklist(['uk', 'en'])

  export const Publisher = v.object({
    id: v.number(),
    fullName: v.string()
  })

  export const Summary = v.object({
    id: v.number(),
    kind: Kind,
    locale: Locale,
    occurredOn: v.string(),
    title: v.string(),
    description: v.string(),
    cover: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    publicationVersion: v.number(),
    publisher: Publisher
  })

  export const Detail = v.object({
    ...Summary.entries,
    content: v.any(),
    documents: v.array(v.string())
  })

  export const Filters = v.object({
    kind: v.optional(Kind),
    locale: v.optional(Locale),
    missing_locale: v.optional(Locale),
    title: v.optional(v.string()),
    page: v.optional(v.number()),
    page_size: v.optional(v.number()),
    sort: v.optional(
      v.picklist(['created_at', '-created_at', 'occurred_on', '-occurred_on'])
    )
  })

  export const ListResponse = v.object({
    publications: v.array(Summary),
    metadata: Metadata
  })

  export const DetailResponse = v.object({
    publication: Detail
  })

  const TranslationFields = {
    title: v.pipe(v.string(), v.nonEmpty()),
    description: v.pipe(v.string(), v.nonEmpty()),
    content: v.any(),
    cover: v.pipe(v.string(), v.url()),
    documents: v.array(v.pipe(v.string(), v.url()))
  }

  export const CreateInput = v.object({
    kind: Kind,
    locale: Locale,
    occurredOn: v.string(),
    ...TranslationFields
  })

  export const AddTranslationInput = v.object({
    locale: Locale,
    occurredOn: v.string(),
    ...TranslationFields
  })

  export const UpdateTranslationInput = v.object({
    occurredOn: v.string(),
    ...TranslationFields
  })

  export type Kind = v.InferOutput<typeof Kind>
  export type Locale = v.InferOutput<typeof Locale>
  export type Summary = v.InferOutput<typeof Summary>
  export type Detail = v.InferOutput<typeof Detail>
  export type Filters = v.InferInput<typeof Filters>
  export type ListResponse = v.InferOutput<typeof ListResponse>
  export type DetailResponse = v.InferOutput<typeof DetailResponse>
  export type CreateInput = v.InferInput<typeof CreateInput>
  export type AddTranslationInput = v.InferInput<typeof AddTranslationInput>
  export type UpdateTranslationInput = v.InferInput<
    typeof UpdateTranslationInput
  >
}
