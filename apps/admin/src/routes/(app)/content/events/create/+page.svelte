<script lang="ts">
  import PageHeader from '$components/PageHeader.svelte'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import { useEvents, useCreateEvent } from '$lib/content/query'
  import ContentForm from '$components/ContentForm.svelte'
  import { ContentSchema } from '@babyn-yar/schema'
  import Plus from 'phosphor-svelte/lib/Plus'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'

  let isTranslationQueryEnabled = $state(false)
  let translationSearch = $state('')
  let currentLanguage = $state<ContentSchema.Form['lang']>('ua')
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const translations = useEvents(() => ({
    title: translationSearch,
    lang: currentLanguage === 'en' ? 'ua' : 'en',
    page_size: 20,
    staleTime: 1000 * 15,
    enabled: isTranslationQueryEnabled
  }))

  const createEvent = useCreateEvent()
</script>

<PageHeader title="Новий запис">
  <Button disabled={!canSubmit || isSubmitting} form="record-form">
    {#snippet icon()}
      <Plus size={16} />
    {/snippet}
    Cтворити
  </Button>
</PageHeader>
<Container title="Створити запис">
  <ContentForm
    bind:searchTerm={translationSearch}
    bind:currentLanguage
    bind:isTranslationOpen={isTranslationQueryEnabled}
    bind:isSubmitting
    bind:canSubmit
    translations={translations.data?.events}
    onSubmit={async form => {
      await createEvent.mutateAsync(form)
      goto(resolve('/content/events'))
    }}
  />
</Container>
