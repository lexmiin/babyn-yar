<script lang="ts">
  import PageHeader from '$components/PageHeader.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import { useTestimonies, useCreateTestimony } from '$lib/content/query'
  import { ContentSchema } from '@babyn-yar/schema'
  import Plus from 'phosphor-svelte/lib/Plus'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import ContentFormSimple from '$components/ContentFormSimple.svelte'

  let isTranslationQueryEnabled = $state(false)
  let translationSearch = $state('')
  let currentLanguage = $state<ContentSchema.FormSimple['lang']>('ua')
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const translations = useTestimonies(() => ({
    title: translationSearch,
    lang: currentLanguage === 'en' ? 'ua' : 'en',
    page_size: 20,
    staleTime: 1000 * 15,
    enabled: isTranslationQueryEnabled
  }))

  const createTestimonyMutation = useCreateTestimony()
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
    translations={translations.data?.testimonies}
    onSubmit={async form => {
      await createTestimonyMutation.mutateAsync(form)
      goto(resolve('/content/victim-testimonies'))
    }}
  />
</Container>
