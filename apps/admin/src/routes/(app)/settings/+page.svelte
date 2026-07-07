<script lang="ts">
  import Divider from '$components/Divider.svelte'
  import Field from '$components/Field.svelte'
  import Input from '$components/Input.svelte'
  import FieldError from '$components/FieldError.svelte'
  import Button from '$components/Button.svelte'
  import { ResponseError } from '@babyn-yar/api-utils'
  import { useUpdateSettings } from '$lib/users/query'
  import { UserSchema } from '@babyn-yar/schema'
  import Description from '$components/Description.svelte'
  import { createForm } from '@tanstack/svelte-form'
  import { getLoggedUserContext } from '$lib/context'
  import PageHeader from '$components/PageHeader.svelte'

  const updateSettigs = useUpdateSettings()
  const loggedUser = getLoggedUserContext()

  const form = createForm(() => ({
    defaultValues: {
      fullName: loggedUser.fullName ?? '',
      email: loggedUser.email ?? '',
      password: ''
    } as UserSchema.Settings,
    validators: {
      onSubmit: UserSchema.Settings,
      onBlur: UserSchema.Settings,
      onSubmitAsync: async ({ value }) => {
        try {
          await updateSettigs.mutateAsync(value)
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

<div class="mx-auto max-w-4xl">
  <PageHeader title="Налаштування" />
  <form class="flex flex-col" onsubmit={handleSubmit}>
    <section class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <div class="space-y-1">
        <h2 class="text-base/7 font-semibold text-zinc-950 sm:text-sm/6">
          Повне ім&apos;я
        </h2>
      </div>
      <form.Field name="fullName">
        {#snippet children(field)}
          <Field>
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
    </section>
    <Divider class="my-10" />
    <section class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <div class="space-y-1">
        <h2 class="text-base/7 font-semibold text-zinc-950 sm:text-sm/6">
          Email
        </h2>
      </div>
      <form.Field name="email">
        {#snippet children(field)}
          <Field>
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
    </section>
    <Divider class="my-10" />
    <section class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <div class="space-y-1">
        <h2 class="text-base/7 font-semibold text-zinc-950 sm:text-sm/6">
          Пароль
        </h2>
        <Description>Має бути не менше 8 символів</Description>
      </div>
      <form.Field name="password">
        {#snippet children(field)}
          <Field>
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
    </section>
    <Divider class="my-10" />
    <div class="flex gap-4 self-end">
      <form.Subscribe
        selector={state => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting
        })}
      >
        {#snippet children({ canSubmit, isSubmitting })}
          <Button plain type="button" onclick={() => form.reset()}>
            Скинути
          </Button>
          <Button disabled={!canSubmit}>
            {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        {/snippet}
      </form.Subscribe>
    </div>
  </form>
</div>
