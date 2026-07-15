<script>
  import { resolve } from '$app/paths'
  import Button from './Button.svelte'
</script>

<svelte:head>
  <title>404 | Сторінку не знайдено</title>
</svelte:head>

<div class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
  <div class="text-center">
    <p class="text-base font-semibold text-blue-600">404</p>
    <h1
      class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
    >
      Сторінку не знайдено
    </h1>
    <p class="mt-6 text-base leading-7 text-gray-600">
      На жаль, нам не вдалося знайти сторінку, яку ви шукаєте.
    </p>
    <div class="mt-10 flex items-center justify-center gap-x-6">
      <Button href={resolve('/content')}>Повернутися додому</Button>
    </div>
  </div>
</div>
