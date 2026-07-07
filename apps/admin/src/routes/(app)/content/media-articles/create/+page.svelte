<script lang="ts">
  import PageHeader from '$components/PageHeader.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import { useMediaArticles, useCreateMediaArticle } from '$lib/content/query'
  import ContentFormSimple from '$components/ContentFormSimple.svelte'
  import { ContentSchema } from '@babyn-yar/schema'
  import Plus from 'phosphor-svelte/lib/Plus'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'

  let isTranslationQueryEnabled = $state(false)
  let translationSearch = $state('')
  let currentLanguage = $state<ContentSchema.FormSimple['lang']>('ua')
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const translations = useMediaArticles(() => ({
    title: translationSearch,
    lang: currentLanguage === 'en' ? 'ua' : 'en',
    page_size: 20,
    staleTime: 1000 * 15,
    enabled: isTranslationQueryEnabled
  }))

  const createMediaArticleMutation = useCreateMediaArticle()
</script>

<PageHeader title="Новий запис">
  <Button disabled={!canSubmit || isSubmitting} form="record-form">
    {#snippet icon()}
      <Plus size={16} />
    {/snippet}
    Створити
  </Button>
</PageHeader>
<Container title="Створити запис">
  <ContentFormSimple
    bind:searchTerm={translationSearch}
    bind:currentLanguage
    bind:isTranslationOpen={isTranslationQueryEnabled}
    bind:isSubmitting
    bind:canSubmit
    translations={translations.data?.articles}
    onSubmit={async form => {
      await createMediaArticleMutation.mutateAsync(form)
      goto(resolve('/content/media-articles'))
    }}
  />
</Container>
