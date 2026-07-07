<script lang="ts">
  import PageHeader from '$components/PageHeader.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import { page } from '$app/state'
  import EditorSkeleton from '$components/Skeletons/EditorSkeleton.svelte'
  import {
    useMediaArticle,
    useMediaArticles,
    useUpdateMediaArticle
  } from '$lib/content/query'
  import ContentFormSimple from '$components/ContentFormSimple.svelte'
  import { ContentSchema } from '@babyn-yar/schema'
  import { toast } from 'svelte-sonner'
  import { trimText } from '$lib/trim-text'

  let id = $derived(page.params.id) as string
  let isTranslationQueryEnabled = $state(false)
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const content = useMediaArticle(() => ({ id }))
  const updateContent = useUpdateMediaArticle(() => ({ id }))

  let translation = $derived(
    content.data?.translation &&
      content.data.article &&
      content.data.translation
      ? content.data.article.lang === 'en'
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
    content.data?.article.lang || 'ua'
  )

  const translations = useMediaArticles(() => ({
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
      success: data => `Запис "${trimText(data.article.title, 20)}" змінено`,
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
      content={content.data?.article}
      selectedTranslation={translation}
      translations={translations.data?.articles}
      onSubmit={handleSubmit}
    />
  {/if}
</Container>
