import { generateHTML } from "@tiptap/html"
import { StarterKit } from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { Underline } from "@tiptap/extension-underline"
import type { TipTapDocument } from "@/types"

const extensions = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
]

export default function PostBody({ body }: { body: TipTapDocument }) {
  let html = ""
  try {
    html = generateHTML(body, extensions)
  } catch {
    html = "<p>Content unavailable.</p>"
  }

  return (
    <div
      className="prose-church"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
