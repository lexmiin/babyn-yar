import { PublicationSchema } from '@babyn-yar/schema'
import * as v from 'valibot'

export const EligiblePublication = v.pick(PublicationSchema.Summary, [
  'id',
  'title',
  'occurredOn',
  'publicationVersion'
])

export const PublicationForm = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  occurredOn: v.string(),
  description: v.pipe(v.string(), v.nonEmpty()),
  locale: PublicationSchema.Locale,
  cover: v.pipe(v.string(), v.url()),
  documents: v.array(v.pipe(v.string(), v.url())),
  content: v.any(),
  selectedPublication: v.optional(EligiblePublication)
})

export type EligiblePublication = v.InferInput<typeof EligiblePublication>
export type PublicationForm = v.InferInput<typeof PublicationForm>
