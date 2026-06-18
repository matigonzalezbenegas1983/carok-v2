import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function SellerDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", session.user.id)
    .single()

  if (profile?.role === "buyer") redirect("/dashboard/seller/onboarding")

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, status")
    .eq("owner_id", session.user.id)
    .single()

  // Seller sin tienda aún (race condition) → onboarding
  if (profile?.role === "seller" && !store) redirect("/dashboard/seller/onboarding")

  const { data: products } = await supabase
    .from("products")
    .select("id, status")
    .eq("store_id", store?.id ?? "")

  const activeCount = products?.filter((p) => p.status === "active").length  ?? 0
  const draftCount  = products?.filter((p) => p.status === "draft").length   ?? 0
  const pausedCount = products?.filter((p) => p.status === "paused").length  ?? 0

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-void px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <p className="text-xs text-surface/50 uppercase tracking-widest font-medium">
            Marketplace
          </p>
          <h1 className="font-bold text-white text-lg leading-tight">
            {store?.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-surface/60">{profile?.full_name}</span>
          <Link href="/dashboard/seller/products/new" className="btn-primary text-xs px-4 py-1.5">
            + Producto
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Aviso tienda pendiente */}
        {store?.status === "pending" && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex gap-3 items-start">
            <span className="text-amber-500 text-lg shrink-0">⏳</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Tienda en revisión</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Un administrador la activará pronto. Podés cargar productos en borrador mientras tanto.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Activos"   value={activeCount} variant="brand" />
          <StatCard label="Borradores" value={draftCount}  variant="surface" />
          <StatCard label="Pausados"  value={pausedCount} variant="muted" />
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickLink
            href="/dashboard/seller/products"
            title="Mis productos"
            desc="Ver, editar y gestionar el catálogo"
            icon="📦"
          />
          <QuickLink
            href="/dashboard/seller/store"
            title="Mi tienda"
            desc="Editar logo, nombre y descripción"
            icon="🏪"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, variant,
}: {
  label: string
  value: number
  variant: "brand" | "surface" | "muted"
}) {
  const styles = {
    brand:   "bg-brand text-white",
    surface: "bg-white border border-surface-dark text-ink",
    muted:   "bg-surface-dark/40 text-ink/70",
  }
  return (
    <div className={`rounded-2xl p-5 ${styles[variant]}`}>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-70">{label}</p>
    </div>
  )
}

function QuickLink({
  href, title, desc, icon,
}: {
  href: string
  title: string
  desc: string
  icon: string
}) {
  return (
    <Link href={href}
      className="card p-5 flex gap-4 items-start hover:border-brand transition-colors group">
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <p className="font-semibold text-void group-hover:text-brand transition-colors">
          {title}
        </p>
        <p className="text-xs text-ink/50 mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}
