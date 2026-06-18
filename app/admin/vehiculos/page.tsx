import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Plus, Eye, Pencil, ExternalLink } from "lucide-react"
import { adminListVehicles } from "@/lib/supabase/vehicles"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import { formatPrice, formatMileage } from "@/lib/utils"
import { DeleteVehicleButton } from "./delete-button"

export const metadata: Metadata = {
  title: "Vehículos — CarOK Admin",
  robots: { index: false },
}

export default async function VehiculosPage() {
  const vehicles = await adminListVehicles()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Vehículos</h1>
          <p className="text-ink/50 text-sm mt-1">{vehicles.length} vehículos registrados</p>
        </div>
        <Link href="/admin/vehiculos/nuevo" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-dark/50 bg-surface/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Vehículo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40 hidden sm:table-cell">
                  Año / km
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/40 hidden lg:table-cell">
                  Vistas
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dark/30">
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/40">
                    No hay vehículos.{" "}
                    <Link href="/admin/vehiculos/nuevo" className="text-brand underline">
                      Crear el primero
                    </Link>
                  </td>
                </tr>
              )}
              {vehicles.map((v: any) => (
                <tr key={v.id} className="hover:bg-surface/20 transition-colors">
                  {/* Imagen + título */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-surface/50">
                        {v.thumbnail_url ? (
                          <Image
                            src={v.thumbnail_url}
                            alt={v.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg opacity-30">🚗</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate max-w-[200px]">{v.title}</p>
                        <p className="text-xs text-ink/40">{v.brands?.name ?? "Sin marca"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-ink/60 hidden sm:table-cell">
                    <p>{v.year}</p>
                    <p className="text-xs">{v.mileage === 0 ? "0 km" : formatMileage(v.mileage ?? 0)}</p>
                  </td>

                  <td className="px-4 py-3 font-semibold text-brand">
                    {formatPrice(v.price)}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`badge text-[11px] ${STATUS_COLORS[v.status] ?? "badge-gray"}`}>
                      {STATUS_LABELS[v.status] ?? v.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-ink/40 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {v.views ?? 0}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/autos/${v.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-ink/40 hover:bg-surface/50 hover:text-ink transition-colors"
                        title="Ver en sitio"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/vehiculos/${v.id}`}
                        className="p-1.5 rounded-lg text-ink/40 hover:bg-surface/50 hover:text-brand transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteVehicleButton id={v.id} title={v.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
