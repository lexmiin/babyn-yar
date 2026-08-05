<script lang="ts">
  import { permissionOptions } from '$lib/select-options'
  import { UserSchema } from '@babyn-yar/schema'
  import { ResponseError } from '@babyn-yar/api-utils'
  import { useEditUser } from '$lib/users/query'
  import { createForm } from '@tanstack/svelte-form'
  import { untrack } from 'svelte'
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

  const editUser = useEditUser()

  function valuesFor(user: UserSchema.User): UserSchema.Edit {
    return {
      fullName: user.fullName,
      email: user.email,
      permission: user.permissions.includes('admin') ? 'admin' : 'publisher'
    }
  }

  const form = createForm(() => ({
    defaultValues: valuesFor(selectedUser),
    validators: {
      onSubmit: UserSchema.Edit,
      onSubmitAsync: async ({ value }) => {
        try {
          await editUser.mutateAsync({ userId: selectedUser.id, input: value })
        } catch (error) {
          if (error instanceof ResponseError && error.isFormError()) {
            return { fields: error.formErrors }
          }
          throw error
        }
      }
    },
    onSubmit: ({ formApi }) => {
      formApi.reset()
      open = false
    }
  }))

  $effect(() => {
    if (open) {
      const values = valuesFor(selectedUser)
      untrack(() => form.reset(values))
    }
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    form.handleSubmit()
  }
</script>

<Dialog bind:open onClose={isOpen => !isOpen && form.reset()}>
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
