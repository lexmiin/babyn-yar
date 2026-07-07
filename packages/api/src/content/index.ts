import { fetcher } from '../fetcher'
import { ContentSchema } from '@babyn-yar/schema'
import { toSearchParams } from '../params'
import * as v from 'valibot'
import { API_URL } from '../context'

export namespace ContentAPI {
  export async function create<T>({
    slug,
    content,
    schema = ContentSchema.Form
  }: {
    slug: string
    content: T
    schema?: v.GenericSchema
  }) {
    const body = v.parse(schema, content)
    return fetcher(`${API_URL}/${slug}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body)
    })
  }

  export async function update<T>({
    slug,
    id,
    content,
    schema = ContentSchema.Form
  }: {
    slug: string
    id: string
    content: T
    schema?: v.GenericSchema
  }) {
    const body = v.parse(schema, content)
    return fetcher(`${API_URL}/${slug}/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(body)
    })
  }

  export async function detail<T>({
    slug,
    id
  }: {
    slug: string
    id: string
  }): Promise<T> {
    return fetcher(`${API_URL}/${slug}/${id}`)
  }

  export async function list<T>({
    slug,
    filters = {}
  }: {
    slug: string
    filters: ContentSchema.Filters
  }): Promise<T> {
    const params = toSearchParams(filters)
    return fetcher(`${API_URL}/${slug}?${params}`)
  }

  export async function remove({ slug, ids }: { slug: string; ids: number[] }) {
    const params = toSearchParams({ ids: ids.join(',') })
    return fetcher(`${API_URL}/${slug}?${params.toString()}`, {
      method: 'DELETE'
    })
  }
}
