"use client"

import { useEffect, useMemo, useState } from "react"
import { X, ZoomIn, ZoomOut } from "lucide-react"

interface ImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt?: string
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export default function ImageLightbox({ open, onOpenChange, src, alt }: ImageLightboxProps) {
  const [scale, setScale] = useState(1)

  const canRender = useMemo(() => open && !!src, [open, src])

  useEffect(() => {
    if (!open) {
      setScale(1)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  if (!canRender) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 z-0"
        onClick={() => onOpenChange(false)}
        aria-label="Cerrar"
      />

      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 text-gray-900"
          onClick={() => setScale((s) => clamp(Number((s + 0.2).toFixed(2)), 1, 4))}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 text-gray-900"
          onClick={() => setScale((s) => clamp(Number((s - 0.2).toFixed(2)), 1, 4))}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
       
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 text-gray-900"
          onClick={() => onOpenChange(false)}
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto z-10">
        <div className="max-w-[95vw] max-h-[90vh]">
          <img
            src={src}
            alt={alt || "Imagen"}
            style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            className="block max-w-full max-h-[90vh] select-none"
            onWheel={(e) => {
              e.preventDefault()
              const delta = e.deltaY
              setScale((s) => {
                const next = delta > 0 ? s - 0.1 : s + 0.1
                return clamp(Number(next.toFixed(2)), 1, 4)
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
