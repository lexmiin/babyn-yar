<script lang="ts">
  import { cn } from '#lib/cn.js'
  import { AlertDialog } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import { fade, scale } from 'svelte/transition'

  type Props = {
    open?: boolean
    class?: string
    children: Snippet
  }

  let {
    open = $bindable(false),
    class: className = '',
    children
  }: Props = $props()

  const transitionDuration = 150
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay forceMount>
      {#snippet child({ open, props })}
        {#if open}
          <div
            class="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/25 px-2 py-2 focus:outline-0 sm:px-6 sm:py-8 lg:px-8 lg:py-16"
            transition:fade={{ duration: transitionDuration }}
            {...props}
          ></div>
        {/if}
      {/snippet}
    </AlertDialog.Overlay>
    <AlertDialog.Content forceMount>
      {#snippet child({ open, props })}
        {#if open}
          <div class="fixed inset-0 w-screen overflow-y-auto pt-6 sm:pt-0">
            <div
              class="grid min-h-full grid-rows-[1fr_auto_1fr] justify-items-center p-8 sm:grid-rows-[1fr_auto_3fr] sm:p-4"
            >
              <div
                {...props}
                transition:scale={{
                  start: 0.97,
                  duration: transitionDuration
                }}
                class={cn(
                  'row-start-2 w-full min-w-0 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-950/10 sm:mb-auto sm:max-w-lg sm:rounded-2xl',
                  className
                )}
              >
                {@render children()}
              </div>
            </div>
          </div>
        {/if}
      {/snippet}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
