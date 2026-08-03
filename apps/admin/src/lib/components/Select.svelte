<script lang="ts" generics="T extends string">
  import { cn } from '$lib/cn'
  import { getFieldContext } from '$lib/context'
  import { Select } from 'bits-ui'
  import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon'
  import type { Snippet } from 'svelte'

  type Props = {
    id?: string
    value?: T
    placeholder?: string
    invalid?: boolean
    disabled?: boolean
    items?: Array<{ label: string; value: string }>
    offset?: number
    class?: string
    onSelect?: (value: T) => void
    onOpen?: (open: boolean) => void
    children: Snippet
  }

  let {
    id,
    value = $bindable(),
    placeholder,
    invalid = false,
    disabled = false,
    items = [],
    offset = 10,
    class: className = '',
    onSelect,
    onOpen,
    children
  }: Props = $props()

  let label = $derived(
    value ? items.find(i => i.value === value)?.label : undefined
  )

  const ctx = getFieldContext()

  const isDisabled = $derived(disabled || ctx?.disabled())
</script>

<Select.Root
  type="single"
  bind:value
  disabled={isDisabled}
  onValueChange={value => onSelect?.(value as T)}
  onOpenChange={onOpen}
  {items}
>
  <Select.Trigger
    {id}
    type="button"
    class={cn(
      'group relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset focus:outline-hidden focus:after:ring-2 focus:after:ring-blue-500 data-disabled:opacity-50 data-disabled:before:bg-zinc-950/5 data-disabled:before:shadow-none',
      className
    )}
    data-slot="control"
    data-invalid={invalid || undefined}
    data-disabled={isDisabled || undefined}
  >
    <span
      class="relative block min-h-11 w-full appearance-none rounded-lg border border-zinc-950/10 bg-transparent py-2.5 pr-7 pl-3.5 text-left text-base/6 text-zinc-950 group-hover:border-zinc-950/20 group-data-disabled:border-zinc-950/20 group-data-disabled:opacity-100 group-data-invalid:border-red-500 group-data-hover:group-data-invalid:border-red-500 sm:min-h-9 sm:py-1.5 sm:pl-3 sm:text-sm/6"
    >
      {#if label}
        <div class="flex min-w-0 items-center">
          <span class="ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0">
            {label}
          </span>
        </div>
      {:else}
        <span class="block truncate text-zinc-500">
          {placeholder}
        </span>
      {/if}
    </span>
    <span
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
    >
      <CaretDownIcon
        class="size-5 text-zinc-500 group-data-disabled:text-zinc-600 sm:size-4"
      />
    </span>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      sideOffset={offset}
      class="isolate w-max scroll-py-1 overflow-y-scroll overscroll-contain rounded-xl bg-white/75 p-1 shadow-lg ring-1 ring-zinc-950/10 outline outline-transparent backdrop-blur-xl select-none"
    >
      {@render children()}
    </Select.Content>
  </Select.Portal>
</Select.Root>
