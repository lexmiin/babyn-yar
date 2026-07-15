import type { Getter } from '$lib/runes'
import { usePublicationFilters } from '$lib/use-publication-filters'
import { PublicationAPI } from '@babyn-yar/api-utils'
import { PublicationSchema, type Metadata } from '@babyn-yar/schema'
import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient
} from '@tanstack/svelte-query'
import { buildPublicationCommand, buildPublicationUpdate } from './workflow'
import type { PublicationForm } from './schema'

type QueryOptions = {
  staleTime?: number
  enabled?: boolean
}

type EligiblePublicationOptions = QueryOptions & {
  title: string
  locale: PublicationSchema.Locale
}

const publicationKeys = {
  all: () => ['publications'] as const,
  kind: (kind: PublicationSchema.Kind) => [...publicationKeys.all(), kind],
  list: (kind: PublicationSchema.Kind, filters: PublicationSchema.Filters) => [
    ...publicationKeys.kind(kind),
    filters
  ],
  detail: (
    kind: PublicationSchema.Kind,
    id: string,
    locale: PublicationSchema.Locale
  ) => [...publicationKeys.kind(kind), id, locale]
}

export function usePublications(
  kind: Getter<PublicationSchema.Kind>,
  opts: Getter<PublicationSchema.Filters & QueryOptions>
) {
  const filters = usePublicationFilters()

  return createQuery<{
    publications: PublicationSchema.Summary[]
    metadata: Metadata
  }>(() => {
    const publicationFilters: PublicationSchema.Filters = {
      kind: kind(),
      title: opts().title ?? filters.current.title,
      page_size: opts().page_size ?? filters.current.page_size,
      page: opts().page ?? filters.current.page,
      sort: opts().sort ?? filters.current.sort
    }
    return {
      queryKey: publicationKeys.list(kind(), publicationFilters),
      queryFn: () => PublicationAPI.list(publicationFilters),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    }
  })
}

export function useEligiblePublications(
  kind: Getter<PublicationSchema.Kind>,
  opts: Getter<EligiblePublicationOptions>
) {
  return createQuery<PublicationSchema.ListResponse>(() => {
    const filters: PublicationSchema.Filters = {
      kind: kind(),
      missing_locale: opts().locale,
      title: opts().title,
      page_size: 20
    }
    return {
      queryKey: publicationKeys.list(kind(), filters),
      queryFn: () => PublicationAPI.list(filters),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    }
  })
}

export function usePublication(
  kind: Getter<PublicationSchema.Kind>,
  opts: Getter<{ id: string; locale: PublicationSchema.Locale }>
) {
  return createQuery<PublicationSchema.DetailResponse>(() => ({
    queryKey: publicationKeys.detail(kind(), opts().id, opts().locale),
    queryFn: () =>
      PublicationAPI.detail({
        id: opts().id,
        kind: kind(),
        locale: opts().locale
      })
  }))
}

export function useCreatePublication(kind: Getter<PublicationSchema.Kind>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (form: PublicationForm) => {
      const command = buildPublicationCommand(kind(), form)
      if (command.type === 'addTranslation') {
        return PublicationAPI.addTranslation({
          id: command.publicationId,
          expectedVersion: command.expectedVersion,
          input: command.input
        })
      }
      return PublicationAPI.create(command.input)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: publicationKeys.kind(kind()) })
    }
  }))
}

export function useUpdatePublication(
  kind: Getter<PublicationSchema.Kind>,
  opts: Getter<{
    id: string
    locale: PublicationSchema.Locale
    publicationVersion: number
  }>
) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (form: PublicationForm) =>
      PublicationAPI.updateTranslation({
        id: opts().id,
        locale: opts().locale,
        expectedVersion: opts().publicationVersion,
        input: buildPublicationUpdate(form)
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: publicationKeys.kind(kind()) })
    }
  }))
}

export function useDeletePublication(kind: Getter<PublicationSchema.Kind>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: ({
      id,
      locale
    }: {
      id: number
      locale: PublicationSchema.Locale
    }) => PublicationAPI.removeTranslation({ id, locale }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: publicationKeys.kind(kind()) })
    }
  }))
}
