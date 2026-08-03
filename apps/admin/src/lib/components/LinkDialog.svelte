<script lang="ts">
  import Dialog from './Dialog.svelte'
  import DialogTitle from './DialogTitle.svelte'
  import DialogDescription from './DialogDescription.svelte'
  import DialogBody from './DialogBody.svelte'
  import DialogActions from './DialogActions.svelte'
  import DialogClose from './DialogClose.svelte'
  import Button from './Button.svelte'
  import Field from './Field.svelte'
  import Label from './Label.svelte'
  import Input from './Input.svelte'
  import Select from './Select.svelte'
  import SelectOption from './SelectOption.svelte'
  import LinkIcon from 'phosphor-svelte/lib/LinkIcon'
  import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon'
  import AtIcon from 'phosphor-svelte/lib/AtIcon'

  type Props = {
    open: boolean
    onSelect: (href: string, type: 'internal' | 'external' | 'email') => void
  }

  let { open = $bindable(), onSelect }: Props = $props()

  let href = $state('')
  let type: 'internal' | 'external' | 'email' = $state('internal')

  function handleConfirm() {
    onSelect(href, type)
    href = ''
    type = 'internal'
  }

  const options = [
    {
      label: 'Internal',
      value: 'internal',
      Icon: LinkIcon
    },
    {
      label: 'URL',
      value: 'external',
      Icon: GlobeIcon
    },
    {
      label: 'Email',
      value: 'email',
      Icon: AtIcon
    }
  ]
</script>

<Dialog bind:open class="sm:max-w-xl">
  <DialogTitle>Посилання</DialogTitle>
  <DialogDescription>Додати будь-яке посилання</DialogDescription>
  <DialogBody>
    <div class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
      <Field class="sm:col-span-2">
        <Label for="link">Посилання</Label>
        <Input bind:value={href} id="link" />
      </Field>
      <Field>
        <Label for="link-type">Тип</Label>
        <Select bind:value={type} items={options}>
          {#each options as option (option.value)}
            <SelectOption value={option.value} label={option.label}>
              {#snippet icon()}
                <option.Icon />
              {/snippet}
              {option.label}
            </SelectOption>
          {/each}
        </Select>
      </Field>
    </div>
  </DialogBody>
  <DialogActions>
    <DialogClose />
    <Button disabled={href.length === 0} onclick={handleConfirm}>Готово</Button>
  </DialogActions>
</Dialog>
