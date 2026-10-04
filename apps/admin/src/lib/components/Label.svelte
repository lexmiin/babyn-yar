<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getFieldContext } from '#lib/context.js'

  type Props = {
    for: string
    children: Snippet
  }

  const { for: htmlFor, children }: Props = $props()

  const ctx = getFieldContext()
</script>

<label
  for={htmlFor}
  class="text-base/6 text-zinc-950 select-none data-disabled:opacity-50 sm:text-sm/6"
  data-disabled={ctx?.disabled() || undefined}
  data-slot="label"
>
  {@render children()}
</label>
