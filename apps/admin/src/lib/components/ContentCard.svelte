<script lang="ts">
  import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon'
  import ArrowUpLeftIcon from 'phosphor-svelte/lib/ArrowUpLeftIcon'
  import type { Snippet } from 'svelte'

  type Props = {
    title: string
    href: string
    showCreate?: boolean
    children?: Snippet
  }

  let { title, href, showCreate = true, children }: Props = $props()

  let createHref = $derived(href + '/create')
</script>

<div class="divide-y rounded-md border bg-white shadow-md">
  <div class="p-6">
    <h3 class="font-semibold">
      {title}
    </h3>
    <p class="mt-1.5 text-sm text-gray-500">
      {#if children}
        {@render children?.()}
      {:else}
        Перегляньте існуючі записи або створіть новий
      {/if}
    </p>
  </div>
  <div class="flex justify-between divide-x">
    <div class="flex-1">
      <a
        {href}
        class="flex items-center justify-center gap-1.5 rounded-bl-md py-4 text-sm font-semibold hover:bg-gray-50"
      >
        <ArrowUpLeftIcon class="size-5 text-gray-400" />
        <span>Переглянути</span>
      </a>
    </div>
    {#if showCreate}
      <div class="flex-1">
        <a
          href={createHref}
          class="flex items-center justify-center gap-1.5 rounded-br-md py-4 text-sm font-semibold hover:bg-gray-50"
        >
          <PlusCircleIcon class="size-5 text-gray-400" />
          <span>Створити</span>
        </a>
      </div>
    {/if}
  </div>
</div>
