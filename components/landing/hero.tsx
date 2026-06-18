"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const scale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.93])

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-void"
    >
      {/* Glow ambiental centrado */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 2.5 }}
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[160px]"
        />
      </div>

      {/* Todo el contenido — se desvanece al scrollear */}
      <motion.div
        style={{ opacity, scale }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        {/* Logo */}
        <div className="flex items-baseline overflow-hidden">
          <motion.span
            initial={{ x: -180, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(4rem,15vw,11rem)] font-bold leading-none tracking-[-0.04em] text-white"
          >
            Car
          </motion.span>
          <motion.span
            initial={{ x: 180, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(4rem,15vw,11rem)] font-bold leading-none tracking-[-0.04em] text-brand"
          >
            OK
          </motion.span>
        </div>

        {/* Línea */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 h-px w-52 origin-center bg-surface/15"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.7 }}
          className="mt-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-surface/35"
        >
          Córdoba Capital&nbsp;&nbsp;·&nbsp;&nbsp;Vehículos Premium
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.9 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-surface/25">
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-surface/25 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
