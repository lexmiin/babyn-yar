<script lang="ts">
  import Sidebar from '#components/Sidebar.svelte'
  import MobileDrawer from '#components/MobileDrawer.svelte'
  import type { Snippet } from 'svelte'
  import LoggedUserContext from '#components/LoggedUserContext.svelte'

  type Props = {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

<LoggedUserContext>
  <div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
    <Sidebar />
  </div>
  <header class="flex items-center px-4 lg:hidden">
    <div class="py-2.5">
      <MobileDrawer />
    </div>
  </header>
  <main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
    <div
      class="grow px-(--page-padding) py-6 [--page-padding:--spacing(6)] lg:rounded-lg lg:bg-white lg:px-(--page-padding) lg:py-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 lg:[--page-padding:--spacing(10)]"
    >
      <div class="mx-auto max-w-6xl">
        {@render children()}
      </div>
    </div>
  </main>
</LoggedUserContext>
