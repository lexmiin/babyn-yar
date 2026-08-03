<script lang="ts">
  import { type Snippet } from 'svelte'
  import { setTableRowContext } from '$lib/context'

  type Props = {
    href?: string
    children: Snippet
  }

  let { href = undefined, children }: Props = $props()

  setTableRowContext({ href })
</script>

<tr
  class="has-data-row-link:hover:bg-zinc-950/3 has-[[data-row-link]:focus]:-outline-offset-2 has-[[data-row-link]:focus]:outline-blue-500 has-[[data-row-link]:focus-visible]:outline-2"
>
  {@render children()}
</tr>
