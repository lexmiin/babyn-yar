import {
  createMutation,
  createQuery,
  useQueryClient
} from '@tanstack/svelte-query'
import type { GallerySchema } from '@babyn-yar/schema'
import { GalleryAPI } from '@babyn-yar/api-utils'

const galleryKeys = {
  all: ['gallery'] as const
}

export function useGalleryImages() {
  return createQuery(() => ({
    queryKey: galleryKeys.all,
    queryFn: () => GalleryAPI.list()
  }))
}

export function useCreateGalleryImage() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (image: GallerySchema.Form) => GalleryAPI.add(image),
    onSettled: () => {
      client.invalidateQueries({ queryKey: galleryKeys.all })
    }
  }))
}

export function useDeleteGalleryImage() {
  const client = useQueryClient()

  return createMutation(() => ({
    mutationFn: (id: number) => GalleryAPI.remove(id),
    onMutate: async id => {
      await client.cancelQueries({ queryKey: galleryKeys.all })
      const prevGallery = client.getQueryData<GallerySchema.ListResponse>(
        galleryKeys.all
      )

      if (!prevGallery) return prevGallery

      client.setQueryData<GallerySchema.ListResponse>(galleryKeys.all, old => {
        if (!old) return old
        return {
          images: old.images.filter(image => image.id !== id)
        }
      })

      return { prevGallery }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: galleryKeys.all })
    },
    onError: (error, _id, context) => {
      console.error(error)
      if (context?.prevGallery) {
        client.setQueryData(galleryKeys.all, context.prevGallery)
      }
    }
  }))
}
