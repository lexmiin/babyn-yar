<script lang="ts">
  import type { Snippet } from 'svelte'
  import WarningIcon from 'phosphor-svelte/lib/WarningIcon'

  type Props = {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

<div class="my-4">
  <div
    class="flex gap-3 rounded border border-red-700/10 bg-red-100 px-4 py-2.5 text-red-800"
  >
    <WarningIcon />
    <span>
      {@render children()}
    </span>
  </div>
</div>
