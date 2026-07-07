import {
  createInfiniteQuery,
  createMutation,
  keepPreviousData,
  useQueryClient
} from '@tanstack/svelte-query'
import { assetToasts } from './toast'
import type { Getter } from '$lib/runes'
import { AssetSchema } from '@babyn-yar/schema'
import { useAssetFilters } from '$lib/use-asset-filters'
import { AssetAPI } from '@babyn-yar/api-utils'

type QueryOptions = {
  staleTime?: number
  enabled?: boolean
}

export const assetKeys = {
  all: ['assets'] as const,
  list: (filters: AssetSchema.Filters) => [...assetKeys.all, filters]
}

export function useAssets(opts: Getter<QueryOptions> = () => ({})) {
  const filters = useAssetFilters()

  return createInfiniteQuery(() => ({
    initialPageParam: 1,
    queryKey: assetKeys.list(filters.current),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10,
    enabled: opts().enabled,
    queryFn: async ({ pageParam = 1 }) =>
      AssetAPI.list(pageParam, filters.current),
    getNextPageParam: prevPage => {
      const { currentPage, lastPage } = prevPage.metadata
      return currentPage < lastPage ? currentPage + 1 : undefined
    }
  }))
}

export function useUploadAssets() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (assets: AssetSchema.Form) => AssetAPI.upload(assets),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: assetKeys.all })
    }
  }))
}

export function useDeleteAssets() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (ids: number[]) => AssetAPI.remove(ids),
    onSettled: () => {
      client.invalidateQueries({ queryKey: assetKeys.all })
    },
    onSuccess: () => {
      assetToasts.deleteSuccess()
    },
    onError: () => {
      assetToasts.deleteError()
    }
  }))
}
