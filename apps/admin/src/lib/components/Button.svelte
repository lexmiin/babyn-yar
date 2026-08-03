<script module lang="ts">
  import { cva, type VariantProps } from 'cva'

  const buttonVariants = cva({
    base: `relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border border-transparent px-3.5 py-2.5 text-base/6 font-semibold
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5
      *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center sm:px-3 sm:py-1.5 sm:text-sm/6 sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4`,
    variants: {
      variant: {
        filled:
          'bg-zinc-950/90 text-white before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-zinc-900 before:shadow-sm after:absolute after:inset-0 after:-z-10 after:rounded-lg hover:after:bg-white/10 disabled:before:shadow-none disabled:after:shadow-none disabled:hover:after:bg-transparent *:data-[slot=icon]:fill-zinc-400 hover:*:data-[slot=icon]:fill-zinc-300',
        ghost:
          'text-zinc-950 hover:bg-zinc-950/5 *:data-[slot=icon]:text-zinc-500 hover:*:data-[slot=icon]:fill-zinc-700',
        danger:
          'bg-red-600/10 text-red-600 focus-visible:outline-red-500 hover:bg-red-600/15 *:data-[slot=icon]:text-red-400 hover:*:data-[slot=icon]:fill-red-600'
      }
    }
  })

  export type ButtonVariants = VariantProps<typeof buttonVariants>
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { cn } from '$lib/cn'

  interface Props extends HTMLButtonAttributes, ButtonVariants {
    href?: string
    isLoading?: boolean
    class?: string
    icon?: Snippet
    children?: Snippet
  }

  const {
    href,
    isLoading,
    disabled,
    variant = 'filled',
    class: className,
    icon,
    children,
    ...rest
  }: Props = $props()

  let isDisabled = $derived(disabled || isLoading)
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  href={href && !isDisabled ? href : undefined}
  disabled={href ? undefined : isDisabled}
  aria-disabled={href ? isDisabled : undefined}
  role={href && isDisabled ? 'link' : undefined}
  class={cn(buttonVariants({ variant }), className)}
  {...rest}
>
  {#if isLoading && !href}
    <svg
      data-slot="icon"
      class="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      ><circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle><path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path></svg
    >
  {:else}
    {@render icon?.()}
  {/if}

  {#if children}
    <span class="truncate empty:hidden">
      {@render children()}
    </span>
  {/if}
</svelte:element>
