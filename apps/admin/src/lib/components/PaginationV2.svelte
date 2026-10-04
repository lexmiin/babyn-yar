<script lang="ts">
  import { Pagination } from 'bits-ui'
  import PaginationPrev from './PaginationPrev.svelte'
  import PaginationNext from './PaginationNext.svelte'
  import PaginationList from './PaginationList.svelte'
  import PaginationPage from './PaginationPage.svelte'
  import { cn } from '#lib/cn.js'
  import PaginationGap from './PaginationGap.svelte'

  type Props = {
    currentPage: number
    totalPages: number
    perPage: number
    onPageSelect: (page: number) => void
    class?: string
  }

  const {
    currentPage,
    totalPages,
    perPage,
    onPageSelect,
    class: className = ''
  }: Props = $props()

  function selectPage(page: number) {
    onPageSelect(page)
  }
</script>

<Pagination.Root
  page={currentPage}
  count={totalPages}
  {perPage}
  onPageChange={selectPage}
  class={cn('flex gap-x-2', className)}
>
  {#snippet children({ pages })}
    <PaginationPrev />
    <PaginationList>
      {#each pages as page (page.key)}
        {#if page.type === 'page'}
          <PaginationPage {page} disabled={page.value === currentPage} />
        {:else}
          <PaginationGap />
        {/if}
      {/each}
    </PaginationList>
    <PaginationNext />
  {/snippet}
</Pagination.Root>
