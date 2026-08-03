<script lang="ts">
  import { Dialog } from 'bits-ui'
  import { fade, fly } from 'svelte/transition'
  import Sidebar from './Sidebar.svelte'
  import Button from './Button.svelte'
  import ListIcon from 'phosphor-svelte/lib/ListIcon'
  import XIcon from 'phosphor-svelte/lib/XIcon'
  import { mobileDrawer } from '$lib/state.svelte'
</script>

<Dialog.Root
  bind:open={
    () => mobileDrawer.isOpen, newOpen => (mobileDrawer.isOpen = newOpen)
  }
>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button variant="ghost" {...props}>
        {#snippet icon()}
          <ListIcon />
        {/snippet}
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div
            class="fixed inset-0 bg-black/30"
            transition:fade={{ duration: 150 }}
            {...props}
          ></div>
        {/if}
      {/snippet}
    </Dialog.Overlay>
    <Dialog.Content forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div
            {...props}
            class="fixed inset-y-0 w-full max-w-80 p-2"
            transition:fly={{
              x: -350,
              duration: 300,
              opacity: 1
            }}
          >
            <div
              class="flex h-full flex-col rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5"
            >
              <div class="mb-2 px-4 pt-3">
                <Dialog.Close>
                  {#snippet child({ props })}
                    <Button variant="ghost" aria-label="Close" {...props}>
                      {#snippet icon()}
                        <XIcon />
                      {/snippet}
                    </Button>
                  {/snippet}
                </Dialog.Close>
              </div>
              <Sidebar />
            </div>
          </div>
        {/if}
      {/snippet}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
