<script lang="ts">
  import { cn } from '#lib/cn.js'
  import type { Snippet } from 'svelte'

  type Props = {
    class?: string
    children: Snippet
  }
  const { children, class: className = '' }: Props = $props()
</script>

<span
  data-slot="control"
  class={cn(
    'relative isolate block *:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 *:data-[slot=icon]:text-zinc-500 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4 has-[[data-slot=icon]:first-child]:[&_input]:pl-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-9 [&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5',
    className
  )}
>
  {@render children()}
</span>
