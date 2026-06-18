import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Eye, Car, Star, ShoppingBag, TrendingUp } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { formatNumber } from "@/lib/utils"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Dashboard — CarOK Admin",
  robots: { index: false },
}

async function getStats() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: total },
    { count: active },
    { count: featured },
    { count: sold },
    { data: recent },
    { data: topViews },
  ] = await Promise.all([
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("featured", true),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "sold"),
    supabase.from("vehicles").select("id,title,slug,status,price,created_at,brands(name)")
      .order("created_at", { ascending: false }).limit(6),
    supabase.from("vehicles").select("id,title,slug,views,thumbnail_url")
      .eq("status", "active").order("views", { ascending: false }).limit(5),
  ])

  return { total, active, featured, sold, recent: recent ?? [], topViews: topViews ?? [] }
}

export default async function AdminDashboard() {
  const { total, active, featured, sold, recent, topViews } = await getStats()

  const CARDS = [
    { label: "Total vehículos",   value: total ?? 0,    icon: Car,        color: "text-ink bg-surface/50" },
    { label: "Publicados",        value: active ?? 0,   icon: Eye,        color: "text-brand bg-brand/10" },
    { label: "Destacados",        value: featured ?? 0, icon: Star,       color: "text-amber-600 bg-amber-50" },
    { label: "Vendidos",          value: sold ?? 0,     icon: ShoppingBag,color: "text-blue-600 bg-blue-50" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-ink/50 text-sm mt-1">Resumen de la plataforma</p>
        </div>
        <Link href="/admin/vehiculos/nuevo" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Nuevo vehículo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {CARDS.map((c) => (
          <div key={c.label} className="card p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{formatNumber(c.value)}</p>
              <p className="text-xs text-ink/50 mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Recientes */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-dark/50">
            <h2 className="font-semibold text-ink text-sm">Últimos vehículos</h2>
            <Link href="/admin/vehiculos" className="text-xs text-brand hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-surface-dark/30">
            {recent.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-ink/40">
                No hay vehículos aún.{" "}
                <Link href="/admin/vehiculos/nuevo" className="text-brand underline">
                  Crear el primero
                </Link>
              </p>
            )}
            {recent.map((v: any) => (
              <Link
                key={v.id}
                href={`/admin/vehiculos/${v.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-surface/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{v.title}</p>
                  <p className="text-xs text-ink/40">
                    {v.brands?.name} · {new Date(v.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <span className={`badge text-[11px] ${STATUS_COLORS[v.status] ?? "badge-gray"}`}>
                  {STATUS_LABELS[v.status] ?? v.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top vistas */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-dark/50 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-ink text-sm">Más vistos</h2>
          </div>
          <div className="p-3 space-y-2">
            {topViews.length === 0 && (
              <p className="py-6 text-center text-sm text-ink/40">Sin datos aún</p>
            )}
            {topViews.map((v: any, i) => (
              <Link
                key={v.id}
                href={`/autos/${v.slug}`}
                target="_blank"
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface/30 transition-colors"
              >
                <span className="w-5 text-xs font-bold text-ink/30 text-center">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink truncate">{v.title}</p>
                  <p className="text-[11px] text-ink/40">{formatNumber(v.views ?? 0)} vistas</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/admin/vehiculos/nuevo", label: "Nuevo auto",   icon: "🚗" },
          { href: "/admin/marcas",          label: "Marcas",       icon: "🏷️" },
          { href: "/admin/vendedores",      label: "Vendedores",   icon: "👥" },
          { href: "/catalogo",             label: "Ver catálogo", icon: "🌐" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card flex flex-col items-center gap-2 p-4 text-center hover:border-brand/40 hover:shadow-md transition-all"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-ink">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
