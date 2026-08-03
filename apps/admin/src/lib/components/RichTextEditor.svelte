<script lang="ts">
  import EditorCommand from './EditorCommand.svelte'
  import EditorCommandDivider from './EditorCommandDivider.svelte'
  import AssetDialog from './AssetDialog.svelte'
  import YouTubeLinkDialog from './YouTubeLinkDialog.svelte'
  import TextHOneIcon from 'phosphor-svelte/lib/TextHOneIcon'
  import TextHTwoIcon from 'phosphor-svelte/lib/TextHTwoIcon'
  import TextHThreeIcon from 'phosphor-svelte/lib/TextHThreeIcon'
  import ParagraphIcon from 'phosphor-svelte/lib/ParagraphIcon'
  import LinkIcon from 'phosphor-svelte/lib/LinkIcon'
  import LinkBreakIcon from 'phosphor-svelte/lib/LinkBreakIcon'
  import ListBulletsIcon from 'phosphor-svelte/lib/ListBulletsIcon'
  import ListNumbersIcon from 'phosphor-svelte/lib/ListNumbersIcon'
  import TextBIcon from 'phosphor-svelte/lib/TextBIcon'
  import TextItalicIcon from 'phosphor-svelte/lib/TextItalicIcon'
  import TextUnderlineIcon from 'phosphor-svelte/lib/TextUnderlineIcon'
  import TextStrikethroughIcon from 'phosphor-svelte/lib/TextStrikethroughIcon'
  import TextAlignLeftIcon from 'phosphor-svelte/lib/TextAlignLeftIcon'
  import TextAlignCenterIcon from 'phosphor-svelte/lib/TextAlignCenterIcon'
  import TextAlignRightIcon from 'phosphor-svelte/lib/TextAlignRightIcon'
  import ArrowElbowDownLeftIcon from 'phosphor-svelte/lib/ArrowElbowDownLeftIcon'
  import ImageSquareIcon from 'phosphor-svelte/lib/ImageSquareIcon'
  import VideoCameraIcon from 'phosphor-svelte/lib/VideoCameraIcon'
  import YoutubeLogoIcon from 'phosphor-svelte/lib/YoutubeLogoIcon'
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
            <TextHOneIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <TextHTwoIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          >
            <TextHThreeIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
          >
            <ParagraphIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={handleOpenLinkDialog}
            active={editor.isActive('link')}
          >
            <LinkIcon size={16} />
          </EditorCommand>
          {#if editor.isActive('link')}
            <EditorCommand
              onClick={() => editor?.chain().focus().unsetLink().run()}
            >
              <LinkBreakIcon size={16} />
            </EditorCommand>
          {/if}
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <ListBulletsIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListNumbersIcon size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <TextBIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <TextItalicIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <TextUnderlineIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <TextStrikethroughIcon size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <TextAlignLeftIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <TextAlignCenterIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <TextAlignRightIcon size={16} />
          </EditorCommand>
          <EditorCommand
            onClick={() => editor?.chain().focus().setHardBreak().run()}
          >
            <ArrowElbowDownLeftIcon size={16} />
          </EditorCommand>
          <EditorCommandDivider />
          <EditorCommand onClick={handleOpenImageDialog}>
            <ImageSquareIcon size={16} />
          </EditorCommand>
          <EditorCommand onClick={handleOpenVideoDialog}>
            <VideoCameraIcon size={16} />
          </EditorCommand>
          <EditorCommand onClick={handleOpenYouTubeDialog}>
            <YoutubeLogoIcon size={16} />
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
