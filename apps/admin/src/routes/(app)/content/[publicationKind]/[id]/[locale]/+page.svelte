<script lang="ts">
  import { page } from '$app/state'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import PageHeader from '$components/PageHeader.svelte'
  import PublicationForm from '$components/PublicationForm.svelte'
  import EditorSkeleton from '$components/Skeletons/EditorSkeleton.svelte'
  import { usePublication, useUpdatePublication } from '$lib/publications/query'
  import type { PublicationRoute } from '$lib/publications/routes'
  import type { PublicationForm as PublicationFormValue } from '$lib/publications/schema'
  import { trimText } from '$lib/trim-text'
  import { PublicationSchema } from '@babyn-yar/schema'
  import { toast } from 'svelte-sonner'
  import * as v from 'valibot'

  type Props = {
    data: {
      publicationRoute: PublicationRoute
    }
  }

  let { data }: Props = $props()
  let id = $derived(page.params.id) as string
  let locale = $derived(v.parse(PublicationSchema.Locale, page.params.locale))
  let isTranslationQueryEnabled = $state(false)
  let translationSearch = $state('')
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const content = usePublication(
    () => data.publicationRoute.kind,
    () => ({ id, locale })
  )
  const updateContent = useUpdatePublication(
    () => data.publicationRoute.kind,
    () => ({
      id,
      locale,
      publicationVersion: content.data?.publication.publicationVersion ?? 0
    })
  )

  let currentLocale = $derived(locale)
  let formContent = $derived(
    content.data?.publication
      ? {
          title: content.data.publication.title,
          occurredOn: content.data.publication.occurredOn,
          description: content.data.publication.description,
          locale: currentLocale,
          cover: content.data.publication.cover,
          documents: content.data.publication.documents,
          content: content.data.publication.content
        }
      : undefined
  )

  async function handleSubmit(form: PublicationFormValue) {
    const promise = updateContent.mutateAsync(form)
    toast.promise(promise, {
      loading: 'Loading...',
      success: data =>
        `Запис "${trimText(data.publication.title, 20)}" змінено`,
      error: 'Помилка'
    })
    try {
      await promise
    } catch (error) {
      console.error(error)
    }
  }
</script>

<PageHeader title="Редагування запису">
  <Button disabled={!canSubmit || isSubmitting} form="record-form">
    Зберегти зміни
  </Button>
</PageHeader>
<Container title="Редагувати запис">
  {#if content.isLoading}
    <EditorSkeleton />
  {:else}
    <PublicationForm
      bind:searchTerm={translationSearch}
      bind:currentLocale
      bind:isTranslationOpen={isTranslationQueryEnabled}
      bind:isSubmitting
      bind:canSubmit
      content={formContent}
      languageDisabled
      showTranslationSelector={false}
      onSubmit={handleSubmit}
    />
  {/if}
</Container>
