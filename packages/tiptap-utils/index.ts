import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import YouTube from '@tiptap/extension-youtube'
import { Video } from './video'
import { generateHTML as tipTapGenerateHTML } from '@tiptap/html'

export const extensions = [
  StarterKit,
  Link,
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  YouTube,
  Image,
  Underline,
  Video
]

export function generateHTML(json: any) {
  return tipTapGenerateHTML(json, extensions)
}
