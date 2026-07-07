<script lang="ts">
  import { UserSchema } from '@babyn-yar/schema'
  import { createForm } from '@tanstack/svelte-form'
  import Button from './Button.svelte'
  import Dialog from './Dialog.svelte'
  import DialogActions from './DialogActions.svelte'
  import DialogBody from './DialogBody.svelte'
  import DialogClose from './DialogClose.svelte'
  import DialogTitle from './DialogTitle.svelte'
  import Field from './Field.svelte'
  import Input from './Input.svelte'
  import Label from './Label.svelte'
  import FieldError from './FieldError.svelte'
  import Description from './Description.svelte'

  type Props = {
    open: boolean
  }

  let { open = $bindable() }: Props = $props()

  const form = createForm(() => ({
    defaultValues: {
      password: ''
    } as UserSchema.ResetPassword,
    validators: {
      onSubmit: UserSchema.ResetPassword
    },
    onSubmit: ({ formApi }) => {
      formApi.reset()
      open = false
    }
  }))

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    form.handleSubmit()
  }
</script>

<Dialog bind:open onClose={() => form.reset()}>
  <DialogTitle>Скинути пароль</DialogTitle>
  <DialogBody>
    <form id="edit-user-form" onsubmit={handleSubmit} class="space-y-5">
      <form.Field name="password">
        {#snippet children(field)}
          <Field class="sm:col-span-2">
            <Label for={field.name}>Новий пароль</Label>
            <Description>Має бути не менше 8 символів</Description>
            <Input
              type="password"
              id={field.name}
              name={field.name}
              value={field.state.value}
              invalid={field.state.meta.errors.length !== 0}
              onblur={() => field.handleBlur()}
              oninput={event => {
                field.handleChange(event.currentTarget.value)
              }}
            />
            {#if field.state.meta.isTouched}
              <!-- eslint-disable-next-line svelte/require-each-key -->
              {#each field.state.meta.errors as error}
                <FieldError>{error?.message}</FieldError>
              {/each}
            {/if}
          </Field>
        {/snippet}
      </form.Field>
    </form>
  </DialogBody>
  <DialogActions>
    <DialogClose />
    <form.Subscribe
      selector={state => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting
      })}
    >
      {#snippet children({ canSubmit, isSubmitting })}
        <Button form="edit-user-form" disabled={!canSubmit}>
          {isSubmitting ? 'Збереження...' : 'Зберегти'}
        </Button>
      {/snippet}
    </form.Subscribe>
  </DialogActions>
</Dialog>
