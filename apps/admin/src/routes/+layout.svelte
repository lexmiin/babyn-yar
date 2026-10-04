<script>
  import '../app.css'
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { NuqsAdapter } from 'nuqs-svelte/adapters/svelte-kit'
  import { queryClient } from '#query/client.js'
  import IconContext from 'phosphor-svelte/lib/IconContext'
  import { Toaster } from 'svelte-sonner'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'

  const { children } = $props()
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  <NuqsAdapter options={{ shallow: false }}>
    <IconContext values={{ 'data-slot': 'icon' }}>
      <Toaster />
      <div
        class="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col lg:bg-zinc-100"
      >
        {@render children()}
      </div>
    </IconContext>
  </NuqsAdapter>
  <SvelteQueryDevtools />
</QueryClientProvider>
