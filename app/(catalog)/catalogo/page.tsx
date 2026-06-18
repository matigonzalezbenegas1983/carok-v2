import type { Metadata } from "next"
import { Suspense } from "react"
import { SlidersHorizontal } from "lucide-react"
import { listVehicles } from "@/lib/supabase/vehicles"
import { getAllBrands } from "@/lib/supabase/brands"
import { VehicleCard } from "@/components/catalog/vehicle-card"
import { FiltersPanel } from "@/components/catalog/filters-panel"
import type { VehicleFilters, BodyType, VehicleCondition, FuelType, TransmissionType } from "@/lib/supabase/types"
import { SORT_OPTIONS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Catálogo de vehículos — CarOK",
  description: "Explorá nuestro catálogo completo de vehículos: SUVs, sedanes, pickups, 0km y usados con financiación propia.",
  robots: { index: true, follow: true },
}

type PageProps = {
  searchParams: Promise<{
    q?: string; brand?: string; body_type?: string
    condition?: string; fuel_type?: string; transmission?: string
    year_min?: string; year_max?: string
    price_min?: string; price_max?: string
    sort?: string; page?: string
  }>
}

const VALID_BODY_TYPES    = ["sedan","suv","pickup","hatchback","coupe","convertible","van","camioneta"]
const VALID_CONDITIONS    = ["nuevo","usado","certificado"]
const VALID_FUELS         = ["nafta","diesel","hibrido","electrico","gnc"]
const VALID_TRANSMISSIONS = ["manual","automatico","cvt"]

export default async function CatalogoPage({ searchParams }: PageProps) {
  const sp = await searchParams

  const filters: VehicleFilters = {
    q:            sp.q,
    brand:        sp.brand,
    body_type:    VALID_BODY_TYPES.includes(sp.body_type ?? "")    ? sp.body_type as BodyType             : undefined,
    condition:    VALID_CONDITIONS.includes(sp.condition ?? "")    ? sp.condition as VehicleCondition      : undefined,
    fuel_type:    VALID_FUELS.includes(sp.fuel_type ?? "")         ? sp.fuel_type as FuelType              : undefined,
    transmission: VALID_TRANSMISSIONS.includes(sp.transmission ?? "") ? sp.transmission as TransmissionType : undefined,
    year_min:     sp.year_min  ? Number(sp.year_min)  : undefined,
    year_max:     sp.year_max  ? Number(sp.year_max)  : undefined,
    price_min:    sp.price_min ? Number(sp.price_min) : undefined,
    price_max:    sp.price_max ? Number(sp.price_max) : undefined,
    sort:         (sp.sort as VehicleFilters["sort"]) ?? "newest",
    page:         sp.page ? Number(sp.page) : 1,
  }

  const [{ vehicles, total, page, pages }, brands] = await Promise.all([
    listVehicles(filters),
    getAllBrands(),
  ])

  return (
    <div className="container-xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Catálogo de vehículos</h1>
        <p className="mt-1 text-sm text-ink/50">{total} vehículos disponibles</p>
      </div>

      <div className="flex items-start gap-8">
        {/* Sidebar filtros */}
        <Suspense>
          <FiltersPanel brands={brands} totalCount={total} />
        </Suspense>

        {/* Contenido principal */}
        <div className="min-w-0 flex-1">
          {/* Sort bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/50">
              Mostrando {vehicles.length} de {total}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-ink/30" />
              <form className="flex items-center gap-2">
                {Object.entries(sp).map(([k, v]) =>
                  k !== "sort" && v ? (
                    <input key={k} type="hidden" name={k} value={v} />
                  ) : null,
                )}
                <select
                  name="sort"
                  defaultValue={filters.sort}
                  className="select w-44 py-1.5 text-sm"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-secondary ml-1 text-sm">
                  Ordenar
                </button>
              </form>
            </div>
          </div>

          {/* Grid */}
          {vehicles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-3 text-4xl">🔍</p>
              <p className="font-semibold text-ink">No encontramos vehículos</p>
              <p className="mt-1 text-sm text-ink/50">Probá ajustando los filtros</p>
              <a href="/catalogo" className="btn-primary mt-5 inline-flex">
                Ver todos
              </a>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {page > 1 && (
                <PaginationLink searchParams={sp} targetPage={page - 1} label="← Anterior" />
              )}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <PaginationLink
                    key={p}
                    searchParams={sp}
                    targetPage={p}
                    label={String(p)}
                    active={p === page}
                  />
                ))}
              {page < pages && (
                <PaginationLink searchParams={sp} targetPage={page + 1} label="Siguiente →" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaginationLink({
  searchParams, targetPage, label, active = false,
}: {
  searchParams: Record<string, string | undefined>
  targetPage: number
  label: string
  active?: boolean
}) {
  const qs = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== "page") qs.set(k, v)
  })
  qs.set("page", String(targetPage))

  return (
    <a
      href={`/catalogo?${qs.toString()}`}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand text-white"
          : "border border-surface-dark bg-white text-ink hover:border-brand/50"
      }`}
    >
      {label}
    </a>
  )
}
