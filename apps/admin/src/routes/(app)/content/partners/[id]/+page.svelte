<script lang="ts">
  import PageHeader from '$components/PageHeader.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import { page } from '$app/state'
  import EditorSkeleton from '$components/Skeletons/EditorSkeleton.svelte'
  import { usePartner, usePartners, useUpdatePartner } from '$lib/content/query'
  import ContentFormSimple from '$components/ContentFormSimple.svelte'
  import { ContentSchema } from '@babyn-yar/schema'
  import { toast } from 'svelte-sonner'
  import { trimText } from '$lib/trim-text'

  let id = $derived(page.params.id) as string
  let isTranslationQueryEnabled = $state(false)
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const content = usePartner(() => ({ id }))
  const updateContent = useUpdatePartner(() => ({ id }))

  let translation = $derived(
    content.data?.translation &&
      content.data.partner &&
      content.data.translation
      ? content.data.partner.lang === 'en'
        ? {
            id: content.data.translation.ukrainianId,
            title: content.data.translation.ukrainianTitle
          }
        : {
            id: content.data.translation.englishId,
            title: content.data.translation.englishTitle
          }
      : undefined
  )

  let translationSearch = $derived(translation?.title || '')
  let currentLanguage = $derived<'ua' | 'en'>(
    content.data?.partner.lang || 'ua'
  )

  const translations = usePartners(() => ({
    title: translationSearch,
    lang: currentLanguage === 'en' ? 'ua' : 'en',
    page_size: 20,
    staleTime: 1000 * 15,
    enabled: isTranslationQueryEnabled
  }))

  async function handleSubmit(form: ContentSchema.FormSimple) {
    const promise = updateContent.mutateAsync(form)
    toast.promise(promise, {
      loading: 'Loading...',
      success: data => `Запис "${trimText(data.partner.title, 20)}" змінено`,
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
    <ContentFormSimple
      bind:searchTerm={translationSearch}
      bind:currentLanguage
      bind:isTranslationOpen={isTranslationQueryEnabled}
      bind:isSubmitting
      bind:canSubmit
      content={content.data?.partner}
      selectedTranslation={translation}
      translations={translations.data?.partners}
      onSubmit={handleSubmit}
    />
  {/if}
</Container>
