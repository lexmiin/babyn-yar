import { parseAsJson, useQueryState } from 'nuqs-svelte'
import { UserSchema } from '@babyn-yar/schema'
import * as v from 'valibot'

export function useUserFilters(defaults: UserSchema.Filters = {}) {
  return useQueryState(
    'user_filters',
    parseAsJson(value => v.parse(UserSchema.Filters, value)).withDefault(
      defaults
    )
  )
}
