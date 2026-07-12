"use client"

import { useState, useRef } from "react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = "images",
  label = "Image",
}: ImageUploadProps) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setError("")
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Only JPEG, PNG, WebP or GIF allowed.")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File must be under 8MB.")
      return
    }
    const ext = file.name.split(".").pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const storageRef = ref(storage, filename)
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { setError(`Upload failed: ${err.message}`); setProgress(null) },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        onChange(url)
        setProgress(null)
      }
    )
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
        {label}
      </label>
      {value ? (
        <div className="relative">
          <div className="relative w-full aspect-video bg-stone-100 rounded-xl overflow-hidden">
            <Image src={value} alt="Uploaded" fill className="object-cover" sizes="600px" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 hover:border-[#c9a84c] transition-colors cursor-pointer p-10 text-center rounded-xl"
        >
          {progress !== null ? (
            <div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full mb-3">
                <div className="h-1.5 bg-[#c9a84c] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-stone-500">{progress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500">Drop image or click to upload</p>
              <p className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP — max 8MB</p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
