"use client"

import { motion } from "framer-motion"

const PILLARS = [
  { number: "01", title: "Inspección 150 puntos", desc: "Cada vehículo es revisado en profundidad antes de publicarse." },
  { number: "02", title: "Garantía incluida",     desc: "Respaldo real post-venta para tu tranquilidad." },
  { number: "03", title: "Financiación propia",   desc: "Cuotas accesibles sin necesidad de banco." },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0 },
}

export function AboutSection() {
  return (
    <section className="bg-ink py-24 sm:py-32">
      <div className="container-xl">

        {/* Label */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-6 flex items-center gap-3"
        >
          <div className="h-px w-8 bg-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand">
            Nuestra agencia
          </span>
        </motion.div>

        {/* Titular */}
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tight text-white"
        >
          Calidad premium.<br />
          <span className="text-surface/40">Transparencia garantizada.</span>
        </motion.h2>

        {/* Descripción */}
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mt-6 max-w-xl text-base leading-relaxed text-surface/45"
        >
          Somos la concesionaria de referencia en Córdoba Capital para quienes
          buscan vehículos usados de categoría. Más de 10 años conectando personas
          con el auto que realmente merecen.
        </motion.p>

        {/* Pilares */}
        <div className="mt-16 grid gap-px border border-white/5 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="bg-void px-8 py-10 transition-colors hover:bg-white/[0.03]"
            >
              <span className="text-[11px] font-semibold tabular-nums text-brand/60">{p.number}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-surface/40">{p.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
