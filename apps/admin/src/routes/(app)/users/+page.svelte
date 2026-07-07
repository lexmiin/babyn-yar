<script lang="ts">
  import Table from '$components/Table.svelte'
  import TableBody from '$components/TableBody.svelte'
  import TableCell from '$components/TableCell.svelte'
  import TableHead from '$components/TableHead.svelte'
  import TableHeader from '$components/TableHeader.svelte'
  import TableRow from '$components/TableRow.svelte'
  import TableSkeleton from '$components/Skeletons/TableSkeleton.svelte'
  import Dropdown from '$components/Dropdown.svelte'
  import DropdownButton from '$components/DropdownButton.svelte'
  import DropdownMenu from '$components/DropdownMenu.svelte'
  import DropdownItem from '$components/DropdownItem.svelte'
  import PaginationV2 from '$components/PaginationV2.svelte'
  import Button from '$components/Button.svelte'
  import RegisterUserDialog from '$components/RegisterUserDialog.svelte'
  import EditUserDialog from '$components/EditUserDialog.svelte'
  import Alert from '$components/Alert.svelte'
  import AlertTitle from '$components/AlertTitle.svelte'
  import AlertDescription from '$components/AlertDescription.svelte'
  import AlertActions from '$components/AlertActions.svelte'
  import DotsThree from 'phosphor-svelte/lib/DotsThree'
  import Pencil from 'phosphor-svelte/lib/Pencil'
  import Trash from 'phosphor-svelte/lib/Trash'
  import LockOpen from 'phosphor-svelte/lib/LockOpen'
  import { formatDate } from '$lib/format-date'
  import { useUsers, useDeleteUsers } from '$lib/users/query'
  import type { UserSchema } from '@babyn-yar/schema'
  import TableIconCell from '$components/TableIconCell.svelte'
  import ResetPasswordDialog from '$components/ResetPasswordDialog.svelte'
  import { useUserFilters } from '$lib/use-user-filters'
  import { getLoggedUserContext } from '$lib/context'

  let selectedUser: UserSchema.User | undefined = $state()
  let isRegisterDialogOpen = $state(false)
  let isEditDialogOpen = $state(false)
  let isResetPassswrodDialogOpen = $state(false)
  let isAlertOpen = $state(false)
  let filters = useUserFilters()

  const loggedUser = getLoggedUserContext()
  const users = useUsers()
  const deleteUser = useDeleteUsers()

  function handleShowResetPasswordDialog() {
    isResetPassswrodDialogOpen = true
  }

  function handleShowEditDialog(user: UserSchema.User) {
    selectedUser = user
    isEditDialogOpen = true
  }

  function handleShowAlert(user: UserSchema.User) {
    selectedUser = user
    isAlertOpen = true
  }

  function confirmDeletion() {
    if (!selectedUser) return
    deleteUser.mutate([selectedUser.id])
    isAlertOpen = false
    selectedUser = undefined
  }

  function cancelDeletion() {
    selectedUser = undefined
    isAlertOpen = false
  }

  function selectPage(page: number) {
    filters.set(prev => ({ ...prev, page }))
  }
</script>

{#if loggedUser.permissions.includes('admin')}
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8">
      Користувачі
    </h1>
    <Button onclick={() => (isRegisterDialogOpen = true)}>Додати</Button>
  </div>

  <div class="mt-8">
    {#if users.isLoading}
      <TableSkeleton />
    {:else if users.isSuccess}
      <Table>
        <TableHead>
          <TableHeader>Користувачі</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Дозволи</TableHeader>
          <TableHeader>Дата реєстрації</TableHeader>
          <TableHeader class="relative w-0">
            <span class="sr-only">Дії</span>
          </TableHeader>
        </TableHead>
        <TableBody>
          {#each users.data.users as user (user.id)}
            <TableRow>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.permissions.join(', ')}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableIconCell>
                <Dropdown>
                  <DropdownButton plain>
                    {#snippet icon()}
                      <DotsThree />
                    {/snippet}
                  </DropdownButton>
                  <DropdownMenu offset={3}>
                    <DropdownItem onSelect={() => handleShowEditDialog(user)}>
                      {#snippet icon()}
                        <Pencil weight="fill" />
                      {/snippet}
                      Редагувати
                    </DropdownItem>
                    <DropdownItem onSelect={() => handleShowAlert(user)}>
                      {#snippet icon()}
                        <Trash weight="fill" />
                      {/snippet}
                      Видалити
                    </DropdownItem>
                    <DropdownItem
                      onSelect={() => handleShowResetPasswordDialog()}
                    >
                      {#snippet icon()}
                        <LockOpen weight="fill" />
                      {/snippet}
                      Скинути пароль
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableIconCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
      <PaginationV2
        currentPage={users.data.metadata.currentPage}
        totalPages={users.data.metadata.totalRecords}
        perPage={users.data.metadata.pageSize}
        onPageSelect={selectPage}
        class="mt-6"
      />
    {/if}
  </div>

  <RegisterUserDialog bind:open={isRegisterDialogOpen} />
  <ResetPasswordDialog bind:open={isResetPassswrodDialogOpen} />
  {#if selectedUser}
    <EditUserDialog bind:open={isEditDialogOpen} {selectedUser} />
  {/if}

  <Alert bind:open={isAlertOpen}>
    <AlertTitle>Видалення користувачів</AlertTitle>
    <AlertDescription>
      Ви дійсно хочете видалити обраних користувачів? Цю дію неможливо
      скасувати.
    </AlertDescription>
    <AlertActions>
      <Button plain onclick={cancelDeletion}>Скасувати</Button>
      <Button onclick={confirmDeletion} disabled={deleteUser.isPending}>
        Видалити
      </Button>
    </AlertActions>
  </Alert>
{:else}
  <div class="flex h-full flex-col items-center justify-center text-center">
    <h1 class="text-xl font-semibold">У вас не має доступа до цієї сторінки</h1>
    <p class="mt-2 text-gray-400">
      Для доступа до цієї сторіни потрібно мати права адміністратора
    </p>
  </div>
{/if}
