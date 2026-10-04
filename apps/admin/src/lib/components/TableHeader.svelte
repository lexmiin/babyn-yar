<script lang="ts">
  import { cn } from '#lib/cn.js'
  import type { Snippet } from 'svelte'

  type Props = {
    class?: string
    children: Snippet
  }

  let { class: className = '', children }: Props = $props()
</script>

<th
  class={cn(
    'border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--page-padding) last:pr-(--page-padding) last:text-right sm:first:pl-1 sm:last:pr-1',
    className
  )}
>
  {@render children()}
</th>
