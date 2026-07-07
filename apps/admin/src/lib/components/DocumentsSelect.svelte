<script lang="ts">
  import X from 'phosphor-svelte/lib/X'
  import Plus from 'phosphor-svelte/lib/Plus'
  import AssetDialog from './AssetDialog.svelte'
  import { AssetSchema } from '@babyn-yar/schema'

  type Props = {
    id?: string
    documents: string[]
    invalid?: boolean
    disabled?: boolean
    onSelect: (url: string) => void
    onRemove: (url: string) => void
  }

  let {
    id = 'select-docs',
    documents,
    invalid = false,
    disabled = false,
    onSelect,
    onRemove
  }: Props = $props()

  let isDialogOpen = $state(false)

  function handleOpenDialog() {
    isDialogOpen = true
  }

  function handleSelect(asset: AssetSchema.Asset) {
    const isSelected = documents.find(d => d === asset.url)
    if (isSelected) return
    onSelect(asset.url)
    isDialogOpen = false
  }

  function handleRemove(url: string) {
    onRemove(url)
  }
</script>

<span
  class="relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none has-data-invalid:before:shadow-red-500/10 sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500"
  data-slot="control"
  data-invalid={invalid || undefined}
  data-disabled={disabled || undefined}
>
  <div
    class="relative flex w-full flex-wrap items-center gap-2 rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2.5 text-base/6 text-zinc-950 hover:border-zinc-950/20 focus:outline-hidden data-disabled:border-zinc-950/20 data-invalid:border-red-500 data-invalid:hover:border-red-500 sm:px-2 sm:py-1.5 sm:text-sm/6"
  >
    {#each documents as doc (doc)}
      <div
        class="flex items-center gap-1 rounded bg-orange-100 px-2 py-1 text-orange-900"
      >
        <span>{doc.split('/').at(-1)}</span>
        <button
          type="button"
          onclick={() => handleRemove(doc)}
          aria-label="Видалити долучення"
          {disabled}
        >
          <X class="size-4" />
        </button>
      </div>
    {/each}
    <button
      {id}
      {disabled}
      type="button"
      class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-700 hover:bg-zinc-950/5 focus:outline-hidden"
      onclick={handleOpenDialog}
    >
      <Plus class="size-4" />
      <span>Додати</span>
    </button>
  </div>
</span>

<AssetDialog bind:open={isDialogOpen} onSelect={handleSelect} />
