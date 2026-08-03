<script lang="ts" generics="T">
  import { getComboboxContext } from '$lib/context'
  import { Combobox as ComboboxPrimitive } from 'bits-ui'
  import CheckIcon from 'phosphor-svelte/lib/CheckIcon'
  import type { Snippet } from 'svelte'

  interface Props {
    value: T
    disabled?: boolean
    children: Snippet
    icon?: Snippet
  }

  let {
    value,
    disabled = false,
    icon = undefined,
    children: kids
  }: Props = $props()

  const { displayValue, getValue } = getComboboxContext()
</script>

<ComboboxPrimitive.Item
  value={getValue(value)}
  label={displayValue(value)}
  {disabled}
  class="group/option grid w-[var(--bits-combobox-anchor-width)] cursor-default grid-cols-[--spacing(5)_1fr] items-baseline gap-x-2 rounded-lg py-2.5 pr-3.5 pl-2 text-base/6 text-zinc-950
  data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[highlighted]:**:data-[slot=icon]:text-white sm:grid-cols-[--spacing(4)_1fr] sm:py-1.5 sm:pr-3 sm:pl-1.5 sm:text-sm/6"
>
  {#snippet children({ selected })}
    {#if selected}
      <CheckIcon
        size={20}
        weight="regular"
        class="relative size-5 self-center text-current sm:size-4"
      />
    {/if}
    <span
      class="col-start-2 flex min-w-0 items-center *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-zinc-500 sm:*:data-[slot=icon]:size-4"
    >
      {@render icon?.()}
      {#if kids}
        <span class="ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0">
          {@render kids()}
        </span>
      {/if}
    </span>
  {/snippet}
</ComboboxPrimitive.Item>
