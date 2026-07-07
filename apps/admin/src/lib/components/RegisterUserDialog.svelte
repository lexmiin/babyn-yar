<script lang="ts">
  import { createForm } from '@tanstack/svelte-form'
  import { permissionOptions } from '$lib/select-options'
  import { useRegister } from '$lib/auth/query'
  import { ResponseError } from '@babyn-yar/api-utils'
  import Dialog from './Dialog.svelte'
  import DialogTitle from './DialogTitle.svelte'
  import DialogDescription from './DialogDescription.svelte'
  import Input from './Input.svelte'
  import Field from './Field.svelte'
  import Label from './Label.svelte'
  import InputGroup from './InputGroup.svelte'
  import Lock from 'phosphor-svelte/lib/Lock'
  import SelectOption from './SelectOption.svelte'
  import Select from './Select.svelte'
  import DialogActions from './DialogActions.svelte'
  import DialogBody from './DialogBody.svelte'
  import Button from './Button.svelte'
  import FieldError from './FieldError.svelte'
  import DialogClose from './DialogClose.svelte'
  import Description from './Description.svelte'
  import { UserSchema } from '@babyn-yar/schema'

  type Props = {
    open: boolean
  }

  let { open = $bindable() }: Props = $props()

  const register = useRegister()

  const form = createForm(() => ({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      permission: 'admin'
    } as UserSchema.Register,
    validators: {
      onSubmit: UserSchema.Register,
      onSubmitAsync: async ({ value }) => {
        try {
          await register.mutateAsync(value)
        } catch (error) {
          if (error instanceof ResponseError && error.isFormError()) {
            return { fields: error.formErrors }
          }
        }
      }
    },
    onSubmit: ({ formApi }) => {
      formApi.reset()
      open = false
    }
  }))

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    form.handleSubmit()
  }
</script>

<Dialog bind:open class="sm:max-w-2xl" onClose={open => !open && form.reset()}>
  <DialogTitle>Додати нового користувача</DialogTitle>
  <DialogDescription>
    Зареєструйте нового користувача, вказавши ім'я, адресу електронної пошти,
    пароль та роль. Користувач зможе потім змінити пароль у налаштуваннях.
  </DialogDescription>
  <DialogBody>
    <form id="register-form" onsubmit={handleSubmit} class="space-y-6">
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
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-3">
        <form.Field name="password">
          {#snippet children(field)}
            <Field class="sm:col-span-2">
              <Label for={field.name}>Пароль</Label>
              <Description>Має бути не менше 8 символів</Description>
              <InputGroup>
                <Lock size={20} />
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
              </InputGroup>
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
              <div
                data-slot="description"
                class="mt-1 hidden h-[1lh] w-full sm:block"
              ></div>
              <Label for={field.name}>Доступ</Label>
              <Select
                items={permissionOptions}
                value={field.state.value}
                placeholder="Обрати роль&hellip;"
                invalid={field.state.meta.errors.length !== 0}
                onSelect={value => {
                  field.handleChange(value)
                }}
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
      </div>
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
          form="register-form"
          isLoading={isSubmitting}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Завантаження...' : 'Зареєструвати'}
        </Button>
      {/snippet}
    </form.Subscribe>
  </DialogActions>
</Dialog>
