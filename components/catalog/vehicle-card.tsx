"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gauge, Fuel, Settings2, Eye } from "lucide-react"
import type { VehicleCard } from "@/lib/supabase/types"
import {
  FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_LABELS,
} from "@/lib/constants"
import { formatPrice, formatMileage, formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

const CONDITION_STYLE: Record<string, string> = {
  nuevo:       "badge-green",
  usado:       "badge-gray",
  certificado: "badge-blue",
}

export function VehicleCard({
  vehicle,
  className,
}: {
  vehicle: VehicleCard
  className?: string
}) {
  const thumb = vehicle.thumbnail_url
  const conditionLabel = CONDITION_LABELS[vehicle.condition] ?? vehicle.condition

  return (
    <Link href={`/autos/${vehicle.slug}`} className={cn("block group", className)}>
      <motion.article
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,.10)" }}
        transition={{ duration: 0.25 }}
        className="card overflow-hidden h-full flex flex-col"
      >
        {/* Imagen */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface/50">
          {thumb ? (
            <Image
              src={thumb}
              alt={vehicle.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl opacity-20">
              🚗
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className={`badge text-[11px] ${CONDITION_STYLE[vehicle.condition]}`}>
              {conditionLabel}
            </span>
            {vehicle.featured && (
              <span className="badge bg-amber-400 text-amber-900 text-[11px]">⭐ Destacado</span>
            )}
          </div>

          {vehicle.views ? (
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-lg bg-void/60 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              {formatNumber(vehicle.views)}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Brand + Model */}
          <div>
            {vehicle.brands && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                {vehicle.brands.name}
              </p>
            )}
            <h3 className="font-semibold text-ink line-clamp-1 group-hover:text-brand transition-colors">
              {vehicle.title}
            </h3>
            <p className="text-xs text-ink/50">{vehicle.year}</p>
          </div>

          {/* Specs row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/50">
            {vehicle.mileage != null && (
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {vehicle.mileage === 0 ? "0 km" : formatMileage(vehicle.mileage)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Fuel className="h-3 w-3" />
              {FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type}
            </span>
            <span className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" />
              {TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-brand">{formatPrice(vehicle.price)}</p>
            </div>
            <span className="text-xs font-medium text-brand/80 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver más →
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

// ── Skeleton ────────────────────────────────────────────────
export function VehicleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-6 w-1/2 rounded mt-4" />
      </div>
    </div>
  )
}
