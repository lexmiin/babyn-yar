import { AssetSchema } from '@babyn-yar/schema'
import { API_URL } from '../context'
import { fetcher } from '../fetcher'
import { toSearchParams } from '../params'
import * as v from 'valibot'

export namespace AssetAPI {
  const BASE_URL = API_URL + '/assets'

  export async function list(page: number, filters: AssetSchema.Filters) {
    const params = toSearchParams(filters)
    params.set('page', page.toString())
    params.set('page_size', '50')
    const url = new URL(BASE_URL)
    url.search = params.toString()
    const response = await fetcher(url)
    return v.parse(AssetSchema.ListResponse, response)
  }

  export async function remove(ids: number[]) {
    const params = toSearchParams({ ids: ids.join(',') })
    const url = new URL(BASE_URL)
    url.search = params.toString()
    return fetcher(url, { method: 'DELETE' })
  }

  export async function upload(form: AssetSchema.Form) {
    const formData = new FormData()

    form.files.forEach(({ file, fileName, extension }) => {
      const prefix = form.prefix ? form.prefix + '_' : ''
      const fullName = `${prefix}${fileName}.${extension}`
      formData.append('assets', file, fullName)
    })

    const response = await fetcher(BASE_URL, { method: 'POST', body: formData })
    return v.parse(AssetSchema.FormResponse, response)
  }
}
