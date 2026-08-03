<script lang="ts">
  import { DatePicker } from 'bits-ui'
  import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon'
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon'
  import CalendarBlankIcon from 'phosphor-svelte/lib/CalendarBlankIcon'
  import Button from './Button.svelte'
  import type { DateValue } from '@internationalized/date'
  import { jsDateToCalendarDate } from '$lib/format-date'

  type Props = {
    id?: string
    value?: Date | string
    onChange?: (date: DateValue | undefined) => void
  }

  let { id, value, onChange }: Props = $props()

  let date = $derived(
    value ? (typeof value === 'string' ? new Date(value) : value) : new Date()
  )

  let anchorRef: HTMLSpanElement | null = $state(null)
</script>

<DatePicker.Root
  value={jsDateToCalendarDate(date)}
  weekdayFormat="short"
  locale="uk-UA"
  fixedWeeks
  onValueChange={onChange}
>
  <span
    bind:this={anchorRef}
    data-slot="control"
    class="relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none has-data-invalid:before:shadow-red-500/10 sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500"
  >
    <DatePicker.Input
      data-slot="control"
      class="relative block  w-full rounded-lg border border-zinc-950/10 bg-transparent px-3.5 py-2.5 text-base/6 text-zinc-950 placeholder:text-zinc-500 hover:border-zinc-950/20 focus:outline-hidden data-disabled:border-zinc-950/20 data-invalid:border-red-500 data-invalid:hover:border-red-500 sm:px-3 sm:py-1.5 sm:text-sm/6 "
    >
      {#snippet children({ segments })}
        {#each segments as { part, value }, i (part + i)}
          <div class="inline-block select-none">
            {#if part === 'literal'}
              <DatePicker.Segment {part}>
                {value}
              </DatePicker.Segment>
            {:else}
              <DatePicker.Segment {part}>
                {value}
              </DatePicker.Segment>
            {/if}
          </div>
        {/each}
      {/snippet}
    </DatePicker.Input>
    <DatePicker.Trigger
      {id}
      class="group absolute inset-y-0 right-0 flex items-center px-2 outline-none"
      type="button"
    >
      <CalendarBlankIcon
        class="size-5 text-zinc-500 group-hover:text-zinc-700 sm:size-4"
      />
    </DatePicker.Trigger>
  </span>
  <DatePicker.Portal>
    <DatePicker.Content
      sideOffset={10}
      class="relative isolate before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm"
      customAnchor={anchorRef}
    >
      <DatePicker.Calendar
        class="relative rounded-lg border border-zinc-950/10 p-5"
      >
        {#snippet children({ months, weekdays })}
          <DatePicker.Header class="flex items-center justify-between">
            <DatePicker.PrevButton>
              {#snippet child({ props })}
                <Button variant="ghost" {...props}>
                  {#snippet icon()}
                    <CaretLeftIcon />
                  {/snippet}
                </Button>
              {/snippet}
            </DatePicker.PrevButton>
            <DatePicker.Heading class="text-base/6 sm:text-sm/6" />
            <DatePicker.NextButton>
              {#snippet child({ props })}
                <Button variant="ghost" {...props}>
                  {#snippet icon()}
                    <CaretRightIcon />
                  {/snippet}
                </Button>
              {/snippet}
            </DatePicker.NextButton>
          </DatePicker.Header>
          <div
            class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            {#each months as month, i (i)}
              <DatePicker.Grid
                class="w-full border-collapse space-y-1 select-none"
              >
                <DatePicker.GridHead>
                  <DatePicker.GridRow class="mb-1 flex w-full justify-between">
                    {#each weekdays as day, i (i)}
                      <DatePicker.HeadCell
                        class="size-10 rounded-md text-xs text-zinc-950/50"
                      >
                        <div>{day.slice(0, 2)}</div>
                      </DatePicker.HeadCell>
                    {/each}
                  </DatePicker.GridRow>
                </DatePicker.GridHead>
                <DatePicker.GridBody>
                  {#each month.weeks as weekDates, i (i)}
                    <DatePicker.GridRow class="flex w-full">
                      {#each weekDates as date, i (i)}
                        <DatePicker.Cell
                          {date}
                          month={month.value}
                          class="relative size-10 text-center text-sm"
                        >
                          <DatePicker.Day
                            class="group relative mx-auto inline-flex size-10  items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-sm font-normal whitespace-nowrap text-zinc-900 hover:ring-2 hover:ring-blue-500 hover:ring-inset focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset data-disabled:pointer-events-none  data-disabled:opacity-30  data-outside-month:pointer-events-none data-selected:bg-blue-500 data-selected:text-white"
                          >
                            {date.day}
                          </DatePicker.Day>
                        </DatePicker.Cell>
                      {/each}
                    </DatePicker.GridRow>
                  {/each}
                </DatePicker.GridBody>
              </DatePicker.Grid>
            {/each}
          </div>
        {/snippet}
      </DatePicker.Calendar>
    </DatePicker.Content>
  </DatePicker.Portal>
</DatePicker.Root>
