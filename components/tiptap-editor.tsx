"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { Underline } from "@tiptap/extension-underline"
import { CharacterCount } from "@tiptap/extension-character-count"
import { useEffect, useCallback } from "react"
import type { TipTapDocument } from "@/types"

const extensions = [
  StarterKit,
  Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
  CharacterCount,
]

interface TipTapEditorProps {
  value: TipTapDocument | null
  onChange: (doc: TipTapDocument) => void
  onImageInsert?: () => Promise<string | null>
  minHeight?: number
}

type ToolbarAction =
  | "bold" | "italic" | "underline" | "h2" | "h3"
  | "bulletList" | "orderedList" | "blockquote" | "link" | "image"

export default function TipTapEditor({
  value,
  onChange,
  onImageInsert,
  minHeight = 400,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions,
    content: value ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as TipTapDocument)
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone prose-lg max-w-none focus:outline-none font-body",
        style: `min-height: ${minHeight}px; padding: 24px`,
      },
    },
  })

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      editor.commands.setContent(value)
    }
  }, [])

  const handleToolbar = useCallback(
    async (action: ToolbarAction) => {
      if (!editor) return
      switch (action) {
        case "bold": editor.chain().focus().toggleBold().run(); break
        case "italic": editor.chain().focus().toggleItalic().run(); break
        case "underline": editor.chain().focus().toggleUnderline().run(); break
        case "h2": editor.chain().focus().toggleHeading({ level: 2 }).run(); break
        case "h3": editor.chain().focus().toggleHeading({ level: 3 }).run(); break
        case "bulletList": editor.chain().focus().toggleBulletList().run(); break
        case "orderedList": editor.chain().focus().toggleOrderedList().run(); break
        case "blockquote": editor.chain().focus().toggleBlockquote().run(); break
        case "link": {
          const url = window.prompt("URL")
          if (url) editor.chain().focus().setLink({ href: url }).run()
          break
        }
        case "image": {
          if (onImageInsert) {
            const url = await onImageInsert()
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }
          break
        }
      }
    },
    [editor, onImageInsert]
  )

  if (!editor) return null

  const btn = (action: ToolbarAction, label: string, active?: boolean) => (
    <button
      key={action}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); handleToolbar(action) }}
      className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
        active
          ? "bg-[#1a2744] border-[#1a2744] text-white"
          : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-900"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-stone-100 bg-stone-50">
        {btn("bold", "B", editor.isActive("bold"))}
        {btn("italic", "I", editor.isActive("italic"))}
        {btn("underline", "U", editor.isActive("underline"))}
        <span className="w-px bg-stone-200 self-stretch" />
        {btn("h2", "H2", editor.isActive("heading", { level: 2 }))}
        {btn("h3", "H3", editor.isActive("heading", { level: 3 }))}
        <span className="w-px bg-stone-200 self-stretch" />
        {btn("bulletList", "List", editor.isActive("bulletList"))}
        {btn("orderedList", "Ordered", editor.isActive("orderedList"))}
        {btn("blockquote", "Quote", editor.isActive("blockquote"))}
        <span className="w-px bg-stone-200 self-stretch" />
        {btn("link", "Link", editor.isActive("link"))}
        {onImageInsert && btn("image", "Image")}
      </div>
      <EditorContent editor={editor} />
      <div className="px-6 py-2 border-t border-stone-100 text-right">
        <span className="text-xs text-stone-400">
          {editor.storage.characterCount?.words() ?? 0} words
        </span>
      </div>
    </div>
  )
}
