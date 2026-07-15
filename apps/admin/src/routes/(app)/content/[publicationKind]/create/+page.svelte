<script lang="ts">
  import { goto } from '$app/navigation'
  import Button from '$components/Button.svelte'
  import Container from '$components/Container.svelte'
  import PageHeader from '$components/PageHeader.svelte'
  import PublicationForm from '$components/PublicationForm.svelte'
  import {
    useCreatePublication,
    useEligiblePublications
  } from '$lib/publications/query'
  import type { PublicationRoute } from '$lib/publications/routes'
  import { PublicationSchema } from '@babyn-yar/schema'
  import Plus from 'phosphor-svelte/lib/Plus'

  type Props = {
    data: {
      publicationRoute: PublicationRoute
      publicationSlug: string
    }
  }

  let { data }: Props = $props()
  let isTranslationQueryEnabled = $state(false)
  let translationSearch = $state('')
  let currentLocale = $state<PublicationSchema.Locale>('uk')
  let canSubmit = $state(true)
  let isSubmitting = $state(false)

  const eligiblePublications = useEligiblePublications(
    () => data.publicationRoute.kind,
    () => ({
      title: translationSearch,
      locale: currentLocale,
      staleTime: 1000 * 15,
      enabled: isTranslationQueryEnabled
    })
  )
  const createPublication = useCreatePublication(
    () => data.publicationRoute.kind
  )
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
  <PublicationForm
    bind:searchTerm={translationSearch}
    bind:currentLocale
    bind:isTranslationOpen={isTranslationQueryEnabled}
    bind:isSubmitting
    bind:canSubmit
    eligiblePublications={eligiblePublications.data?.publications}
    translationDateNotice="Зміна дати оновить усі переклади цієї публікації."
    onSubmit={async form => {
      await createPublication.mutateAsync(form)
      goto(`/content/${data.publicationSlug}`)
    }}
  />
</Container>
