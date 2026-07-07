import { UserSchema } from '@babyn-yar/schema'
import { toSearchParams } from '../params'
import { fetcher } from '../fetcher'
import { API_URL } from '../context'
import * as v from 'valibot'

export namespace UserAPI {
  const BASE_URL = API_URL + '/users'

  export async function list(filters: UserSchema.Filters) {
    const url = new URL(BASE_URL)
    url.search = toSearchParams(filters).toString()
    const response = await fetcher(url)
    return v.parse(UserSchema.ListResponse, response)
  }

  export async function remove(ids: number[]) {
    const url = new URL(BASE_URL)
    url.search = toSearchParams({ ids: ids.join(',') }).toString()
    return fetcher(url, { method: 'DELETE' })
  }

  export async function me() {
    const response = await fetcher(BASE_URL + '/me')
    return v.parse(UserSchema.DetailResponse, response)
  }

  export async function register(newUser: UserSchema.Register) {
    const response = await fetcher(BASE_URL + '/register', {
      body: JSON.stringify(newUser),
      method: 'POST'
    })
    return v.parse(UserSchema.DetailResponse, response)
  }

  export async function login(credentials: UserSchema.Login) {
    const response = await fetcher(BASE_URL + '/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    return v.parse(UserSchema.DetailResponse, response)
  }

  export async function updateSettings(settings: UserSchema.Settings) {
    const body = { ...settings }

    for (const [key, value] of Object.entries(settings)) {
      if (!value) {
        delete body[key as keyof UserSchema.Settings]
      }
    }

    const response = await fetcher(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })

    return v.parse(UserSchema.DetailResponse, response)
  }
}
