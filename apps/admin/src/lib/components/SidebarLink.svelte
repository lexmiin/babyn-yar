<script module>
  import { crossfade } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut
  })
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { cn } from '#lib/cn.js'
  import { mobileDrawer } from '#lib/state.svelte.js'
  import type { Snippet } from 'svelte'

  type Props = {
    href: string
    icon: Snippet
    children: Snippet
  }

  const { href, icon, children }: Props = $props()

  let isActive = $derived(page.url.pathname.startsWith(href))
</script>

<div class="flex flex-col gap-0.5">
  <span class="relative">
    {#if isActive}
      <span
        class="absolute inset-y-2 -left-4 inline-block w-0.5 rounded-full bg-zinc-950"
        aria-hidden={!isActive}
        in:receive={{ key: 'indicator' }}
        out:send={{ key: 'indicator' }}
      ></span>
    {/if}
    <a
      {href}
      class={cn(
        `relative flex min-w-0 cursor-default items-center gap-3 rounded-lg px-2 py-2.5 text-left
        text-base/6 font-medium text-zinc-950 hover:bg-zinc-950/5 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0
        *:data-[slot=icon]:fill-zinc-500 hover:*:data-[slot=icon]:fill-zinc-950 sm:py-2 sm:text-sm/5 sm:*:data-[slot=icon]:size-5`,
        isActive && '*:data-[slot=icon]:fill-zinc-950'
      )}
      onclick={mobileDrawer.close}
    >
      {@render icon()}
      <span class="truncate">
        {@render children()}
      </span>
    </a>
  </span>
</div>
