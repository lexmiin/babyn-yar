<script lang="ts">
  import Dialog from './Dialog.svelte'
  import DialogTitle from './DialogTitle.svelte'
  import DialogDescription from './DialogDescription.svelte'
  import AssetGrid from './AssetGrid.svelte'
  import AssetItem from './AssetItem.svelte'
  import AssetSkeleton from './Skeletons/AssetSkeleton.svelte'
  import DialogBody from './DialogBody.svelte'
  import Input from './Input.svelte'
  import InputGroup from './InputGroup.svelte'
  import Select from './Select.svelte'
  import SelectOption from './SelectOption.svelte'
  import ArrowUp from 'phosphor-svelte/lib/ArrowUp'
  import ArrowDown from 'phosphor-svelte/lib/ArrowDown'
  import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass'
  import { useIntersect } from '$lib/use-intersect.svelte'
  import { useAssets } from '$lib/assets/query'
  import { DEFAULT_SORT_OPTION, sortOptions } from '$lib/select-options'
  import { AssetSchema } from '@babyn-yar/schema'
  import { untrack } from 'svelte'
  import { useAssetFilters } from '$lib/use-asset-filters'

  type Props = {
    open?: boolean
    contentType?: string
    onSelect: (asset: AssetSchema.Asset) => void
  }

  let { open = $bindable(false), contentType, onSelect }: Props = $props()

  let filters = useAssetFilters()

  let rootRef: HTMLElement | null = $state(null)
  let bottomRef: HTMLElement | null = $state(null)

  $effect(() => {
    const nextContentType = open ? contentType : undefined

    untrack(() =>
      filters.set(prev =>
        prev.content_type === nextContentType
          ? prev
          : { ...prev, content_type: nextContentType }
      )
    )
  })

  const assets = useAssets(() => ({ enabled: open, staleTime: 1000 * 10 }))

  useIntersect(() => bottomRef, loadMore, {
    root: () => rootRef,
    rootMargin: '300px'
  })

  function loadMore() {
    if (assets.hasNextPage && !assets.isFetching) {
      assets.fetchNextPage()
    }
  }

  function handleSort(sort: AssetSchema.Filters['sort']) {
    filters.set(prev => ({ ...prev, sort }))
  }

  function handleSearch(e: Event) {
    const filename = (e.target as HTMLInputElement).value
    filters.set(prev => ({ ...prev, filename }))
  }

  function handleSelect(asset: AssetSchema.Asset) {
    onSelect(asset)
    open = false
  }
</script>

<Dialog bind:open class="sm:max-w-full">
  <DialogTitle>Медіа файли</DialogTitle>
  <DialogDescription>Оберіть потрібний файл</DialogDescription>
  <DialogBody>
    <div class="mb-4">
      <div class="flex max-w-2xl flex-col gap-5 sm:flex-1 sm:flex-row">
        <div class="flex-1">
          <InputGroup>
            <MagnifyingGlass weight="regular" />
            <Input
              placeholder="Пошук&hellip;"
              oninput={handleSearch}
              value={filters.current.filename}
            />
          </InputGroup>
        </div>
        <div class="sm:w-44">
          <Select
            items={Object.entries(sortOptions).map(([value, opts]) => ({
              value: value,
              ...opts
            }))}
            onSelect={handleSort}
            value={filters.current?.sort || DEFAULT_SORT_OPTION}
          >
            {#each Object.entries(sortOptions) as [key, value] (key)}
              <SelectOption value={key} label={value.label}>
                {#snippet icon()}
                  {#if value.order === 'asc'}
                    <ArrowUp weight="fill" />
                  {:else}
                    <ArrowDown weight="fill" />
                  {/if}
                {/snippet}
                {value.label}
              </SelectOption>
            {/each}
          </Select>
        </div>
      </div>
    </div>
    <div
      bind:this={rootRef}
      class="h-(--height) overflow-y-auto pr-3 pb-20 [--height:calc(100vh-300px)]"
    >
      {#if assets.isLoading}
        <AssetGrid>
          <AssetSkeleton count={50} />
        </AssetGrid>
      {:else if assets.isError}
        <div class="mt-6 text-center font-medium text-red-700">
          <p class="pb-4">Сталася помилка при завантажені</p>
          <p class="font-mono text-sm">{assets.error.message}</p>
        </div>
      {:else if assets.isSuccess && assets.data.pages[0].assets.length === 0}
        <div
          class="col-span-full flex h-full w-full flex-col items-center justify-center"
        >
          <p class="text-center text-lg font-medium text-gray-500">
            Вибачте, ми не змогли знайти жодного файлу за вашими критеріями
          </p>
        </div>
      {:else if assets.isSuccess}
        <AssetGrid>
          {#each assets.data.pages as page}
            {#each page.assets as asset (asset.id)}
              <li>
                <button
                  class="group relative w-full"
                  onclick={() => handleSelect(asset)}
                >
                  <AssetItem
                    src={asset.url}
                    fileName={asset.fileName}
                    contentType={asset.contentType}
                  />
                </button>
              </li>
            {/each}
          {/each}
        </AssetGrid>
        <div bind:this={bottomRef}></div>
      {/if}
    </div>
  </DialogBody>
</Dialog>
