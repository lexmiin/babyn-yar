import { useQueryState, parseAsJson } from 'nuqs-svelte'
import { AssetSchema } from '@babyn-yar/schema'
import * as v from 'valibot'
import { DEFAULT_SORT_OPTION } from './select-options'

export function useAssetFilters(defaults: AssetSchema.Filters = {}) {
  return useQueryState(
    'af',
    parseAsJson(value => v.parse(AssetSchema.Filters, value)).withDefault({
      sort: DEFAULT_SORT_OPTION,
      ...defaults
    })
  )
}
