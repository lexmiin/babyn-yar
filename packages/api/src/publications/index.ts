import { PublicationSchema } from '@babyn-yar/schema'
import { API_URL } from '../context'
import { fetcher } from '../fetcher'
import { toSearchParams } from '../params'
import * as v from 'valibot'

export namespace PublicationAPI {
  export function list(
    filters: PublicationSchema.Filters
  ): Promise<PublicationSchema.ListResponse> {
    const params = toSearchParams(filters)
    return fetcher(`${API_URL}/publications?${params}`)
  }

  export function detail({
    id,
    kind,
    locale
  }: {
    id: string
    kind: PublicationSchema.Kind
    locale: PublicationSchema.Locale
  }): Promise<PublicationSchema.DetailResponse> {
    const params = toSearchParams({ kind, locale })
    return fetcher(`${API_URL}/publications/${id}?${params}`)
  }

  export function create(
    input: PublicationSchema.CreateInput
  ): Promise<PublicationSchema.DetailResponse> {
    const body = v.parse(PublicationSchema.CreateInput, input)
    return fetcher(`${API_URL}/publications`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  export function addTranslation({
    id,
    expectedVersion,
    input
  }: {
    id: number
    expectedVersion: number
    input: PublicationSchema.AddTranslationInput
  }): Promise<PublicationSchema.DetailResponse> {
    const body = v.parse(PublicationSchema.AddTranslationInput, input)
    return fetcher(`${API_URL}/publications/${id}/translations`, {
      method: 'POST',
      headers: { 'X-Expected-Version': String(expectedVersion) },
      body: JSON.stringify(body)
    })
  }

  export function updateTranslation({
    id,
    locale,
    expectedVersion,
    input
  }: {
    id: string
    locale: PublicationSchema.Locale
    expectedVersion: number
    input: PublicationSchema.UpdateTranslationInput
  }): Promise<PublicationSchema.DetailResponse> {
    const body = v.parse(PublicationSchema.UpdateTranslationInput, input)
    return fetcher(`${API_URL}/publications/${id}/translations/${locale}`, {
      method: 'PATCH',
      headers: { 'X-Expected-Version': String(expectedVersion) },
      body: JSON.stringify(body)
    })
  }

  export function removeTranslation({
    id,
    locale
  }: {
    id: number
    locale: PublicationSchema.Locale
  }): Promise<{ message: string }> {
    return fetcher(`${API_URL}/publications/${id}/translations/${locale}`, {
      method: 'DELETE'
    })
  }
}
