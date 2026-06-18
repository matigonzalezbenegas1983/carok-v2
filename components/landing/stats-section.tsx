"use client"

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import { Car, Users, MapPin, Award } from "lucide-react"

const STATS = [
  { icon: Car,    value: 500,  suffix: "+", label: "Vehículos disponibles" },
  { icon: Users,  value: 2800, suffix: "+", label: "Clientes satisfechos" },
  { icon: MapPin, value: 24,   suffix: "",  label: "Provincias con envío" },
  { icon: Award,  value: 10,   suffix: " años", label: "En el mercado" },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("es-AR"))
  const spring = useSpring(count, { stiffness: 60, damping: 15 })

  useEffect(() => {
    if (inView) spring.set(target)
  }, [inView, spring, target])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="section-dark border-y border-white/5">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Números que hablan
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            La confianza se construye con resultados
          </h2>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-8 text-center backdrop-blur-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/20 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="text-4xl font-bold text-white">
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-surface/50">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
