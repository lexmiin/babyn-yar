<script>
  import SidebarLink from './SidebarLink.svelte'
  import ImageIcon from 'phosphor-svelte/lib/ImageIcon'
  import FilesIcon from 'phosphor-svelte/lib/FilesIcon'
  import UsersIcon from 'phosphor-svelte/lib/UsersIcon'
  import GearSixIcon from 'phosphor-svelte/lib/GearSixIcon'
  import { getLoggedUserContext } from '$lib/context'

  const loggedUser = getLoggedUserContext()
</script>

<nav class="flex h-full min-h-0 flex-col">
  <div class="flex flex-1 flex-col overflow-y-auto p-4">
    <div class="flex flex-col gap-0.5">
      <SidebarLink href="/content">
        {#snippet icon()}
          <FilesIcon weight="fill" />
        {/snippet}
        Контент
      </SidebarLink>
      <SidebarLink href="/assets">
        {#snippet icon()}
          <ImageIcon weight="fill" />
        {/snippet}
        Медіа файли
      </SidebarLink>
      {#if loggedUser.permissions.includes('admin')}
        <SidebarLink href="/users">
          {#snippet icon()}
            <UsersIcon weight="fill" />
          {/snippet}
          Користувачі
        </SidebarLink>
      {/if}
      <SidebarLink href="/settings">
        {#snippet icon()}
          <GearSixIcon weight="fill" />
        {/snippet}
        Налаштування
      </SidebarLink>
    </div>
  </div>
</nav>
