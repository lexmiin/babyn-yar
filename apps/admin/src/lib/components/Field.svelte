<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '#lib/cn.js'
  import { setFieldContext } from '#lib/context.js'

  type Props = {
    disabled?: boolean
    class?: string
    children: Snippet
  }

  const { disabled = false, class: className = '', children }: Props = $props()

  setFieldContext({ disabled: () => disabled })
</script>

<div
  class={cn(
    '*:data-[slot=label]:font-medium [&>[data-slot=control]+[data-slot=description]]:mt-3 [&>[data-slot=control]+[data-slot=error]]:mt-3 [&>[data-slot=description]+[data-slot=control]]:mt-3 [&>[data-slot=label]+[data-slot=control]]:mt-3 [&>[data-slot=label]+[data-slot=description]]:mt-1',
    className
  )}
>
  {@render children()}
</div>
