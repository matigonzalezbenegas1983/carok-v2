"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Brand } from "@/lib/supabase/types"

const FEATURED_BRANDS = [
  "Toyota","Ford","Volkswagen","Chevrolet","Honda",
  "BMW","Mercedes-Benz","Audi","Jeep","Hyundai",
]

export function BrandsShowcase({ brands }: { brands: Brand[] }) {
  const displayed = brands.filter((b) => FEATURED_BRANDS.includes(b.name)).slice(0, 10)
  const rest = brands.filter((b) => !FEATURED_BRANDS.includes(b.name))

  return (
    <section className="section-dark">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Marcas disponibles
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Las marcas que más querés
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-5 gap-3 sm:grid-cols-6 lg:grid-cols-10"
        >
          {displayed.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.08, y: -2 }}
            >
              <Link
                href={`/catalogo?brand=${brand.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center transition-colors hover:border-brand/40 hover:bg-brand/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink text-xs font-bold">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    brand.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-[10px] font-medium text-surface/60 leading-tight">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {brands.length > 10 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              href="/catalogo"
              className="text-sm text-surface/50 underline underline-offset-4 hover:text-brand transition-colors"
            >
              Ver todas las marcas disponibles →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
