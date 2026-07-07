<script lang="ts">
  import Plus from 'phosphor-svelte/lib/Plus'
  import Trash from 'phosphor-svelte/lib/Trash'
  import {
    useGalleryImages,
    useDeleteGalleryImage,
    useCreateGalleryImage
  } from '$lib/gallery/query'
  import AssetDialog from '$components/AssetDialog.svelte'
  import PageHeader from '$components/PageHeader.svelte'
  import Container from '$components/Container.svelte'
  import { AssetSchema, GallerySchema } from '@babyn-yar/schema'

  const images = useGalleryImages()
  const deleteImage = useDeleteGalleryImage()
  const createImage = useCreateGalleryImage()

  let isDialogOpen = $state(false)

  function handleAddImage(asset: AssetSchema.Asset) {
    const existingImage = images.data?.images.find(i => i.id === asset.id)
    if (images.data && !existingImage) {
      createImage.mutate({ url: asset.url, id: asset.id })
    }
  }

  function handleOpenDialog() {
    isDialogOpen = true
  }

  function removeImage(image: GallerySchema.Image) {
    deleteImage.mutate(image.id)
  }
</script>

<PageHeader title="Галерея" />
<Container title="Галерея">
  {#if images.isSuccess}
    <div
      class="grid auto-rows-[148px] grid-cols-[repeat(auto-fill,minmax(166px,1fr))] gap-2 rounded-md border bg-white p-2 shadow-sm"
    >
      {#each images.data.images as image}
        <div class="group relative overflow-hidden rounded-md">
          <img
            src="https://public.babynyar.work/cdn-cgi/image/width=332,height=332,fit=cover,quality=85,format=auto/{image.url}"
            alt=""
            class="aspect-square h-auto w-full object-cover"
          />
          <div
            class="absolute inset-0 z-10 hidden bg-black/60 group-hover:block"
          >
            <div class="flex h-full w-full items-center justify-center">
              <button
                class="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-600 p-2 text-sm font-medium text-red-50 transition-colors hover:bg-red-700 hover:text-red-100"
                onclick={() => removeImage(image)}
              >
                <Trash class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      {/each}
      <button
        class="inline-flex items-center justify-center rounded-md border bg-gray-100 text-gray-400 focus-within:border-sky-400 focus-within:ring focus-within:ring-sky-100 hover:border-sky-400 hover:text-gray-600"
        onclick={handleOpenDialog}
      >
        <Plus />
      </button>
    </div>
  {/if}
</Container>

<AssetDialog
  bind:open={isDialogOpen}
  onSelect={handleAddImage}
  contentType="image"
/>
