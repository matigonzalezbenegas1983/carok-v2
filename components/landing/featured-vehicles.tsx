"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { VehicleCard } from "@/components/catalog/vehicle-card"
import type { VehicleCard as VehicleCardType } from "@/lib/supabase/types"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export function FeaturedVehicles({ vehicles }: { vehicles: VehicleCardType[] }) {
  if (vehicles.length === 0) return null

  return (
    <section className="section bg-white">
      <div className="container-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
              Destacados
            </p>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              Vehículos seleccionados
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden items-center gap-1 text-sm font-medium text-brand hover:gap-2 transition-all sm:flex"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <VehicleCard vehicle={v} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/catalogo" className="btn-secondary gap-1">
            Ver todos los vehículos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
