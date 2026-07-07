<script lang="ts">
  import ContentPage from '$components/ContentPage.svelte'
  import Plus from 'phosphor-svelte/lib/Plus'
  import PageHeader from '$components/PageHeader.svelte'
  import { ContentSchema } from '@babyn-yar/schema'
  import { useDeleteEvents, useEvents } from '$lib/content/query'
  import { useContentFilters } from '$lib/use-content-filters'
  import Button from '$components/Button.svelte'

  const filters = useContentFilters()
  const events = useEvents(() => filters.current)
  const deleteEvent = useDeleteEvents()

  function handleDelete(selected: number[]) {
    deleteEvent.mutate(selected)
  }

  function handleFilter(title: string) {
    filters.set(prev => ({ ...prev, page: 1, title }))
  }

  function handlePageSelect(page: number) {
    filters.set(prev => ({ ...prev, page }))
  }

  function handleSort(sort: ContentSchema.Filters['sort']) {
    filters.set(prev => ({ ...prev, page: 1, sort }))
  }
</script>

<PageHeader title="Події">
  <Button href="/content/events/create">
    {#snippet icon()}
      <Plus size={16} />
    {/snippet}
    Cтворити
  </Button>
</PageHeader>

<ContentPage
  data={events.data?.events.map(e => ({
    id: e.id,
    title: e.title,
    author: e.user.fullName,
    lastChange: e.updatedAt
  })) || []}
  metadata={events.data?.metadata}
  isLoading={events.isLoading}
  title="Події"
  entryHref="/content/events"
  searchValue={filters.current?.title}
  sortValue={filters.current?.sort}
  isDeleting={deleteEvent.isPending}
  onFilter={handleFilter}
  onDelete={handleDelete}
  onPageSelect={handlePageSelect}
  onSort={handleSort}
/>
