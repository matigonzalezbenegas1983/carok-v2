"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import type { VehicleImage } from "@/lib/supabase/types"

type Props = {
  images: VehicleImage[]
  title: string
  thumbnail?: string | null
}

export function ImageGallery({ images, title, thumbnail }: Props) {
  const all = (() => {
    const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    if (thumbnail && !sorted.find((i) => i.url === thumbnail)) {
      return [
        { id: "thumb", url: thumbnail, alt: title, is_primary: true, sort_order: -1, vehicle_id: "", created_at: null },
        ...sorted,
      ]
    }
    return sorted
  })()

  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() => setCurrent((c) => (c - 1 + all.length) % all.length), [all.length])
  const next = useCallback(() => setCurrent((c) => (c + 1) % all.length), [all.length])

  if (all.length === 0) {
    return (
      <div className="aspect-[16/10] flex items-center justify-center rounded-2xl bg-surface text-5xl opacity-30">
        🚗
      </div>
    )
  }

  return (
    <>
      {/* Main viewer */}
      <div className="space-y-3">
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface/30 cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={all[current].url}
                alt={all[current].alt ?? title}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          {all.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-void/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-void/90"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-void/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-void/90"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom icon */}
          <div className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-void/60 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4" />
          </div>

          {/* Counter */}
          {all.length > 1 && (
            <div className="absolute left-3 bottom-3 rounded-lg bg-void/60 px-2.5 py-1 text-xs text-white/70">
              {current + 1}/{all.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {all.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {all.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrent(i)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all ${
                  i === current
                    ? "ring-2 ring-brand ring-offset-1"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `Imagen ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-void/95 backdrop-blur-md"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(false)}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative max-h-[85vh] max-w-5xl w-full px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative aspect-[16/10]"
                >
                  <Image
                    src={all[current].url}
                    alt={all[current].alt ?? title}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {all.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
