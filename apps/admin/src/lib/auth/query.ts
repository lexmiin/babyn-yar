import {
  createMutation,
  createQuery,
  useQueryClient
} from '@tanstack/svelte-query'
import { userKeys } from '$lib/users/query'
import type { UserSchema } from '@babyn-yar/schema'
import { authToasts } from './toast'
import { ResponseError, UserAPI } from '@babyn-yar/api-utils'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const
}

export function useRegister() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (newUser: UserSchema.Register) => UserAPI.register(newUser),
    onSettled: () => {
      client.invalidateQueries({ queryKey: userKeys.all })
    },
    onSuccess: () => {
      authToasts.registerSuccess()
    }
  }))
}

export function useLogin() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (credentials: UserSchema.Login) => UserAPI.login(credentials),
    onSuccess: loggedUser => {
      client.setQueryData(authKeys.me(), loggedUser.user)
    }
  }))
}

export function useLoggedUser() {
  return createQuery(() => ({
    queryKey: authKeys.me(),
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    queryFn: () => UserAPI.me(),
    retry: (failureCount, error) => {
      if (error instanceof ResponseError && error.isUnauthorized()) {
        return false
      }
      return failureCount < 3
    }
  }))
}
