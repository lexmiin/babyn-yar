import { GallerySchema } from '@babyn-yar/schema'
import { API_URL } from '../context'
import { fetcher } from '../fetcher'
import * as v from 'valibot'

export namespace GalleryAPI {
  const BASE_URL = API_URL + '/gallery'

  export async function list() {
    const response = await fetcher(BASE_URL)
    return v.parse(GallerySchema.ListResponse, response)
  }

  export async function add(image: GallerySchema.Form) {
    const response = await fetcher(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(image)
    })
    return v.parse(GallerySchema.DetailRespone, response)
  }

  export async function remove(id: number) {
    return fetcher(`${BASE_URL}/${id}`, { method: 'DELETE' })
  }
}
