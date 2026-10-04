<script>
  import Container from '#components/Container.svelte'
  import ContentCard from '#components/ContentCard.svelte'
  import PageHeader from '#components/PageHeader.svelte'

  const links = [
    {
      href: '/content/events',
      text: 'Події'
    },
    {
      href: '/content/library',
      text: 'Бібліотека'
    },
    {
      href: '/content/holocaust-documents',
      text: 'Документи Голокосту'
    },
    {
      href: '/content/victim-testimonies',
      text: 'Свідчення очевидців трагедії'
    },
    {
      href: '/content/media-articles',
      text: 'ЗМІ про заповідник'
    },
    {
      href: '/content/partners',
      text: 'Партнери'
    },
    {
      href: '/content/legal-documents',
      text: 'Документи'
    },
    {
      href: '/content/development-concept',
      text: 'Концепція розвитку'
    },
    {
      href: '/content/gallery',
      text: 'Галерея',
      showCreate: false
    }
  ]
</script>

<PageHeader title="Контент" />

<Container title="Контент">
  <ul class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
    {#each links as { href, text, showCreate } (href)}
      <ContentCard title={text} {href} {showCreate} />
    {/each}
  </ul>
</Container>
