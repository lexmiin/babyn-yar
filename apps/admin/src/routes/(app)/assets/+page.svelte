<script lang="ts">
  import Button from '$components/Button.svelte'
  import Input from '$components/Input.svelte'
  import InputGroup from '$components/InputGroup.svelte'
  import Select from '$components/Select.svelte'
  import SelectOption from '$components/SelectOption.svelte'
  import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass'
  import CloudArrowUp from 'phosphor-svelte/lib/CloudArrowUp'
  import ArrowUp from 'phosphor-svelte/lib/ArrowUp'
  import ArrowDown from 'phosphor-svelte/lib/ArrowDown'
  import Alert from '$components/Alert.svelte'
  import AlertTitle from '$components/AlertTitle.svelte'
  import AlertDescription from '$components/AlertDescription.svelte'
  import AlertActions from '$components/AlertActions.svelte'
  import AssetGrid from '$components/AssetGrid.svelte'
  import EmptySearchMessage from '$components/EmptySearchMessage.svelte'
  import AssetItem from '$components/AssetItem.svelte'
  import UploadAssetsDialog from '$components/UploadAssetsDialog.svelte'
  import AssetSkeleton from '$components/Skeletons/AssetSkeleton.svelte'
  import Trash from 'phosphor-svelte/lib/Trash'
  import { useAssets, useDeleteAssets } from '$lib/assets/query'
  import { cn } from '$lib/cn'
  import { sortOptions, DEFAULT_SORT_OPTION } from '$lib/select-options'
  import { useIntersect } from '$lib/use-intersect.svelte'
  import Checkbox from '$components/Checkbox.svelte'
  import Divider from '$components/Divider.svelte'
  import { AssetSchema } from '@babyn-yar/schema'
  import { debounce } from '$lib/debounce'
  import { useAssetFilters } from '$lib/use-asset-filters'

  let isUploadDialogOpen = $state(false)
  let isAlertDialogOpen = $state(false)
  let bottomScrollRef: HTMLElement | null = $state(null)
  let selectedAssets: number[] = $state([])
  let hasSelectedAssets = $derived(selectedAssets.length > 0)

  let filters = useAssetFilters()
  const assets = useAssets()

  const deleteAssets = useDeleteAssets()

  useIntersect(() => bottomScrollRef, loadMore, { rootMargin: '300px' })

  function loadMore() {
    if (!assets.isFetchingNextPage && assets.hasNextPage) {
      assets.fetchNextPage()
    }
  }

  function clear() {
    selectedAssets = []
  }

  function handleSearch(e: Event) {
    const filename = (e.target as HTMLInputElement).value
    filters.set(prev => ({ ...prev, filename }))
  }

  function handleSort(sort: AssetSchema.Filters['sort']) {
    filters.set(prev => ({ ...prev, sort }))
  }

  function selectAll() {
    if (assets.isSuccess) {
      selectedAssets = assets.data.pages
        .flatMap(p => p.assets || [])
        .map(asset => asset.id)
    }
  }

  function toggleSelect(id: number) {
    if (selectedAssets.includes(id)) {
      selectedAssets = selectedAssets.filter(a => a !== id)
    } else {
      selectedAssets.push(id)
    }
  }

  function confirmDeletion() {
    deleteAssets.mutate(selectedAssets, {
      onSuccess: () => {
        selectedAssets = []
        isAlertDialogOpen = false
      }
    })
  }

  function cancelDeletion() {
    isAlertDialogOpen = false
    selectedAssets = []
  }
</script>

<div class="flex items-center justify-between gap-4">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8">
    Медіа файли
  </h1>
  <Button onclick={() => (isUploadDialogOpen = true)}>
    {#snippet icon()}
      <CloudArrowUp weight="fill" />
    {/snippet}
    Завантажити
  </Button>
</div>

<div class="mt-4">
  <div class="flex max-w-xl flex-col gap-5 sm:flex-1 sm:flex-row">
    <div class="flex-1">
      <InputGroup>
        <MagnifyingGlass weight="regular" />
        <Input
          placeholder="Пошук&hellip;"
          oninput={debounce(handleSearch)}
          value={filters.current?.filename}
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

<Divider class="my-10" />

{#if hasSelectedAssets}
  <div class="my-5">
    <div
      class="w-full rounded-md bg-gray-100 text-sm font-normal text-gray-700"
    >
      <div class="px-3 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <p>Обрано {selectedAssets.length}</p>
            <Button plain onclick={selectAll}>Обрати всі</Button>
            <Button plain onclick={clear}>Очистити</Button>
          </div>
          <div class="flex items-center justify-center gap-4">
            <Button plain onclick={() => (isAlertDialogOpen = true)}>
              {#snippet icon()}
                <Trash />
              {/snippet}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if assets.isLoading}
  <AssetGrid>
    <AssetSkeleton count={50} />
  </AssetGrid>
{:else if assets.isSuccess && assets.data.pages[0].assets.length === 0}
  <div class="mt-10">
    <EmptySearchMessage />
  </div>
{:else if assets.isError}
  <div class="mt-6 text-center text-red-700">
    <p>Сталася помилка при завантажені</p>
    <p class="font-mono text-sm">{assets.error.message}</p>
  </div>
{:else if assets.isSuccess}
  <AssetGrid>
    {#each assets.data.pages as page}
      {#each page.assets as asset (asset.id)}
        {@const selected = selectedAssets.includes(asset.id)}
        <li class="p-2.5">
          <div class="group relative">
            <AssetItem
              src={asset.url}
              fileName={asset.fileName}
              contentType={asset.contentType}
            />
            <div
              class={cn(
                'absolute top-2 left-2 z-[2] hidden overflow-hidden group-hover:block',
                selected && 'block'
              )}
            >
              <div
                class="flex size-8 items-center justify-center rounded-md border border-zinc-950/10 bg-white"
              >
                <Checkbox
                  checked={selected}
                  onChange={() => toggleSelect(asset.id)}
                />
              </div>
            </div>
          </div>
        </li>
      {/each}
    {/each}
  </AssetGrid>
  <div bind:this={bottomScrollRef}></div>
{/if}

<UploadAssetsDialog bind:open={isUploadDialogOpen} />

<Alert bind:open={isAlertDialogOpen}>
  <AlertTitle>Видалення файлів</AlertTitle>
  <AlertDescription>
    Ви дійсно хочете видалити обрані ({selectedAssets.length}) файли? Файли буде
    видалено назавжди.
  </AlertDescription>
  <AlertActions>
    <Button plain onclick={cancelDeletion}>Скасувати</Button>
    <Button onclick={confirmDeletion} disabled={deleteAssets.isPending}>
      Видалити
    </Button>
  </AlertActions>
</Alert>
