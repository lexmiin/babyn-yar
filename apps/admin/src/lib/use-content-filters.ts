import { useQueryState, parseAsJson } from 'nuqs-svelte'
import * as v from 'valibot'
import { ContentSchema } from '@babyn-yar/schema'
import { DEFAULT_CONTENT_SORT_OPTION } from './select-options'

export function useContentFilters(defaults: ContentSchema.Filters = {}) {
  return useQueryState(
    'cf',
    parseAsJson(value => v.parse(ContentSchema.Filters, value)).withDefault({
      title: '',
      page: 1,
      sort: DEFAULT_CONTENT_SORT_OPTION,
      page_size: 50,
      ...defaults
    })
  )
}
