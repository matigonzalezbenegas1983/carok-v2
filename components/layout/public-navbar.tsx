"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useSession } from "@/hooks/use-session"
import { signOut } from "@/lib/supabase/auth"

const NAV_LINKS = [
  { href: "/catalogo",   label: "Catálogo" },
  { href: "/catalogo?condition=nuevo",  label: "0 km" },
  { href: "/catalogo?condition=usado",  label: "Usados" },
  { href: "/catalogo?body_type=suv",    label: "SUVs" },
]

export function PublicNavbar() {
  const { email, isAdmin, isSeller, loading } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen]           = useState(false)
  const [scrolled, setScrolled]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const dashHref = isAdmin ? "/admin" : "/dashboard/seller"

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-void/95 backdrop-blur-md border-b border-white/8 shadow-lg"
            : "bg-void"
        }`}
      >
        <div className="container-xl flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="CarOK"
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm text-surface/70 transition-colors hover:bg-white/8 hover:text-surface"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 lg:flex">
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded-lg bg-white/10" />
            ) : email ? (
              <>
                <Link
                  href={dashHref}
                  className="text-sm text-surface/70 hover:text-surface transition-colors"
                >
                  {isAdmin ? "Panel Admin" : "Mi Dashboard"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-surface/70 hover:bg-white/8 hover:text-surface transition-all"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-surface/70 hover:text-surface transition-colors"
                >
                  Entrar
                </Link>
                <Link href="/catalogo" className="btn-primary py-1.5 text-sm px-4">
                  Ver autos
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-surface/70 hover:bg-white/8 lg:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-void border-b border-white/10 px-4 py-4 flex flex-col gap-2 lg:hidden"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl px-4 py-3 text-sm text-surface/70 hover:bg-white/8 hover:text-surface transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/10 pt-3 flex flex-col gap-2">
              {email ? (
                <>
                  <Link href={dashHref} className="btn-secondary text-sm">
                    {isAdmin ? "Panel Admin" : "Mi Dashboard"}
                  </Link>
                  <button onClick={handleSignOut} className="btn-ghost text-sm text-surface/60">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-secondary text-sm">
                    Entrar
                  </Link>
                  <Link href="/catalogo" className="btn-primary text-sm">
                    Ver catálogo
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
