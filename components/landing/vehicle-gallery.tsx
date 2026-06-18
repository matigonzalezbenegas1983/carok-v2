"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Car, ArrowRight } from "lucide-react"
import { cn, formatPrice, formatMileage } from "@/lib/utils"
import type { VehicleCard } from "@/lib/supabase/types"

interface Props {
  all:        VehicleCard[]
  camionetas: VehicleCard[]
  sedan:      VehicleCard[]
  hatchback:  VehicleCard[]
  suv:        VehicleCard[]
}

const TABS = [
  { key: "all",       label: "Todos"      },
  { key: "camioneta", label: "Camionetas" },
  { key: "sedan",     label: "Sedán"      },
  { key: "hatchback", label: "Hatchback"  },
  { key: "suv",       label: "SUV"        },
] as const

type TabKey = (typeof TABS)[number]["key"]

function GalleryCard({ vehicle }: { vehicle: VehicleCard }) {
  return (
    <Link href={`/autos/${vehicle.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
        {vehicle.thumbnail_url ? (
          <Image
            src={vehicle.thumbnail_url}
            alt={vehicle.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-14 w-14 text-surface/15" />
          </div>
        )}
        {/* Overlay degradado */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/95 via-void/50 to-transparent px-4 pb-4 pt-10">
          <p className="text-sm font-semibold text-white leading-tight line-clamp-1">
            {vehicle.title}
          </p>
          <p className="mt-0.5 text-sm font-bold text-brand">
            {formatPrice(vehicle.price)}
          </p>
          {vehicle.mileage !== null && (
            <p className="mt-0.5 text-[11px] text-surface/40">
              {formatMileage(vehicle.mileage)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-white/5 py-20 text-center md:col-span-4">
      <Car className="mb-4 h-12 w-12 text-surface/15" />
      <p className="text-sm font-medium text-surface/30">Próximamente disponibles</p>
    </div>
  )
}

export function VehicleGallery({ all, camionetas, sedan, hatchback, suv }: Props) {
  const [active, setActive] = useState<TabKey>("all")

  const map: Record<TabKey, VehicleCard[]> = {
    all,
    camioneta: camionetas,
    sedan,
    hatchback,
    suv,
  }

  const vehicles = map[active] ?? []

  return (
    <section className="bg-void py-24 sm:py-32">
      <div className="container-xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8 bg-brand" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand">
                Nuestro stock
              </span>
            </div>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight tracking-tight text-white">
              Encontrá tu vehículo
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-2 text-sm font-medium text-surface/40 transition-colors hover:text-white"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors",
                active === tab.key
                  ? "text-white"
                  : "text-surface/45 hover:text-surface/70",
              )}
            >
              {active === tab.key && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-brand/20 ring-1 ring-brand/30"
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Grid — 4 vehículos por pantalla */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
          >
            {vehicles.length > 0 ? (
              vehicles.map((v) => <GalleryCard key={v.id} vehicle={v} />)
            ) : (
              <EmptyState />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
