"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { X, Filter } from "lucide-react"
import type { Brand } from "@/lib/supabase/types"
import {
  BODY_TYPE_OPTIONS, FUEL_OPTIONS,
  TRANSMISSION_OPTIONS, CONDITION_OPTIONS,
} from "@/lib/constants"

type Props = {
  brands: Brand[]
  totalCount: number
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-surface-dark/50 pb-5 last:border-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">{label}</p>
      {children}
    </div>
  )
}

export function FiltersPanel({ brands, totalCount }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const get = (key: string) => params.get(key) ?? ""

  const push = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete("page")
      router.push(`/catalogo?${next.toString()}`)
    },
    [params, router],
  )

  function clearAll() {
    router.push("/catalogo")
  }

  const hasFilters = ["brand", "body_type", "condition", "fuel_type", "transmission",
    "year_min", "year_max", "price_min", "price_max"].some((k) => params.has(k))

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="card p-5 space-y-5 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink/40" />
            <span className="text-sm font-semibold text-ink">Filtros</span>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-brand hover:underline"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
        </div>
        <p className="text-xs text-ink/40 -mt-2">{totalCount} resultados</p>

        {/* Búsqueda */}
        <FilterGroup label="Buscar">
          <input
            type="search"
            defaultValue={get("q")}
            placeholder="Modelo, marca..."
            className="input text-sm"
            onChange={(e) => push("q", e.target.value)}
          />
        </FilterGroup>

        {/* Marca */}
        <FilterGroup label="Marca">
          <select
            value={get("brand")}
            onChange={(e) => push("brand", e.target.value)}
            className="select text-sm"
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </FilterGroup>

        {/* Tipo */}
        <FilterGroup label="Tipo de carrocería">
          <div className="flex flex-wrap gap-1.5">
            {BODY_TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() =>
                  push("body_type", get("body_type") === o.value ? "" : o.value)
                }
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  get("body_type") === o.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-surface-dark text-ink/60 hover:border-brand/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Condición */}
        <FilterGroup label="Condición">
          <div className="flex flex-col gap-2">
            {CONDITION_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  value={o.value}
                  checked={get("condition") === o.value}
                  onChange={() =>
                    push("condition", get("condition") === o.value ? "" : o.value)
                  }
                  className="accent-brand"
                />
                <span className="text-sm text-ink/70 group-hover:text-ink">{o.label}</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {/* Combustible */}
        <FilterGroup label="Combustible">
          <div className="flex flex-col gap-2">
            {FUEL_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  value={o.value}
                  checked={get("fuel_type") === o.value}
                  onChange={() =>
                    push("fuel_type", get("fuel_type") === o.value ? "" : o.value)
                  }
                  className="accent-brand rounded"
                />
                <span className="text-sm text-ink/70 group-hover:text-ink">{o.label}</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {/* Transmisión */}
        <FilterGroup label="Transmisión">
          <div className="flex gap-2">
            {TRANSMISSION_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() =>
                  push("transmission", get("transmission") === o.value ? "" : o.value)
                }
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  get("transmission") === o.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-surface-dark text-ink/60 hover:border-brand/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Año */}
        <FilterGroup label="Año">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Desde"
              defaultValue={get("year_min")}
              min={1990}
              max={2025}
              onChange={(e) => push("year_min", e.target.value)}
              className="input text-sm w-full"
            />
            <span className="text-ink/40 text-sm">–</span>
            <input
              type="number"
              placeholder="Hasta"
              defaultValue={get("year_max")}
              min={1990}
              max={2025}
              onChange={(e) => push("year_max", e.target.value)}
              className="input text-sm w-full"
            />
          </div>
        </FilterGroup>

        {/* Precio */}
        <FilterGroup label="Precio">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Mín"
              defaultValue={get("price_min")}
              onChange={(e) => push("price_min", e.target.value)}
              className="input text-sm w-full"
            />
            <span className="text-ink/40 text-sm">–</span>
            <input
              type="number"
              placeholder="Máx"
              defaultValue={get("price_max")}
              onChange={(e) => push("price_max", e.target.value)}
              className="input text-sm w-full"
            />
          </div>
        </FilterGroup>
      </div>
    </aside>
  )
}
