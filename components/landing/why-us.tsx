"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Banknote, Truck, Headphones, FileText, Star } from "lucide-react"

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Vehículos verificados",
    desc:  "Cada vehículo pasa por una inspección de 150 puntos antes de publicarse.",
    color: "text-brand bg-brand/10",
  },
  {
    icon: Banknote,
    title: "Financiación propia",
    desc:  "Tasas preferenciales y planes flexibles de hasta 60 cuotas fijas.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: Truck,
    title: "Entrega a domicilio",
    desc:  "Llevamos tu auto a cualquier punto del país, sin costo adicional.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    desc:  "Nuestro equipo está disponible por WhatsApp todos los días del año.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: FileText,
    title: "Documentación en orden",
    desc:  "Gestión completa de transferencia, patentes y seguro desde el primer día.",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: Star,
    title: "Garantía extendida",
    desc:  "Hasta 24 meses de garantía en vehículos certificados con revisiones incluidas.",
    color: "text-brand bg-brand/10",
  },
]

export function WhyUs() {
  return (
    <section className="section bg-surface/20">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-xl"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
            Por qué elegirnos
          </p>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">
            Comprá con la tranquilidad de estar bien asesorado.
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card-hover flex flex-col gap-4 p-6"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
