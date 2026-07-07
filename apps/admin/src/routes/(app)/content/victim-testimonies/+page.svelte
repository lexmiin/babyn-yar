<script lang="ts">
  import ContentPage from '$components/ContentPage.svelte'
  import Plus from 'phosphor-svelte/lib/Plus'
  import PageHeader from '$components/PageHeader.svelte'
  import { useContentFilters } from '$lib/use-content-filters'
  import { useDeleteTestimonies, useTestimonies } from '$lib/content/query'
  import { ContentSchema } from '@babyn-yar/schema'
  import Button from '$components/Button.svelte'

  const slug = 'victim-testimonies'
  const filters = useContentFilters()
  const content = useTestimonies(() => filters.current)
  const deleteContent = useDeleteTestimonies()

  function handleDelete(selected: number[]) {
    deleteContent.mutate(selected)
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

<PageHeader title="Свідчення очевидців трагедії">
  <Button href={`/content/${slug}/create`}>
    {#snippet icon()}
      <Plus />
    {/snippet}
    Cтворити
  </Button>
</PageHeader>

<ContentPage
  data={content.data?.testimonies.map(e => ({
    id: e.id,
    title: e.title,
    author: e.user.fullName,
    lastChange: e.updatedAt
  })) || []}
  metadata={content.data?.metadata}
  isLoading={content.isLoading}
  title="Свідчення очевидців трагедії"
  entryHref={`/content/${slug}`}
  searchValue={filters.current?.title}
  sortValue={filters.current?.sort}
  isDeleting={deleteContent.isPending}
  onFilter={handleFilter}
  onDelete={handleDelete}
  onPageSelect={handlePageSelect}
  onSort={handleSort}
/>
