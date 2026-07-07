import { VictimSchema } from '@babyn-yar/schema'
import { API_URL } from '../context'
import { toSearchParams } from '../params'
import { fetcher } from '../fetcher'
import * as v from 'valibot'

export namespace VictimAPI {
  const BASE_URL = API_URL + '/victims'

  export async function list(filters: VictimSchema.Filters = {}) {
    const params = toSearchParams(filters)
    const url = new URL(BASE_URL)
    url.search = params.toString()
    const response = await fetcher(url)
    return v.parse(VictimSchema.ListResponse, response)
  }
}
