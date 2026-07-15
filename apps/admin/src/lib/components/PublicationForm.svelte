<script lang="ts">
  import CoverSelect from '$components/CoverSelect.svelte'
  import Input from '$components/Input.svelte'
  import RichTextEditor from '$components/RichTextEditor.svelte'
  import Field from '$components/Field.svelte'
  import Label from '$components/Label.svelte'
  import Select from '$components/Select.svelte'
  import SelectOption from '$components/SelectOption.svelte'
  import FieldError from '$components/FieldError.svelte'
  import DocumentsSelect from '$components/DocumentsSelect.svelte'
  import DatePickerCalendar from './DatePickerCalendar.svelte'
  import { createForm } from '@tanstack/svelte-form'
  import Combobox from '$components/Combobox.svelte'
  import ComboboxOption from '$components/ComboboxOption.svelte'
  import ComboboxLabel from '$components/ComboboxLabel.svelte'
  import {
    PublicationForm as PublicationFormSchema,
    type EligiblePublication,
    type PublicationForm
  } from '$lib/publications/schema'

  type PublicationFormContent = Omit<PublicationForm, 'selectedPublication'>

  type Props = {
    content?: PublicationFormContent
    eligiblePublications?: EligiblePublication[]
    currentLocale: PublicationForm['locale']
    isTranslationOpen: boolean
    isSubmitting: boolean
    canSubmit: boolean
    searchTerm: string
    showTranslationSelector?: boolean
    languageDisabled?: boolean
    translationDateNotice?: string
    onSubmit: (form: PublicationForm) => void
  }

  let {
    content,
    eligiblePublications,
    currentLocale = $bindable(),
    isTranslationOpen = $bindable(),
    searchTerm = $bindable(''),
    isSubmitting = $bindable(),
    canSubmit = $bindable(),
    showTranslationSelector = true,
    languageDisabled = false,
    translationDateNotice,
    onSubmit
  }: Props = $props()

  let form = createForm(() => ({
    defaultValues: {
      title: content?.title ?? '',
      occurredOn: content?.occurredOn ?? new Date().toISOString(),
      description: content?.description ?? '',
      locale: content?.locale ?? 'uk',
      cover: content?.cover ?? '',
      documents: content?.documents ?? [],
      content: content?.content ?? undefined,
      selectedPublication: undefined
    } as PublicationForm,
    validators: {
      onSubmit: PublicationFormSchema
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    }
  }))

  let isSubmitting_ = form.useStore(state => state.isSubmitting)
  let canSubmit_ = form.useStore(state => state.canSubmit)

  $effect(() => {
    canSubmit = canSubmit_.current
  })

  $effect(() => {
    isSubmitting = isSubmitting_.current
  })

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    form.handleSubmit()
  }
</script>

<form onsubmit={handleSubmit} id="record-form" class="space-y-5">
  <form.Field name="title">
    {#snippet children(field)}
      <Field class="sm:col-span-2">
        <Label for={field.name}>Назва</Label>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          invalid={field.state.meta.errors.length !== 0}
          onblur={field.handleBlur}
          oninput={e => {
            const input = e.target as HTMLInputElement
            field.handleChange(input.value)
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
  <div class="grid grid-cols-1 gap-8 sm:grid-cols-4">
    <form.Field name="locale">
      {#snippet children(field)}
        <Field disabled={languageDisabled}>
          <Label for={field.name}>Мова</Label>
          <Select
            id={field.name}
            value={field.state.value}
            invalid={field.state.meta.errors.length !== 0}
            onSelect={value => {
              field.handleChange(value)
              currentLocale = value
              form.setFieldValue('selectedPublication', undefined)
            }}
            items={[
              { value: 'uk', label: 'Українська' },
              { value: 'en', label: 'Англійська' }
            ]}
          >
            <SelectOption value="uk" label="Українська">Українська</SelectOption
            >
            <SelectOption value="en" label="Англійська">Англійська</SelectOption
            >
          </Select>
          {#if field.state.meta.isTouched}
            {#each field.state.meta.errors as error}
              <FieldError>{error?.message}</FieldError>
            {/each}
          {/if}
        </Field>
      {/snippet}
    </form.Field>
    <form.Field name="occurredOn">
      {#snippet children(field)}
        <Field>
          <Label for={field.name}>Дата</Label>
          <DatePickerCalendar
            id={field.name}
            value={field.state.value}
            onChange={date => {
              if (date) field.handleChange(date.toString())
            }}
          />
        </Field>
      {/snippet}
    </form.Field>
    {#if showTranslationSelector}
      <form.Field name="selectedPublication">
        {#snippet children(field)}
          <Field class="sm:col-span-2">
            <Label for={field.name}>Переклад</Label>
            <Combobox
              id={field.name}
              value={field.state.value}
              options={eligiblePublications ?? []}
              invalid={field.state.meta.errors.length !== 0}
              onOpenChange={open => (isTranslationOpen = open)}
              onChange={selectedPublication => {
                field.handleChange(selectedPublication)
                if (selectedPublication?.occurredOn) {
                  form.setFieldValue(
                    'occurredOn',
                    selectedPublication.occurredOn
                  )
                }
              }}
              onSearch={term => (searchTerm = term)}
              getValue={t => String(t.id)}
              displayValue={t => t.title}
            >
              {#snippet children(option)}
                <ComboboxOption value={option}>
                  <ComboboxLabel>{option.title}</ComboboxLabel>
                </ComboboxOption>
              {/snippet}
            </Combobox>
            {#if field.state.value && translationDateNotice}
              <p class="mt-2 text-sm text-zinc-600">{translationDateNotice}</p>
            {/if}
          </Field>
        {/snippet}
      </form.Field>
    {/if}
  </div>
  <form.Field name="description">
    {#snippet children(field)}
      <Field>
        <Label for={field.name}>Опис</Label>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          invalid={field.state.meta.errors.length !== 0}
          onblur={field.handleBlur}
          oninput={e => {
            const input = e.target as HTMLInputElement
            field.handleChange(input.value)
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
  <form.Field name="documents">
    {#snippet children(field)}
      <Field>
        <Label for={field.name}>Долучення</Label>
        <DocumentsSelect
          id={field.name}
          documents={field.state.value}
          onRemove={url => {
            const docs = field.state.value
            const filtered = docs.filter(d => d !== url)
            field.handleChange([...filtered])
          }}
          onSelect={url => {
            const docs = field.state.value
            field.handleChange([...docs, url])
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
  <form.Field name="cover">
    {#snippet children(field)}
      <Field>
        <Label for={field.name}>Обкладинка</Label>
        <CoverSelect
          id={field.name}
          cover={field.state.value}
          invalid={field.state.meta.errors.length !== 0}
          onSelect={url => {
            field.handleChange(url)
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
  <form.Field name="content">
    {#snippet children(field)}
      <Field>
        <RichTextEditor
          content={field.state.value}
          onChange={content => field.handleChange(content)}
        />
      </Field>
    {/snippet}
  </form.Field>
</form>
