<script lang="ts">
  import TableData from './TableData.svelte'
  import { type Snippet } from 'svelte'
  import { getTableRowContext } from '#lib/context.js'

  type Props = {
    children: Snippet
  }

  let { children: child }: Props = $props()

  const { href } = getTableRowContext()
</script>

<TableData>
  {#snippet children({ tabindex })}
    {#if href}
      <a
        {href}
        {tabindex}
        class="absolute inset-0 focus:outline-hidden"
        data-row-link="true"
        aria-label="Row link"
      ></a>
    {/if}
    {@render child()}
  {/snippet}
</TableData>
