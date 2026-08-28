import * as v from 'valibot'
import { Metadata } from './metadata'

export namespace VictimSchema {
  export const Victim = v.object({
    id: v.number(),
    fullname: v.string(),
    info: v.string(),
    version: v.number()
  })

  export const ListResponse = v.object({
    victims: v.array(Victim),
    metadata: v.partial(Metadata)
  })

  export const Filters = v.object({
    fullname: v.nullish(v.string()),
    info: v.nullish(v.string()),
    page: v.optional(v.number())
  })

  export type Victim = v.InferInput<typeof Victim>
  export type ListResponse = v.InferInput<typeof ListResponse>
  export type Filters = v.InferInput<typeof Filters>
}
