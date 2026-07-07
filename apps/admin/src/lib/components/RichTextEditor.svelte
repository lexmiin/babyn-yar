<script lang="ts">
  import EditorCommand from './EditorCommand.svelte'
  import EditorCommandDivider from './EditorCommandDivider.svelte'
  import AssetDialog from './AssetDialog.svelte'
  import YouTubeLinkDialog from './YouTubeLinkDialog.svelte'
  import TextHOne from 'phosphor-svelte/lib/TextHOne'
  import TextHTwo from 'phosphor-svelte/lib/TextHTwo'
  import TextHThree from 'phosphor-svelte/lib/TextHThree'
  import Paragraph from 'phosphor-svelte/lib/Paragraph'
  import Link from 'phosphor-svelte/lib/Link'
  import LinkBreak from 'phosphor-svelte/lib/LinkBreak'
  import ListBullets from 'phosphor-svelte/lib/ListBullets'
  import ListNumbers from 'phosphor-svelte/lib/ListNumbers'
  import TextB from 'phosphor-svelte/lib/TextB'
  import TextItalic from 'phosphor-svelte/lib/TextItalic'
  import TextUnderline from 'phosphor-svelte/lib/TextUnderline'
  import TextStrikethrough from 'phosphor-svelte/lib/TextStrikethrough'
  import TextAlignLeft from 'phosphor-svelte/lib/TextAlignLeft'
  import TextAlignCenter from 'phosphor-svelte/lib/TextAlignCenter'
  import TextAlignRight from 'phosphor-svelte/lib/TextAlignRight'
  import ArrowElbowDownLeft from 'phosphor-svelte/lib/ArrowElbowDownLeft'
  import ImageSquare from 'phosphor-svelte/lib/ImageSquare'
  import VideoCamera from 'phosphor-svelte/lib/VideoCamera'
  import YoutubeLogo from 'phosphor-svelte/lib/YoutubeLogo'
  import { Editor } from '@tiptap/core'
  import { extensions } from '$lib/editor-extensions'
  import { onDestroy, onMount } from 'svelte'
  import { type JSONContent } from '@tiptap/core'
  import LinkDialog from './LinkDialog.svelte'
  import { AssetSchema } from '@babyn-yar/schema'

  type Props = {
    content: JSONContent | undefined
    onChange: (content: JSONContent) => void
  }

  let { content, onChange }: Props = $props()

  let isAssetDialogOpen = $state(false)
  let assetContentType = $state('')

  let isLinkDialogOpen = $state(false)
  let isYoutubeDialogOpen = $state(false)

  let editor: Editor | undefined = $state(undefined)
  let element: HTMLElement | null = $state(null)

  onMount(() => {
    editor = new Editor({
      editorProps: {
        attributes: {
          class: 'outline-none'
        }
      },
      element: element!,
      extensions,
      content: content,
      onUpdate: event => {
        onChange(event.editor.getJSON())
      }
    })
  })

  onDestroy(() => {
    editor?.destroy()
  })

  function handleOpenLinkDialog() {
    isLinkDialogOpen = true
  }

  function handleAddLink(
    link: string,
    type: 'internal' | 'external' | 'email'
  ) {
    if (!link) return
    let href = link
    let target: string | null = null
    if (type === 'email') {
      href = 'mailto:' + href
    } else if (type === 'external') {
      target = '_blank'
    }
    editor?.chain().focus().setLink({ href, target }).run()
    isLinkDialogOpen = false
  }

  function handleOpenVideoDialog() {
    assetContentType = 'video'
    isAssetDialogOpen = true
  }

  function handleOpenImageDialog() {
    isAssetDialogOpen = true
    assetContentType = 'image'
  }

  function handleAddAsset(asset: AssetSchema.Asset) {
    const { url } = asset
    if (assetContentType === 'image') {
      editor?.commands.setImage({ src: url })
    } else {
      editor?.commands.setVideo(url)
    }
    isAssetDialogOpen = false
  }

  function handleOpenYouTubeDialog() {
    isYoutubeDialogOpen = true
  }

  function handleAddYouTubeVideo(link: string) {
    editor?.chain().focus().setYoutubeVideo({ src: link }).run()
    isYoutubeDialogOpen = false
  }
</script>

<span
  data-slot="control"
  class="relative block w-full before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow-sm"
>
  <div
    class="relative isolate rounded-lg border border-zinc-950/10 bg-transparent px-4"
  >
    {#if editor}
      <div
        class="sticky top-0 z-10 -mx-4 mb-3 min-w-full overflow-x-auto rounded-t-lg border-b border-b-zinc-950/10 bg-white"
      >
        <div class="flex items-center gap-1 p-2">
          <EditorCommand
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
          >
            <TextHOne size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <TextHTwo size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          >
            <TextHThree size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
          >
            <Paragraph size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={handleOpenLinkDialog}
            active={editor.isActive('link')}
          >
            <Link size={16} />
          </EditorCommand>
          {#if editor.isActive('link')}
            <EditorCommand
              onClick={() => editor?.chain().focus().unsetLink().run()}
            >
              <LinkBreak size={16} />
            </EditorCommand>
          {/if}
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <ListBullets size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListNumbers size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <TextB size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <TextItalic size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <TextUnderline size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <TextStrikethrough size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <TextAlignLeft size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <TextAlignCenter size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <TextAlignRight size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setHardBreak().run()}
          >
            <ArrowElbowDownLeft size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand onClick={handleOpenImageDialog}>
            <ImageSquare size={16} />
          </EditorCommand>
          <EditorCommand onClick={handleOpenVideoDialog}>
            <VideoCamera size={16} />
          </EditorCommand>
          <EditorCommand onClick={handleOpenYouTubeDialog}>
            <YoutubeLogo size={16} />
          </EditorCommand>
        </div>
      </div>
    {/if}
    <div bind:this={element}></div>
  </div>
</span>

<LinkDialog bind:open={isLinkDialogOpen} onSelect={handleAddLink} />

<AssetDialog
  bind:open={isAssetDialogOpen}
  contentType={assetContentType}
  onSelect={handleAddAsset}
/>

<YouTubeLinkDialog
  bind:open={isYoutubeDialogOpen}
  onSelect={handleAddYouTubeVideo}
/>
