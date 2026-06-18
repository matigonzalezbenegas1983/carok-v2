"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Car, Tag, Users, Settings,
  ExternalLink, LogOut, ChevronRight,
} from "lucide-react"
import { useSession } from "@/hooks/use-session"
import { signOut } from "@/lib/supabase/auth"

const NAV = [
  { href: "/admin",             label: "Dashboard",  icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/vehiculos",   label: "Vehículos",  icon: Car,             adminOnly: false },
  { href: "/admin/marcas",      label: "Marcas",     icon: Tag,             adminOnly: true  },
  { href: "/admin/vendedores",  label: "Vendedores", icon: Users,           adminOnly: true  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { isAdmin, profile } = useSession()

  const links = NAV.filter((n) => !n.adminOnly || isAdmin)

  async function handleSignOut() {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col bg-void border-r border-white/8">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-white/8">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="CarOK"
            width={100}
            height={36}
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-brand/15 text-brand"
                  : "text-surface/50 hover:bg-white/8 hover:text-surface"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-xl bg-brand/10"
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon className="relative h-4 w-4 flex-shrink-0" />
              <span className="relative">{item.label}</span>
              {active && (
                <ChevronRight className="relative ml-auto h-3 w-3 opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/8 px-3 py-3 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-surface/40 hover:bg-white/8 hover:text-surface transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Ver sitio
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-surface/40 hover:bg-white/8 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>

        {/* User chip */}
        <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/10 px-3 py-2">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-surface/80 truncate">
              {profile?.full_name ?? "Admin"}
            </p>
            <p className="text-[10px] text-surface/40">{isAdmin ? "Administrador" : "Vendedor"}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
