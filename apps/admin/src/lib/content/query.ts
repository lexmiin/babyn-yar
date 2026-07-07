import type { Getter } from '$lib/runes'
import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient
} from '@tanstack/svelte-query'
import { ContentAPI } from '@babyn-yar/api-utils'
import { ContentSchema, type Metadata } from '@babyn-yar/schema'
import { useContentFilters } from '$lib/use-content-filters'

type WithTranslation<K extends string> = {
  translation?: ContentSchema.Translation
} & {
  [key in K]: ContentSchema.Content
}

type QueryOptions = {
  staleTime?: number
  enabled?: boolean
}

const eventKeys = {
  all: ['events'] as const,
  list: (filters: ContentSchema.Filters) => [...eventKeys.all, filters],
  single: (id: string) => [...eventKeys.all, id]
}

const booksKeys = {
  all: ['books'] as const,
  list: (filters: ContentSchema.Filters) => [...booksKeys.all, filters],
  single: (id: string) => [...booksKeys.all, id]
}

const mediaArticlesKeys = {
  all: ['media-articles'] as const,
  list: (filters: ContentSchema.Filters) => [...mediaArticlesKeys.all, filters],
  single: (id: string) => [...mediaArticlesKeys.all, id]
}

const holocaustDocumentsKeys = {
  all: ['holocaust-documents'] as const,
  list: (filters: ContentSchema.Filters) => [
    ...holocaustDocumentsKeys.all,
    filters
  ],
  single: (id: string) => [...holocaustDocumentsKeys.all, id]
}

const partnersKeys = {
  all: ['partners'] as const,
  list: (filters: ContentSchema.Filters) => [...partnersKeys.all, filters],
  single: (id: string) => [...partnersKeys.all, id]
}

const testimoniesKeys = {
  all: ['victim-testimonies'] as const,
  list: (filters: ContentSchema.Filters) => [...testimoniesKeys.all, filters],
  single: (id: string) => [...testimoniesKeys.all, id]
}

const legalDocumentsKeys = {
  all: ['legal-documents'] as const,
  list: (filters: ContentSchema.Filters) => [
    ...legalDocumentsKeys.all,
    filters
  ],
  single: (id: string) => [...legalDocumentsKeys.all, id]
}

const developmentConceptsKeys = {
  all: ['development-concepts'] as const,
  list: (filters: ContentSchema.Filters) => [
    ...developmentConceptsKeys.all,
    filters
  ],
  single: (id: string) => [...developmentConceptsKeys.all, id]
}

export function useEvent(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'event'>>(() => ({
    queryKey: eventKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'event'>>({
        slug: 'events',
        id: opts().id
      })
      response.event.content = JSON.parse(
        response.event.content as unknown as string
      )
      return response
    }
  }))
}

export function useEvents(opts: Getter<ContentSchema.Filters & QueryOptions>) {
  const filters = useContentFilters()

  return createQuery<{ events: ContentSchema.Content[]; metadata: Metadata }>(
    () => ({
      queryKey: eventKeys.list({
        ...filters.current,
        title: opts().title,
        page_size: opts().page_size,
        page: opts().page,
        sort: opts().sort,
        lang: opts().lang
      }),
      queryFn: () =>
        ContentAPI.list({
          slug: 'events',
          filters: {
            title: opts().title ?? filters.current.title,
            page_size: opts().page_size ?? 20,
            page: opts().page ?? filters.current.page,
            sort: opts().sort ?? filters.current.sort,
            lang: opts().lang
          }
        }),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    })
  )
}

export function useUpdateEvent(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.Form) =>
      ContentAPI.update({ slug: 'events', id: opts().id, content: data }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: eventKeys.all })
    }
  }))
}

export function useDeleteEvents() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'events', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: eventKeys.all })
    }
  }))
}

export function useCreateEvent() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.Form) =>
      ContentAPI.create({ slug: 'events', content: data }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: eventKeys.all })
    }
  }))
}

export function useBook(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'book'>>(() => ({
    queryKey: booksKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'book'>>({
        slug: 'books',
        id: opts().id
      })
      response.book.content = JSON.parse(
        response.book.content as unknown as string
      )
      return response
    }
  }))
}

export function useBooks(opts: Getter<ContentSchema.Filters & QueryOptions>) {
  const filters = useContentFilters()

  return createQuery<{ books: ContentSchema.Content[]; metadata: Metadata }>(
    () => ({
      queryKey: booksKeys.list({
        ...filters.current,
        title: opts().title,
        page_size: opts().page_size,
        page: opts().page,
        sort: opts().sort,
        lang: opts().lang
      }),
      queryFn: () =>
        ContentAPI.list({
          slug: 'books',
          filters: {
            title: opts().title ?? filters.current.title,
            page_size: opts().page_size ?? 20,
            page: opts().page ?? filters.current.page,
            sort: opts().sort ?? filters.current.sort,
            lang: opts().lang ?? filters.current.lang
          }
        }),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    })
  )
}

export function useDeleteBooks() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'books', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: booksKeys.all })
    }
  }))
}

export function useCreateBook() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.Form) =>
      ContentAPI.create({ slug: 'books', content: data }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: booksKeys.all })
    }
  }))
}

export function useUpdateBook(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (data: ContentSchema.Form) =>
      ContentAPI.update({ slug: 'books', id: opts().id, content: data }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: booksKeys.all })
    }
  }))
}

export function useMediaArticle(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'article'>>(() => ({
    queryKey: mediaArticlesKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'article'>>({
        slug: 'media-articles',
        id: opts().id
      })
      response.article.content = JSON.parse(
        response.article.content as unknown as string
      )
      return response
    }
  }))
}

export function useMediaArticles(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{ articles: ContentSchema.Content[]; metadata: Metadata }>(
    () => ({
      queryKey: mediaArticlesKeys.list({
        ...filters.current,
        title: opts().title,
        page_size: opts().page_size,
        page: opts().page,
        sort: opts().sort,
        lang: opts().lang
      }),
      queryFn: () =>
        ContentAPI.list({
          slug: 'media-articles',
          filters: {
            title: opts().title ?? filters.current.title,
            page_size: opts().page_size ?? 20,
            page: opts().page ?? filters.current.page,
            sort: opts().sort ?? filters.current.sort,
            lang: opts().lang ?? filters.current.lang
          }
        }),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    })
  )
}

export function useDeleteMediaArticles() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'media-articles', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: mediaArticlesKeys.all })
    }
  }))
}

export function useUpdateMediaArticle(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (data: ContentSchema.FormSimple) =>
      ContentAPI.update({
        slug: 'media-articles',
        id: opts().id,
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: mediaArticlesKeys.all })
    }
  }))
}

export function useHolocaustDocument(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'document'>>(() => ({
    queryKey: holocaustDocumentsKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'document'>>({
        slug: 'holocaust-documents',
        id: opts().id
      })
      response.document.content = JSON.parse(
        response.document.content as unknown as string
      )
      return response
    }
  }))
}

export function useHolocaustDocuments(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{
    documents: ContentSchema.Content[]
    metadata: Metadata
  }>(() => ({
    queryKey: holocaustDocumentsKeys.list({
      ...filters.current,
      title: opts().title,
      page_size: opts().page_size,
      page: opts().page,
      sort: opts().sort,
      lang: opts().lang
    }),
    queryFn: () =>
      ContentAPI.list({
        slug: 'holocaust-documents',
        filters: {
          title: opts().title ?? filters.current.title,
          page_size: opts().page_size ?? 20,
          page: opts().page ?? filters.current.page,
          sort: opts().sort ?? filters.current.sort,
          lang: opts().lang ?? filters.current.lang
        }
      }),
    staleTime: opts().staleTime,
    placeholderData: keepPreviousData,
    enabled: opts().enabled
  }))
}

export function useUpdateHolocaustDocument(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.update({
        slug: 'holocaust-documents',
        id: opts().id,
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: holocaustDocumentsKeys.all })
    }
  }))
}

export function useCreateHolocaustDocument() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.create({
        slug: 'holocaust-documents',
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: holocaustDocumentsKeys.all })
    }
  }))
}

export function useDeleteHolocaustDocuments() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'holocaust-documents', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: holocaustDocumentsKeys.all })
    }
  }))
}

export function usePartner(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'partner'>>(() => ({
    queryKey: partnersKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'partner'>>({
        slug: 'partners',
        id: opts().id
      })
      response.partner.content = JSON.parse(
        response.partner.content as unknown as string
      )
      return response
    }
  }))
}

export function usePartners(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{ partners: ContentSchema.Content[]; metadata: Metadata }>(
    () => ({
      queryKey: partnersKeys.list({
        ...filters.current,
        title: opts().title,
        page_size: opts().page_size,
        page: opts().page,
        sort: opts().sort,
        lang: opts().lang
      }),
      queryFn: () =>
        ContentAPI.list({
          slug: 'partners',
          filters: {
            title: opts().title ?? filters.current.title,
            page_size: opts().page_size ?? 20,
            page: opts().page ?? filters.current.page,
            sort: opts().sort ?? filters.current.sort,
            lang: opts().lang ?? filters.current.lang
          }
        }),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    })
  )
}

export function useUpdatePartner(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.update({
        slug: 'partners',
        id: opts().id,
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: partnersKeys.all })
    }
  }))
}

export function useCreatePartner() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.create({
        slug: 'partners',
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: partnersKeys.all })
    }
  }))
}

export function useDeletePartners() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'partners', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: partnersKeys.all })
    }
  }))
}

export function useTestimony(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'testimony'>>(() => ({
    queryKey: testimoniesKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'testimony'>>({
        slug: 'victim-testimonies',
        id: opts().id
      })
      response.testimony.content = JSON.parse(
        response.testimony.content as unknown as string
      )
      return response
    }
  }))
}

export function useTestimonies(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{
    testimonies: ContentSchema.Content[]
    metadata: Metadata
  }>(() => ({
    queryKey: testimoniesKeys.list({
      ...filters.current,
      title: opts().title,
      page_size: opts().page_size,
      page: opts().page,
      sort: opts().sort,
      lang: opts().lang
    }),
    queryFn: () =>
      ContentAPI.list({
        slug: 'victim-testimonies',
        filters: {
          title: opts().title ?? filters.current.title,
          page_size: opts().page_size ?? 20,
          page: opts().page ?? filters.current.page,
          sort: opts().sort ?? filters.current.sort,
          lang: opts().lang ?? filters.current.lang
        }
      }),
    staleTime: opts().staleTime,
    placeholderData: keepPreviousData,
    enabled: opts().enabled
  }))
}

export function useUpdateTestimony(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.update({
        slug: 'victim-testimonies',
        id: opts().id,
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: testimoniesKeys.all })
    }
  }))
}

export function useCreateTestimony() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.create({
        slug: 'victim-testimonies',
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: testimoniesKeys.all })
    }
  }))
}

export function useCreateMediaArticle() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.create({
        slug: 'media-articles',
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: mediaArticlesKeys.all })
    }
  }))
}

export function useDeleteTestimonies() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'victim-testimonies', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: testimoniesKeys.all })
    }
  }))
}

export function useLegalDocument(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'document'>>(() => ({
    queryKey: legalDocumentsKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'document'>>({
        slug: 'legal-documents',
        id: opts().id
      })
      response.document.content = JSON.parse(
        response.document.content as unknown as string
      )
      return response
    }
  }))
}

export function useLegalDocuments(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{
    documents: ContentSchema.Content[]
    metadata: Metadata
  }>(() => ({
    queryKey: legalDocumentsKeys.list({
      ...filters.current,
      title: opts().title,
      page_size: opts().page_size,
      page: opts().page,
      sort: opts().sort,
      lang: opts().lang
    }),
    queryFn: () =>
      ContentAPI.list({
        slug: 'legal-documents',
        filters: {
          title: opts().title ?? filters.current.title,
          page_size: opts().page_size ?? 20,
          page: opts().page ?? filters.current.page,
          sort: opts().sort ?? filters.current.sort,
          lang: opts().lang ?? filters.current.lang
        }
      }),
    staleTime: opts().staleTime,
    placeholderData: keepPreviousData,
    enabled: opts().enabled
  }))
}

export function useUpdateLegalDocument(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.Form) =>
      ContentAPI.update({
        slug: 'legal-documents',
        id: opts().id,
        content: data
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: legalDocumentsKeys.all })
    }
  }))
}

export function useCreateLegalDocument() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.Form) =>
      ContentAPI.create({ slug: 'legal-documents', content: data }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: legalDocumentsKeys.all })
    }
  }))
}

export function useDeleteLegalDocuments() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'legal-documents', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: legalDocumentsKeys.all })
    }
  }))
}

export function useDevelopmentConcept(opts: Getter<{ id: string }>) {
  return createQuery<WithTranslation<'concept'>>(() => ({
    queryKey: developmentConceptsKeys.single(opts().id),
    queryFn: async () => {
      const response = await ContentAPI.detail<WithTranslation<'concept'>>({
        slug: 'development-concepts',
        id: opts().id
      })
      response.concept.content = JSON.parse(
        response.concept.content as unknown as string
      )
      return response
    }
  }))
}

export function useDevelopmentConcepts(
  opts: Getter<ContentSchema.Filters & QueryOptions>
) {
  const filters = useContentFilters()

  return createQuery<{ concepts: ContentSchema.Content[]; metadata: Metadata }>(
    () => ({
      queryKey: developmentConceptsKeys.list({
        ...filters.current,
        title: opts().title,
        page_size: opts().page_size,
        page: opts().page,
        sort: opts().sort,
        lang: opts().lang
      }),
      queryFn: () =>
        ContentAPI.list({
          slug: 'development-concepts',
          filters: {
            title: opts().title ?? filters.current.title,
            page_size: opts().page_size ?? 20,
            page: opts().page ?? filters.current.page,
            sort: opts().sort ?? filters.current.sort,
            lang: opts().lang ?? filters.current.lang
          }
        }),
      staleTime: opts().staleTime,
      placeholderData: keepPreviousData,
      enabled: opts().enabled
    })
  )
}

export function useUpdateDevelopmentConcept(opts: Getter<{ id: string }>) {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.update({
        slug: 'development-concepts',
        id: opts().id,
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: developmentConceptsKeys.all })
    }
  }))
}

export function useCreateDevelopmentConcept() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (data: ContentSchema.FormSimple) =>
      ContentAPI.create({
        slug: 'development-concepts',
        content: data,
        schema: ContentSchema.FormSimple
      }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: developmentConceptsKeys.all })
    }
  }))
}

export function useDeleteDevelopmentConcepts() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (ids: number[]) =>
      ContentAPI.remove({ slug: 'development-concepts', ids }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: developmentConceptsKeys.all })
    }
  }))
}
