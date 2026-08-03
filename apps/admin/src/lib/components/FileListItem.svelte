<script lang="ts">
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon'
  import VideoCameraIcon from 'phosphor-svelte/lib/VideoCameraIcon'
  import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon'

  type Props = {
    file: File
    fileName: string
    extension: string
    index: number
    onRemove: () => void
    onChange: (fileName: string) => void
  }

  let { file, fileName, extension, index, onRemove, onChange }: Props = $props()

  const fileType = file.type.startsWith('image')
    ? 'image'
    : file.type.startsWith('video')
      ? 'video'
      : 'other'
  const imageUrl = fileType === 'image' ? URL.createObjectURL(file) : undefined

  function handleRemove() {
    onRemove()
  }

  function handleChange(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    onChange(e.currentTarget.value)
  }
</script>

<li
  class="group relative grid w-full grid-cols-[230px_auto] gap-5 rounded-md p-4 hover:bg-gray-50"
>
  <button
    onclick={handleRemove}
    class="absolute top-3 right-3 z-10 hidden items-center justify-center p-1.5 text-gray-400 group-hover:inline-flex hover:text-red-400"
    aria-label="Видалити файл"
  >
    <TrashIcon size={16} />
  </button>
  <div
    class="flex h-[160px] items-center justify-center overflow-hidden rounded-lg bg-gray-100"
  >
    {#if fileType === 'image'}
      <img
        src={imageUrl}
        alt="Файл для завантаження"
        class="max-h-full w-full object-cover"
      />
    {:else if fileType === 'video'}
      <VideoCameraIcon class="h-12 w-12 text-amber-400 lg:h-16 lg:w-16" />
    {:else}
      <FileTextIcon class="h-12 w-12 text-blue-400 lg:h-16  lg:w-16" />
    {/if}
  </div>
  <div class="w-full">
    <div class="mb-2">
      <label for={`asset-name-${index}`} class="relative w-full text-sm">
        <span class="font-semibold">Назва</span>
        <span class="text-red-400">&ast;</span>
      </label>
    </div>
    <div class="flex items-center">
      <input
        id={`asset-name-${index}`}
        type="text"
        value={fileName}
        oninput={handleChange}
        class="w-full rounded-tl-md rounded-bl-md border px-4 py-3 text-sm outline-none hover:border-sky-400"
      />
      <span
        class="rounded-tr-md rounded-br-md border border-l-0 bg-white px-4 py-3 text-sm text-gray-400"
      >
        {extension}
      </span>
    </div>
  </div>
</li>
