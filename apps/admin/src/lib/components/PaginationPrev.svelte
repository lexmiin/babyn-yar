<script lang="ts">
  import { Pagination } from 'bits-ui'
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon'
</script>

<div class="grow basis-0">
  <Pagination.PrevButton
    class="relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border border-transparent px-3.5 py-2.5 text-base/6 font-semibold text-zinc-950 [--btn-icon:var(--color-zinc-500)] hover:bg-zinc-950/5 hover:[--btn-icon:var(--color-zinc-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:[--btn-icon:var(--color-zinc-500)] *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:px-3 sm:py-1.5 sm:text-sm/6 sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4"
  >
    <ArrowLeftIcon />
    Попередня
  </Pagination.PrevButton>
</div>
