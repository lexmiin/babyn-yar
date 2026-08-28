import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import YouTube from '@tiptap/extension-youtube'
import { Video } from './video-extension'

export const extensions = [
  StarterKit.configure({
    link: false,
    underline: false,
    heading: {
      HTMLAttributes: {
        class:
          'my-5 font-semibold [div>&]:mt-0 [&:is(h1)]:text-2xl [&:is(h2)]:text-xl [&:is(h3)]:text-lg'
      },
      levels: [1, 2, 3]
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc pl-6 space-y-1 [&_p]:m-0'
      }
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal pl-6 space-y-1 [&_p]:m-0'
      }
    },
    paragraph: {
      HTMLAttributes: {
        class: 'my-4 [div>&]:mt-0'
      }
    }
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right']
  }),
  Underline.configure({
    HTMLAttributes: {
      class: 'underline underline-offset-4'
    }
  }),
  Link.configure({
    HTMLAttributes: {
      class: 'underline text-blue-500'
    },
    openOnClick: false
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-[400px] object-contain my-6 min-h-[120px] w-full rounded-lg'
    }
  }),
  Video.configure({
    HTMLAttributes: {
      class: 'max-w-[400px] min-h-[120px] w-full my-6'
    }
  }),
  YouTube.configure({
    autoplay: false,
    HTMLAttributes: {
      class:
        'max-w-[400px] object-contain my-6 min-h-[120px] !h-auto aspect-video w-full rounded-lg'
    }
  })
]
