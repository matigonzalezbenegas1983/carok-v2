import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Vendedores — CarOK Admin",
  robots: { index: false },
}

export default async function VendedoresPage() {
  const supabase = await createServerSupabaseClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["seller", "admin"])
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Vendedores</h1>
        <p className="text-ink/50 text-sm mt-1">{profiles?.length ?? 0} usuarios con acceso al panel</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-dark/50 bg-surface/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40 hidden sm:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-dark/30">
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-surface/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">
                      {p.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{p.full_name ?? "Sin nombre"}</p>
                      <p className="text-xs text-ink/40">{p.phone ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.role === "admin" ? "badge-green" : "badge-gray"}`}>
                    {p.role === "admin" ? "Admin" : "Vendedor"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/40 text-xs hidden sm:table-cell">
                  {new Date(p.created_at).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
