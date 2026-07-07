<script lang="ts">
  import Button from '$components/Button.svelte'
  import Field from '$components/Field.svelte'
  import Label from '$components/Label.svelte'
  import Input from '$components/Input.svelte'
  import FieldError from '$components/FieldError.svelte'
  import { useLoggedUser, useLogin } from '$lib/auth/query'
  import { UserSchema } from '@babyn-yar/schema'
  import { createForm } from '@tanstack/svelte-form'
  import { ResponseError } from '@babyn-yar/api-utils'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'

  const login = useLogin()
  const loggedUser = useLoggedUser()

  const form = createForm(() => ({
    defaultValues: {
      email: '',
      password: ''
    } as UserSchema.Login,
    validators: {
      onSubmit: UserSchema.Login,
      onSubmitAsync: async ({ value }) => {
        try {
          await login.mutateAsync(value)
          await loggedUser.refetch()
          goto(resolve('/content'))
        } catch (error) {
          if (error instanceof ResponseError && error.isFormError()) {
            return { fields: error.formErrors }
          }
        }
      }
    }
  }))

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    form.handleSubmit()
  }
</script>

<div class="flex w-full flex-col justify-center bg-white">
  <div class="px-6 py-12 lg:p-6">
    <div class="mx-auto w-full max-w-md">
      <h1 class="mb-8 text-center text-2xl/8 font-semibold sm:text-xl/8">
        Увійдіть у свій обліковий запис
      </h1>
      <form onsubmit={handleSubmit} class="flex flex-col gap-6">
        <form.Field name="email">
          {#snippet children(field)}
            <Field>
              <Label for={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                invalid={field.state.meta.errors.length !== 0}
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
        <form.Field name="password">
          {#snippet children(field)}
            <Field>
              <Label for="password">Пароль</Label>
              <Input
                id={field.name}
                type={field.name}
                value={field.state.value}
                invalid={field.state.meta.errors.length !== 0}
                oninput={event => {
                  field.handleChange(event.currentTarget.value)
                }}
              />
              {#if field.state.meta.isTouched}
                {#each field.state.meta.errors as error}
                  <FieldError>{error?.message}</FieldError>
                {/each}
              {/if}
            </Field>
          {/snippet}
        </form.Field>
        <Button disabled={login.isPending}>Продовжити</Button>
      </form>
    </div>
  </div>
</div>
