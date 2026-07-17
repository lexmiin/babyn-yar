<script lang="ts">
  import { formatDate } from '$lib/format-date'
  import { trimText } from '$lib/trim-text'
  import Table from './Table.svelte'
  import TableHeader from './TableHeader.svelte'
  import TableRow from './TableRow.svelte'
  import TableCell from './TableCell.svelte'
  import TableBody from './TableBody.svelte'
  import TableHead from './TableHead.svelte'
  import PaginationV2 from './PaginationV2.svelte'
  import Container from './Container.svelte'
  import EmptySearchMessage from './EmptySearchMessage.svelte'
  import TableSkeleton from './Skeletons/TableSkeleton.svelte'
  import TableIconCell from './TableIconCell.svelte'
  import Dropdown from './Dropdown.svelte'
  import DropdownButton from './DropdownButton.svelte'
  import DotsThree from 'phosphor-svelte/lib/DotsThree'
  import DropdownMenu from './DropdownMenu.svelte'
  import DropdownItem from './DropdownItem.svelte'
  import Trash from 'phosphor-svelte/lib/Trash'
  import Pencil from 'phosphor-svelte/lib/Pencil'
  import InputGroup from './InputGroup.svelte'
  import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass'
  import Input from './Input.svelte'
  import { debounce } from '$lib/debounce'
  import Select from './Select.svelte'
  import SelectOption from './SelectOption.svelte'
  import ArrowUp from 'phosphor-svelte/lib/ArrowUp'
  import ArrowDown from 'phosphor-svelte/lib/ArrowDown'
  import {
    contentSortOptions,
    DEFAULT_CONTENT_SORT_OPTION
  } from '$lib/select-options'
  import Alert from './Alert.svelte'
  import AlertTitle from './AlertTitle.svelte'
  import AlertDescription from './AlertDescription.svelte'
  import AlertActions from './AlertActions.svelte'
  import Button from './Button.svelte'
  import { goto } from '$app/navigation'
  import type { Metadata } from '@babyn-yar/schema'

  type ContentData = {
    id: number
    title: string
    author: string
    lastChange: string
  }

  type Props = {
    data: ContentData[]
    metadata?: Metadata
    isLoading: boolean
    entryHref: string
    title: string
    searchValue?: string
    sortValue?: keyof typeof contentSortOptions
    isDeleting: boolean
    onFilter: (value: string) => void
    onDelete: (ids: number[]) => void
    onPageSelect: (page: number) => void
    onSort: (sort: keyof typeof contentSortOptions) => void
  }

  let {
    data,
    metadata,
    isLoading,
    entryHref,
    title,
    searchValue,
    sortValue,
    isDeleting,
    onFilter,
    onDelete,
    onPageSelect,
    onSort
  }: Props = $props()

  let selected: ContentData | undefined = $state(undefined)
  let isAlertOpen = $state(false)

  function handleEdit(content: ContentData) {
    goto(`${entryHref}/${content.id}`)
  }

  function handleShowAlert(content: ContentData) {
    selected = content
    isAlertOpen = true
  }

  function handleCancelDeletion() {
    selected = undefined
    isAlertOpen = false
  }

  function handleDelete() {
    if (!selected) return
    onDelete([selected.id])
    selected = undefined
    isAlertOpen = false
  }

  function handleSearch(e: Event) {
    onFilter((e.target as HTMLInputElement).value)
  }
</script>

<Container {title}>
  <div class="mb-5">
    <div class="flex max-w-xl flex-col gap-5 sm:flex-1 sm:flex-row">
      <div class="flex-1">
        <InputGroup>
          <MagnifyingGlass weight="regular" />
          <Input
            placeholder="Пошук&hellip;"
            oninput={debounce(handleSearch)}
            value={searchValue}
          />
        </InputGroup>
      </div>
      <div class="sm:w-44">
        <Select
          items={Object.entries(contentSortOptions).map(([value, opts]) => ({
            value: value,
            ...opts
          }))}
          onSelect={onSort}
          value={sortValue || DEFAULT_CONTENT_SORT_OPTION}
        >
          {#each Object.entries(contentSortOptions) as [key, value] (key)}
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
  {#if isLoading}
    <TableSkeleton />
  {:else if !isLoading && data.length === 0}
    <EmptySearchMessage />
  {:else}
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
        {#each data as record (record.id)}
          <TableRow href={`${entryHref}/${record.id}`}>
            <TableCell>{trimText(record.title, 100)}</TableCell>
            <TableCell>{formatDate(record.lastChange)}</TableCell>
            <TableCell>{record.author}</TableCell>
            <TableIconCell>
              <Dropdown>
                <DropdownButton plain>
                  {#snippet icon()}
                    <DotsThree />
                  {/snippet}
                </DropdownButton>
                <DropdownMenu offset={3}>
                  <DropdownItem onSelect={() => handleEdit(record)}>
                    {#snippet icon()}
                      <Pencil weight="fill" />
                    {/snippet}
                    Редагувати
                  </DropdownItem>
                  <DropdownItem onSelect={() => handleShowAlert(record)}>
                    {#snippet icon()}
                      <Trash weight="fill" />
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
    {#if metadata}
      <div class="mt-5">
        <PaginationV2
          currentPage={metadata.currentPage}
          totalPages={metadata.totalRecords}
          perPage={metadata.pageSize}
          {onPageSelect}
        />
      </div>
    {/if}
  {/if}
</Container>

<Alert bind:open={isAlertOpen}>
  <AlertTitle>Видалення запису</AlertTitle>
  <AlertDescription>
    Ви дійсно хочете видалити цей запис? Ця дія незворотна.
  </AlertDescription>
  <AlertActions>
    <Button plain onclick={handleCancelDeletion}>Скасувати</Button>
    <Button onclick={handleDelete} disabled={isDeleting}>Видалити</Button>
  </AlertActions>
</Alert>
