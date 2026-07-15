import { useQueryState, parseAsJson } from 'nuqs-svelte'
import * as v from 'valibot'
import { PublicationSchema } from '@babyn-yar/schema'
import { DEFAULT_PUBLICATION_SORT_OPTION } from './select-options'

export function usePublicationFilters(
  defaults: PublicationSchema.Filters = {}
) {
  return useQueryState(
    'cf',
    parseAsJson(value => v.parse(PublicationSchema.Filters, value)).withDefault(
      {
        title: '',
        page: 1,
        sort: DEFAULT_PUBLICATION_SORT_OPTION,
        page_size: 50,
        ...defaults
      }
    )
  )
}
