import { queryClient } from '$query/client'
import {
  createMutation,
  keepPreviousData,
  createQuery,
  useQueryClient
} from '@tanstack/svelte-query'
import { userToasts } from './toast'
import { authKeys } from '$lib/auth/query'
import { useUserFilters } from '$lib/use-user-filters'
import type { UserSchema } from '@babyn-yar/schema'
import { UserAPI } from '@babyn-yar/api-utils'

export const userKeys = {
  all: ['users'] as const,
  table: (filters: UserSchema.Filters) => [...userKeys.all, filters]
}

export function useUsers() {
  const filters = useUserFilters()

  return createQuery(() => ({
    queryKey: userKeys.table(filters.current),
    queryFn: () => UserAPI.list(filters.current),
    placeholderData: keepPreviousData
  }))
}

export function useDeleteUsers() {
  const filters = useUserFilters()
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: async (userIds: number[]) => UserAPI.remove(userIds),
    onMutate: async userIds => {
      await client.cancelQueries({ queryKey: userKeys.all })
      const prevUsers = client.getQueryData<UserSchema.ListResponse>(
        userKeys.table(filters.current)
      )

      if (!prevUsers) return

      client.setQueryData<UserSchema.ListResponse>(
        userKeys.table(filters.current),
        old => {
          if (!old) return old
          return {
            ...old,
            users: old.users.filter(user => !userIds.includes(user.id))
          }
        }
      )

      return { prevUsers }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: userKeys.all })
    },
    onSuccess: () => {
      userToasts.deleteUsersSuccess()
    },
    onError: (error, _userIds, context) => {
      console.error(error)
      userToasts.deleteUsersError()
      if (context?.prevUsers) {
        client.setQueryData(userKeys.all, context.prevUsers)
      }
    }
  }))
}

export function useUpdateSettings() {
  return createMutation(() => ({
    mutationFn: (settings: UserSchema.Settings) =>
      UserAPI.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    }
  }))
}
