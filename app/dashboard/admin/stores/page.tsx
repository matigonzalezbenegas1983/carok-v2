import { redirect } from "next/navigation"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AdminStoreActions } from "./store-actions"

const STATUS_CLASS: Record<string, string> = {
  pending:   "badge-amber",
  active:    "badge-green",
  suspended: "badge-red",
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pendiente",
  active:    "Activa",
  suspended: "Suspendida",
}

export default async function AdminStoresPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") redirect("/")

  const { data: stores } = await supabase
    .from("stores")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false })

  const pending = stores?.filter((s) => s.status === "pending").length ?? 0

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-void px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-surface/50 uppercase tracking-widest font-medium">Admin</p>
          <h1 className="font-bold text-white text-lg">Tiendas</h1>
        </div>
        {pending > 0 && (
          <span className="badge-amber">
            {pending} pendiente{pending > 1 ? "s" : ""}
          </span>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-2">
        {stores?.map((store) => (
          <div key={store.id}
            className="card flex items-center gap-4 px-4 py-3">

            {/* Logo placeholder */}
            <div className="relative w-10 h-10 rounded-lg bg-surface shrink-0 overflow-hidden border border-surface-dark flex items-center justify-center text-ink/20">
              {store.logo_url
                ? <Image src={store.logo_url} alt={store.name} fill sizes="40px" className="object-cover" />
                : "🏪"
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-void">{store.name}</p>
              <p className="text-xs text-ink/40">
                {(store.profiles as any)?.full_name ?? "Sin nombre"} · /{store.slug}
              </p>
            </div>

            <span className={STATUS_CLASS[store.status]}>
              {STATUS_LABEL[store.status]}
            </span>

            <AdminStoreActions storeId={store.id} currentStatus={store.status as any} />
          </div>
        ))}

        {!stores?.length && (
          <div className="text-center py-20 text-ink/40">
            <p>No hay tiendas registradas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
