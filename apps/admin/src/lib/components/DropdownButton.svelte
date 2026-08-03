<script lang="ts">
  import type { Snippet } from 'svelte'
  import { DropdownMenu } from 'bits-ui'
  import Button from './Button.svelte'
  import type { ButtonVariants } from './Button.svelte'

  interface Props extends ButtonVariants {
    icon?: Snippet
    children?: Snippet
  }

  const {
    variant = 'filled',
    icon = undefined,
    children = undefined
  }: Props = $props()
</script>

<DropdownMenu.Trigger>
  {#snippet child({ props })}
    <Button {variant} {icon} {...props} class="data-[state=open]:bg-zinc-950/5">
      {@render children?.()}
    </Button>
  {/snippet}
</DropdownMenu.Trigger>
