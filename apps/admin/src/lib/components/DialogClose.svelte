<script lang="ts">
  import { Dialog } from 'bits-ui'
  import Button from './Button.svelte'
  import type { ButtonVariants } from './Button.svelte'
  import type { Snippet } from 'svelte'

  interface Props extends ButtonVariants {
    children?: Snippet
  }

  let { variant = 'ghost', children }: Props = $props()
</script>

<Dialog.Close>
  {#snippet child({ props })}
    <Button {variant} {...props}>
      {#if children}
        {@render children()}
      {:else}
        Відмінити
      {/if}
    </Button>
  {/snippet}
</Dialog.Close>
