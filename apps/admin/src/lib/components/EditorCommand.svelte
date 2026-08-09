<script lang="ts">
  import { type Snippet } from 'svelte'
  import { cn } from '$lib/cn'

  type Props = {
    ariaLabel: string
    active?: boolean
    onClick: VoidFunction
    children: Snippet
  }

  let { ariaLabel, active = false, onClick, children }: Props = $props()
</script>

<button
  type="button"
  onclick={onClick}
  aria-label={ariaLabel}
  class={cn(
    'rounded p-1.5 hover:bg-zinc-950/5 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:size-4',
    active && 'bg-zinc-950/5'
  )}
>
  {@render children()}
</button>
