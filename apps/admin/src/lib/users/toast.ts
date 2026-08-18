import { toast } from 'svelte-sonner'

export const userToasts = {
  editUserSuccess: () =>
    toast.success('Зміни збережено', {
      description: 'Дані користувача було оновлено'
    }),
  editUserError: () =>
    toast.error('Зміни не збережено', {
      description: 'Не вдалося оновити дані користувача'
    }),
  updateSettingsSuccess: () =>
    toast.success('Зміни збережено', {
      description: 'Ваші налаштування було збережено'
    }),
  updateSettingsError: () =>
    toast.error('Зміни не збережено', {
      description: 'Не вдалося зберегти ваші налаштування'
    }),
  deleteUserSuccess: () =>
    toast.success('Операція успішна', {
      description: 'Користувача було видалено'
    }),
  deleteUserError: () =>
    toast.error('Виникла помилка', {
      description: 'Не вдалося видалити користувача. Спробуйте ще раз.'
    }),
  resetPasswordSuccess: () =>
    toast.success('Пароль змінено', {
      description: 'Новий пароль користувача збережено'
    }),
  resetPasswordError: () =>
    toast.error('Пароль не змінено', {
      description: 'Не вдалося змінити пароль. Спробуйте ще раз.'
    })
}
