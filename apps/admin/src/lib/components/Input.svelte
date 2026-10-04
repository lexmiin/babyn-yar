<script lang="ts">
  import { cn } from '#lib/cn.js'
  import { getFieldContext } from '#lib/context.js'
  import type { HTMLInputAttributes } from 'svelte/elements'

  type Props = HTMLInputAttributes & {
    value?: string
    invalid?: boolean
    class?: string
  }

  let {
    value = $bindable(''),
    invalid = false,
    class: className = '',
    disabled = false,
    ...rest
  }: Props = $props()

  const ctx = getFieldContext()

  let isDisabled = $derived(disabled || ctx?.disabled())
</script>

<span
  class="relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none has-data-invalid:before:shadow-red-500/10 sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500"
  data-slot="control"
>
  <input
    bind:value
    class={cn(
      'relative block  w-full rounded-lg border border-zinc-950/10 bg-transparent px-3.5 py-2.5 text-base/6 text-zinc-950 placeholder:text-zinc-500 hover:border-zinc-950/20 focus:outline-hidden data-disabled:border-zinc-950/20 data-invalid:border-red-500 data-invalid:hover:border-red-500 sm:px-3 sm:py-1.5 sm:text-sm/6',
      className
    )}
    disabled={isDisabled}
    data-invalid={invalid ? 'true' : undefined}
    data-disabled={isDisabled || undefined}
    autocorrect="off"
    autocomplete="off"
    {...rest}
  />
</span>
