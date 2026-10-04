<script lang="ts">
  import { cn } from '#lib/cn.js'

  type Props = {
    class?: string
  }

  let { class: className = '' }: Props = $props()
</script>

<hr
  class={cn('w-full border-t border-zinc-950/10', className)}
  role="presentation"
/>
