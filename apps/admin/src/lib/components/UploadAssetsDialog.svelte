<script lang="ts">
  import Dialog from './Dialog.svelte'
  import DialogTitle from './DialogTitle.svelte'
  import DialogDescription from './DialogDescription.svelte'
  import DialogBody from './DialogBody.svelte'
  import DialogActions from './DialogActions.svelte'
  import Button from './Button.svelte'
  import Input from './Input.svelte'
  import FileListItem from './FileListItem.svelte'
  import Field from './Field.svelte'
  import Label from './Label.svelte'
  import Description from './Description.svelte'
  import { useUploadAssets } from '$lib/assets/query'
  import Code from './Code.svelte'
  import { toast } from 'svelte-sonner'
  import { ResponseError } from '@babyn-yar/api-utils'
  import { AssetSchema } from '@babyn-yar/schema'
  import { createForm } from '@tanstack/svelte-form'

  type Props = {
    open: boolean
  }

  let { open = $bindable() }: Props = $props()
  let fileInput: HTMLInputElement | null = $state(null)
  const uploadAssets = useUploadAssets()

  const form = createForm(() => ({
    defaultValues: {
      prefix: '',
      files: []
    } as AssetSchema.Form,
    validators: {
      onSubmit: AssetSchema.Form
    },
    defaultState: {
      canSubmit: true
    },
    onSubmit: async ({ value }) => {
      const promise = uploadAssets.mutateAsync(value)
      toast.promise(promise, {
        loading: 'Завантаження',
        success: data => `${data.assets.length} файл(ів) було завантажено`,
        error: error => {
          let toastMessage = 'Спробуйте, будь ласка, ще раз'
          if (error instanceof ResponseError && error.isFormError()) {
            const existingFiles = Object.keys(error.error).map(f => `'${f}'`)
            toastMessage = `Файли вже існують: ${existingFiles.join(', ')}`
          }
          return toastMessage
        }
      })
      try {
        await promise
        open = false
      } catch (error) {
        console.error(error)
      }
    }
  }))

  // NOTE: defaultState.canSubmit doesn't work in @tanstack/form
  // we manually check if files were added for upload to disable the button
  const files = form.useStore(state => state.values.files)
  const isFilesEmpty = $derived(files.current.length === 0)

  function handleClose() {
    form.reset()
  }

  function addFiles(e: Event) {
    const input = e.target as HTMLInputElement

    if (!input.files || input.files.length === 0) return

    Array.from(input.files).forEach(file => {
      const nameParts = file.name.split('.')
      const extension = nameParts.pop() || ''
      const baseName = nameParts.join('.')
      form.pushFieldValue('files', {
        file,
        extension,
        fileName: baseName
      })
    })
  }

  function openFileBrowser() {
    if (!fileInput) return
    fileInput.click()
  }

  function handleSubmit() {
    form.handleSubmit()
  }
</script>

<Dialog bind:open onClose={handleClose} class="sm:max-w-2xl">
  <DialogTitle>Завантажити файли</DialogTitle>
  <DialogDescription>
    Для вибору декількох файлів одночасно, утримуйте <Code>Ctrl</Code>
    (або <Code>⌘</Code> на MacOS) під час натискання на файли.
  </DialogDescription>

  <DialogBody>
    <Field class="mb-5">
      <Label for="filePrefix">Префікс</Label>
      <Description>
        Можна використовувати для організації файлів, що полегшить їх пошук
      </Description>
      <form.Field name="prefix">
        {#snippet children(field)}
          <Input
            value={field.state.value}
            id={field.name}
            oninput={e =>
              field.handleChange((e.target as HTMLInputElement).value)}
          />
        {/snippet}
      </form.Field>
    </Field>

    <form.Field name="files" mode="array">
      {#snippet children(field)}
        <ul class="max-h-[400px] overflow-y-auto">
          {#each field.state.value as file, index (index)}
            <form.Field name={`files[${index}].fileName`}>
              {#snippet children(subfield)}
                <FileListItem
                  {index}
                  file={file.file}
                  extension={file.extension}
                  fileName={file.fileName}
                  onRemove={() => field.removeValue(index)}
                  onChange={fileName => subfield.handleChange(fileName)}
                />
              {/snippet}
            </form.Field>
          {/each}
        </ul>
      {/snippet}
    </form.Field>
  </DialogBody>

  <DialogActions>
    <input
      bind:this={fileInput}
      type="file"
      hidden
      multiple
      onchange={addFiles}
    />
    <Button plain disabled={uploadAssets.isPending} onclick={openFileBrowser}>
      Додати файл
    </Button>
    <form.Subscribe
      selector={state => ({
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit
      })}
    >
      {#snippet children({ isSubmitting, canSubmit })}
        <Button
          disabled={isSubmitting || !canSubmit || isFilesEmpty}
          onclick={handleSubmit}
        >
          Завантажити
        </Button>
      {/snippet}
    </form.Subscribe>
  </DialogActions>
</Dialog>
