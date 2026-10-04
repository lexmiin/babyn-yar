<script lang="ts">
  import NotFound from '#components/NotFound.svelte'
  import type { PublicationRoute } from '#lib/publications/routes.js'
  import type { Snippet } from 'svelte'

  type Props = {
    data: {
      publicationRoute?: PublicationRoute
    }
    children: Snippet
  }

  let { data, children }: Props = $props()
</script>

{#if data.publicationRoute}
  {@render children()}
{:else}
  <NotFound />
{/if}
