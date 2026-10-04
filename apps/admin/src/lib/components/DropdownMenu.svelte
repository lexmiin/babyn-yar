<script lang="ts">
  import { DropdownMenu } from 'bits-ui'
  import { cn } from '#lib/cn.js'

  const { children, loop = false, offset = 5, class: className = '' } = $props()
</script>

<DropdownMenu.Portal>
  <DropdownMenu.Content
    {loop}
    sideOffset={offset}
    class={cn(
      'data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out isolate grid grid-cols-[auto_1fr] overflow-y-auto rounded-xl bg-white/75 p-1 shadow-lg ring-1 ring-zinc-950/10 outline outline-transparent backdrop-blur-xl focus:outline-hidden',
      className
    )}
  >
    {@render children()}
  </DropdownMenu.Content>
</DropdownMenu.Portal>
