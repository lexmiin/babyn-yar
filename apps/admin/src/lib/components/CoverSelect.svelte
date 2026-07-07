<script lang="ts">
  import Image from 'phosphor-svelte/lib/Image'
  import Plus from 'phosphor-svelte/lib/Plus'
  import AssetDialog from './AssetDialog.svelte'
  import { AssetSchema } from '@babyn-yar/schema'

  type Props = {
    id?: string
    cover?: string
    invalid?: boolean
    onSelect: (url: string) => void
  }

  let {
    id = 'select-cover',
    cover,
    invalid = false,
    onSelect
  }: Props = $props()

  let isDialogOpen = $state(false)

  function handleCoverSelect(asset: AssetSchema.Asset) {
    onSelect(asset.url)
    isDialogOpen = false
  }
</script>

<span
  class="relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none has-data-invalid:before:shadow-red-500/10 sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500"
  data-slot="control"
>
  <button
    {id}
    type="button"
    class="relative flex w-full items-center gap-5 rounded-lg border border-zinc-950/10 bg-transparent p-3.5 text-base/6 text-zinc-950 hover:border-zinc-950/20 focus:outline-hidden data-disabled:border-zinc-950/20 data-invalid:border-red-500 data-invalid:hover:border-red-500 sm:px-3 sm:text-sm/6"
    onclick={() => (isDialogOpen = true)}
    data-invalid={invalid || undefined}
  >
    <div
      class="flex h-20 w-[120px] items-center justify-center overflow-hidden rounded-xs bg-gray-100"
    >
      {#if cover}
        <img
          src={cover}
          alt="Event cover"
          class="h-full max-w-full object-contain"
        />
      {:else}
        <Image class="size-6" />
      {/if}
    </div>
    <div class="flex items-center gap-1">
      {#if cover}
        <span class="text-sm"> Змінити </span>
      {:else}
        <Plus class="size-4" />
        <p class="text-sm">Додати обкладинку</p>
      {/if}
    </div>
  </button>
</span>

<AssetDialog
  bind:open={isDialogOpen}
  contentType="image"
  onSelect={handleCoverSelect}
/>
