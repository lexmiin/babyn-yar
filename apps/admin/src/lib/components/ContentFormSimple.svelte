<script lang="ts">
  import CoverSelect from '$components/CoverSelect.svelte'
  import Input from '$components/Input.svelte'
  import RichTextEditor from '$components/RichTextEditor.svelte'
  import Field from '$components/Field.svelte'
  import Label from '$components/Label.svelte'
  import Select from '$components/Select.svelte'
  import SelectOption from '$components/SelectOption.svelte'
  import FieldError from '$components/FieldError.svelte'
  import DatePickerCalendar from './DatePickerCalendar.svelte'
  import { createForm } from '@tanstack/svelte-form'
  import { ContentSchema } from '@babyn-yar/schema'
  import Combobox from '$components/Combobox.svelte'
  import ComboboxOption from '$components/ComboboxOption.svelte'
  import ComboboxLabel from '$components/ComboboxLabel.svelte'

  type ContentWithoutTranslation = Omit<ContentSchema.Content, 'translation'>

  type Props = {
    content?: ContentWithoutTranslation
    selectedTranslation?: ContentSchema.FormSimple['translation']
    translations?: ContentSchema.Content[]
    currentLanguage: ContentSchema.FormSimple['lang']
    isTranslationOpen: boolean
    isSubmitting: boolean
    canSubmit: boolean
    searchTerm: string
    onSubmit: (form: ContentSchema.FormSimple) => void
  }

  let {
    content,
    selectedTranslation,
    translations,
    currentLanguage = $bindable(),
    isTranslationOpen = $bindable(),
    searchTerm = $bindable(''),
    isSubmitting = $bindable(),
    canSubmit = $bindable(),
    onSubmit
  }: Props = $props()

  let form = createForm(() => ({
    defaultValues: {
      title: content?.title ?? '',
      occuredOn: content?.occuredOn ?? new Date().toISOString(),
      description: content?.description ?? '',
      lang: content?.lang ?? 'ua',
      cover: content?.cover ?? '',
      content: content?.content ?? undefined,
      translation: selectedTranslation ?? undefined
    } as ContentSchema.FormSimple,
    validators: {
      onSubmit: ContentSchema.FormSimple
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
    <form.Field name="lang">
      {#snippet children(field)}
        <Field>
          <Label for={field.name}>Мова</Label>
          <Select
            id={field.name}
            value={field.state.value}
            invalid={field.state.meta.errors.length !== 0}
            onSelect={value => {
              field.handleChange(value)
              currentLanguage = value
            }}
            items={[
              { value: 'ua', label: 'Українська' },
              { value: 'en', label: 'Англійська' }
            ]}
          >
            <SelectOption value="ua" label="Українська">Українська</SelectOption
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
    <form.Field name="occuredOn">
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
    <form.Field name="translation">
      {#snippet children(field)}
        <Field class="sm:col-span-2">
          <Label for={field.name}>Переклад</Label>
          <Combobox
            id={field.name}
            value={field.state.value}
            options={translations || []}
            invalid={field.state.meta.errors.length !== 0}
            onOpenChange={open => (isTranslationOpen = open)}
            onChange={t => field.handleChange(t)}
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
        </Field>
      {/snippet}
    </form.Field>
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
