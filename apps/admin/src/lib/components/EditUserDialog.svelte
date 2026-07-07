<script lang="ts">
  import { permissionOptions } from '$lib/select-options'
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
  import Select from './Select.svelte'
  import SelectOption from './SelectOption.svelte'
  import FieldError from './FieldError.svelte'

  type Props = {
    open: boolean
    selectedUser: UserSchema.User
  }

  let { open = $bindable(), selectedUser }: Props = $props()

  const form = createForm(() => ({
    defaultValues: {
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      permission: selectedUser.permissions[0]
    } as UserSchema.Edit,
    validators: {
      onSubmit: UserSchema.Edit
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
  <DialogTitle>Редагування користувача</DialogTitle>
  <DialogBody>
    <form id="edit-user-form" onsubmit={handleSubmit} class="space-y-5">
      <form.Field name="fullName">
        {#snippet children(field)}
          <Field>
            <Label for={field.name}>Повне ім&apos;я</Label>
            <Input
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
      <form.Field name="email">
        {#snippet children(field)}
          <Field>
            <Label for={field.name}>Email</Label>
            <Input
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
      <form.Field name="permission">
        {#snippet children(field)}
          <Field>
            <Label for={field.name}>Дозвіл</Label>
            <Select
              items={permissionOptions}
              value={field.state.value}
              invalid={field.state.meta.errors.length !== 0}
              onSelect={value => {
                field.handleChange(value as 'admin' | 'publisher')
              }}
              class="sm:w-44"
            >
              {#each permissionOptions as option (option.value)}
                <SelectOption {...option}>{option.label}</SelectOption>
              {/each}
            </Select>
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
        <Button
          form="edit-user-form"
          disabled={!canSubmit}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Збереження...' : 'Зберегти'}
        </Button>
      {/snippet}
    </form.Subscribe>
  </DialogActions>
</Dialog>
