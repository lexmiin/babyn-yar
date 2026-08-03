<script lang="ts" generics="T">
  import { Combobox } from 'bits-ui'
  import CaretUpDownIcon from 'phosphor-svelte/lib/CaretUpDownIcon'
  import type { Snippet } from 'svelte'
  import { setComboboxContext } from '$lib/context'

  type Props = {
    id?: string
    options: T[]
    value?: T
    invalid?: boolean
    displayValue: (option: T) => string
    getValue: (option: T) => string
    onOpenChange?: (open: boolean) => void
    onChange?: (value: T | undefined) => void
    onSearch?: (term: string) => void
    children: Snippet<[T]>
  }

  let {
    id,
    options,
    value = $bindable(),
    invalid,
    displayValue,
    getValue,
    onChange,
    onOpenChange,
    onSearch,
    children
  }: Props = $props()

  let searchValue = $state(value ? String(displayValue(value)) : '')
  let internalValue = $state<string | undefined>(
    value ? String(getValue(value)) : undefined
  )

  const filtered = $derived(
    searchValue === ''
      ? options
      : options.filter(option => {
          const display = displayValue(option)
          return display.toLowerCase().includes(searchValue.toLowerCase())
        })
  )

  function handleInput(
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) {
    searchValue = e.currentTarget.value
    onSearch?.(e.currentTarget.value)
    if (!searchValue) {
      internalValue = undefined
      onChange?.(undefined)
    }
  }

  function handleValueChange(v: string) {
    const found = options.find(option => String(getValue(option)) === v)
    onChange?.(found)
  }

  setComboboxContext({ getValue, displayValue })
</script>

<Combobox.Root
  type="single"
  allowDeselect={false}
  bind:value={internalValue}
  inputValue={searchValue || undefined}
  {onOpenChange}
  onValueChange={handleValueChange}
>
  <span
    data-slot="control"
    class="relative block w-full before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none has-data-invalid:before:shadow-red-500/10 sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500"
  >
    <Combobox.Input
      {id}
      oninput={handleInput}
      data-slot="control"
      data-invalid={invalid || undefined}
      class="relative block w-full appearance-none rounded-lg border border-zinc-950/10 bg-transparent py-[calc(--spacing(2.5)-1px)] pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 focus:outline-hidden data-disabled:border-zinc-950/20 data-hover:border-zinc-950/20 data-invalid:border-red-500 data-invalid:data-hover:border-red-500 sm:py-[calc(--spacing(1.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)] sm:text-sm/6"
    />

    <Combobox.Trigger
      class="group absolute inset-y-0 right-0 flex items-center px-2"
      type="button"
    >
      <CaretUpDownIcon
        class="size-5 stroke-zinc-500 group-data-disabled:stroke-zinc-600 group-data-hover:stroke-zinc-700 sm:size-4"
      />
    </Combobox.Trigger>
  </span>
  <Combobox.Portal>
    <Combobox.Content
      sideOffset={10}
      class="isolate max-h-80 w-max scroll-py-1 overflow-y-scroll overscroll-contain rounded-xl bg-white/75 p-1 shadow-lg ring-1 ring-zinc-950/10 outline outline-transparent backdrop-blur-xl select-none"
    >
      <Combobox.Viewport>
        {#each filtered as option}
          {@render children(option)}
        {/each}
      </Combobox.Viewport>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
