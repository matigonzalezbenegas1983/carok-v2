"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MessageCircle, ArrowRight } from "lucide-react"
import { WHATSAPP_DEFAULT } from "@/lib/constants"
import { buildWhatsAppUrl } from "@/lib/utils"

export function CtaSection() {
  const waUrl = buildWhatsAppUrl(
    WHATSAPP_DEFAULT,
    "Hola! Me gustaría asesorarme sobre los vehículos disponibles en CarOK.",
  )

  return (
    <section className="section bg-brand">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            ¿Listo para manejar?
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-5xl max-w-2xl">
            Tu próximo auto te está esperando.
          </h2>
          <p className="text-lg text-white/70 max-w-lg">
            Hablá con un asesor ahora mismo o explorá nuestro catálogo completo.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-white text-brand hover:bg-surface px-7 py-3 text-base font-semibold gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Hablar por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="btn border-2 border-white/40 text-white hover:bg-white/10 px-7 py-3 text-base font-semibold gap-1"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
