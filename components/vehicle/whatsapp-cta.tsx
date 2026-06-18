"use client"

import { motion } from "framer-motion"
import { MessageCircle, Phone } from "lucide-react"
import { WHATSAPP_DEFAULT, SITE_URL } from "@/lib/constants"
import { buildVehicleWhatsApp, buildWhatsAppUrl, formatPrice } from "@/lib/utils"
import type { VehicleFull } from "@/lib/supabase/types"

export function WhatsAppCta({ vehicle }: { vehicle: VehicleFull }) {
  const phone = vehicle.profiles?.phone ?? WHATSAPP_DEFAULT

  const waUrl = buildVehicleWhatsApp(
    phone,
    vehicle.title,
    vehicle.slug,
    SITE_URL,
  )

  const callUrl = `tel:+${phone.replace(/\D/g, "")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card p-6 space-y-4 sticky top-24"
    >
      {/* Precio */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Precio</p>
        <p className="text-3xl font-bold text-brand mt-1">{formatPrice(vehicle.price)}</p>
        <p className="text-xs text-ink/40 mt-0.5">IVA incluido — Precio de lista</p>
      </div>

      <hr className="border-surface-dark/50" />

      {/* Acciones */}
      <div className="space-y-2.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full py-3 text-base gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          Consultar por WhatsApp
        </a>

        <a
          href={callUrl}
          className="btn-secondary w-full py-3 text-base gap-2"
        >
          <Phone className="h-4 w-4" />
          Llamar ahora
        </a>
      </div>

      {/* Trust */}
      <div className="rounded-xl bg-brand/5 border border-brand/15 p-3 text-xs text-ink/60 space-y-1">
        <p className="font-semibold text-brand">✓ Vehículo verificado</p>
        <p>Documentación en regla · Garantía disponible</p>
        <p>Respondemos en menos de 1 hora</p>
      </div>
    </motion.div>
  )
}
