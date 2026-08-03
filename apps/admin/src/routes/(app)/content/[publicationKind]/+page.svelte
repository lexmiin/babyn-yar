<script lang="ts">
  import { goto } from '$app/navigation'
  import Alert from '$components/Alert.svelte'
  import AlertActions from '$components/AlertActions.svelte'
  import AlertDescription from '$components/AlertDescription.svelte'
  import AlertTitle from '$components/AlertTitle.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import Dropdown from '$components/Dropdown.svelte'
  import DropdownButton from '$components/DropdownButton.svelte'
  import DropdownItem from '$components/DropdownItem.svelte'
  import DropdownMenu from '$components/DropdownMenu.svelte'
  import EmptySearchMessage from '$components/EmptySearchMessage.svelte'
  import Input from '$components/Input.svelte'
  import InputGroup from '$components/InputGroup.svelte'
  import PageHeader from '$components/PageHeader.svelte'
  import PaginationV2 from '$components/PaginationV2.svelte'
  import Select from '$components/Select.svelte'
  import SelectOption from '$components/SelectOption.svelte'
  import Table from '$components/Table.svelte'
  import TableBody from '$components/TableBody.svelte'
  import TableCell from '$components/TableCell.svelte'
  import TableHead from '$components/TableHead.svelte'
  import TableHeader from '$components/TableHeader.svelte'
  import TableIconCell from '$components/TableIconCell.svelte'
  import TableRow from '$components/TableRow.svelte'
  import TableSkeleton from '$components/Skeletons/TableSkeleton.svelte'
  import { debounce } from '$lib/debounce'
  import { formatDate } from '$lib/format-date'
  import {
    useDeletePublication,
    usePublications
  } from '$lib/publications/query'
  import type { PublicationRoute } from '$lib/publications/routes'
  import { publicationEditHref } from '$lib/publications/workflow'
  import {
    DEFAULT_PUBLICATION_SORT_OPTION,
    publicationSortOptions
  } from '$lib/select-options'
  import { trimText } from '$lib/trim-text'
  import { usePublicationFilters } from '$lib/use-publication-filters'
  import { PublicationSchema } from '@babyn-yar/schema'
  import ArrowDownIcon from 'phosphor-svelte/lib/ArrowDownIcon'
  import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon'
  import DotsThreeIcon from 'phosphor-svelte/lib/DotsThreeIcon'
  import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon'
  import PencilIcon from 'phosphor-svelte/lib/PencilIcon'
  import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon'

  type Props = {
    data: {
      publicationRoute: PublicationRoute
      publicationSlug: string
    }
  }

  let { data }: Props = $props()
  let kind = $derived(data.publicationRoute.kind)
  let route = $derived(data.publicationSlug)
  let title = $derived(data.publicationRoute.title)
  const filters = usePublicationFilters()
  const content = usePublications(
    () => kind,
    () => filters.current
  )
  const deleteContent = useDeletePublication(() => kind)

  let selected: PublicationSchema.Summary | undefined = $state(undefined)
  let isAlertOpen = $state(false)

  function handleEdit(publication: PublicationSchema.Summary) {
    goto(publicationEditHref(kind, publication.id, publication.locale))
  }

  function handleShowAlert(publication: PublicationSchema.Summary) {
    selected = publication
    isAlertOpen = true
  }

  function handleCancelDeletion() {
    selected = undefined
    isAlertOpen = false
  }

  function handleDelete() {
    if (!selected) return
    deleteContent.mutate({
      id: selected.id,
      locale: selected.locale
    })
    selected = undefined
    isAlertOpen = false
  }

  function handleSearch(e: Event) {
    const title = (e.target as HTMLInputElement).value
    filters.set(prev => ({ ...prev, page: 1, title }))
  }

  function handlePageSelect(page: number) {
    filters.set(prev => ({ ...prev, page }))
  }

  function handleSort(sort: PublicationSchema.Filters['sort']) {
    filters.set(prev => ({ ...prev, page: 1, sort }))
  }
</script>

<PageHeader {title}>
  <Button href={`/content/${route}/create`}>
    {#snippet icon()}
      <PlusIcon size={16} />
    {/snippet}
    Cтворити
  </Button>
</PageHeader>

<Container {title}>
  <div class="mb-5">
    <div class="flex max-w-xl flex-col gap-5 sm:flex-1 sm:flex-row">
      <div class="flex-1">
        <InputGroup>
          <MagnifyingGlassIcon weight="regular" />
          <Input
            placeholder="Пошук&hellip;"
            oninput={debounce(handleSearch)}
            value={filters.current?.title}
          />
        </InputGroup>
      </div>
      <div class="sm:w-44">
        <Select
          items={Object.entries(publicationSortOptions).map(
            ([value, opts]) => ({
              value,
              ...opts
            })
          )}
          onSelect={handleSort}
          value={filters.current?.sort || DEFAULT_PUBLICATION_SORT_OPTION}
        >
          {#each Object.entries(publicationSortOptions) as [key, value] (key)}
            <SelectOption value={key} label={value.label}>
              {#snippet icon()}
                {#if value.order === 'asc'}
                  <ArrowUpIcon weight="fill" />
                {:else}
                  <ArrowDownIcon weight="fill" />
                {/if}
              {/snippet}
              {value.label}
            </SelectOption>
          {/each}
        </Select>
      </div>
    </div>
  </div>
  {#if content.isLoading}
    <TableSkeleton />
  {:else if content.data?.publications.length === 0}
    <EmptySearchMessage />
  {:else if content.data}
    <Table>
      <TableHead>
        <TableHeader>Сторінка</TableHeader>
        <TableHeader>Остання зміна</TableHeader>
        <TableHeader>Автор</TableHeader>
        <TableHeader class="relative w-0">
          <span class="sr-only">Дії</span>
        </TableHeader>
      </TableHead>
      <TableBody>
        {#each content.data.publications as publication (`${publication.id}:${publication.locale}`)}
          <TableRow
            href={publicationEditHref(kind, publication.id, publication.locale)}
          >
            <TableCell>{trimText(publication.title, 100)}</TableCell>
            <TableCell>{formatDate(publication.updatedAt)}</TableCell>
            <TableCell>{publication.publisher.fullName}</TableCell>
            <TableIconCell>
              <Dropdown>
                <DropdownButton variant="ghost">
                  {#snippet icon()}
                    <DotsThreeIcon />
                  {/snippet}
                </DropdownButton>
                <DropdownMenu offset={3}>
                  <DropdownItem onSelect={() => handleEdit(publication)}>
                    {#snippet icon()}
                      <PencilIcon weight="fill" />
                    {/snippet}
                    Редагувати
                  </DropdownItem>
                  <DropdownItem onSelect={() => handleShowAlert(publication)}>
                    {#snippet icon()}
                      <TrashIcon weight="fill" />
                    {/snippet}
                    Видалити
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableIconCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
    <div class="mt-5">
      <PaginationV2
        currentPage={content.data.metadata.currentPage}
        totalPages={content.data.metadata.totalRecords}
        perPage={content.data.metadata.pageSize}
        onPageSelect={handlePageSelect}
      />
    </div>
  {/if}
</Container>

<Alert bind:open={isAlertOpen}>
  <AlertTitle>Видалення запису</AlertTitle>
  <AlertDescription>
    Ви дійсно хочете видалити цей запис? Ця дія незворотна.
  </AlertDescription>
  <AlertActions>
    <Button variant="ghost" onclick={handleCancelDeletion}>Скасувати</Button>
    <Button
      variant="danger"
      onclick={handleDelete}
      disabled={deleteContent.isPending}
    >
      Видалити
    </Button>
  </AlertActions>
</Alert>
