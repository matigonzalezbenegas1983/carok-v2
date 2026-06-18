"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, X, Plus, ImagePlus } from "lucide-react"
import type { VehicleFull, Brand } from "@/lib/supabase/types"
import {
  BODY_TYPE_OPTIONS, FUEL_OPTIONS,
  TRANSMISSION_OPTIONS, CONDITION_OPTIONS,
  VEHICLE_STATUS_OPTIONS,
} from "@/lib/constants"
import { slugify } from "@/lib/utils"

type Props = {
  brands: Brand[]
  vehicle?: VehicleFull
  mode: "create" | "edit"
}

type FormState = {
  title: string; slug: string; brand_id: string; model: string
  year: number; price: number; mileage: number
  fuel_type: string; transmission: string; color: string
  body_type: string; condition: string; description: string
  features: string[]; status: string; featured: boolean
}

export function VehicleForm({ brands, vehicle, mode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featureInput, setFeatureInput] = useState("")
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(
    vehicle?.vehicle_images.map((i) => i.url) ?? [],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentYear = new Date().getFullYear()

  const [form, setForm] = useState<FormState>({
    title:        vehicle?.title ?? "",
    slug:         vehicle?.slug  ?? "",
    brand_id:     vehicle?.brand_id ?? "",
    model:        vehicle?.model ?? "",
    year:         vehicle?.year ?? currentYear,
    price:        vehicle?.price ?? 0,
    mileage:      vehicle?.mileage ?? 0,
    fuel_type:    vehicle?.fuel_type ?? "nafta",
    transmission: vehicle?.transmission ?? "manual",
    color:        vehicle?.color ?? "",
    body_type:    vehicle?.body_type ?? "",
    condition:    vehicle?.condition ?? "usado",
    description:  vehicle?.description ?? "",
    features:     vehicle?.features ?? [],
    status:       vehicle?.status ?? "draft",
    featured:     vehicle?.featured ?? false,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(v: string) {
    set("title", v)
    if (mode === "create") {
      set("slug", slugify(`${v} ${form.year}`))
    }
  }

  function addFeature() {
    const f = featureInput.trim()
    if (f && !form.features.includes(f)) {
      set("features", [...form.features, f])
      setFeatureInput("")
    }
  }

  function removeFeature(f: string) {
    set("features", form.features.filter((x) => x !== f))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    )
    setPreviewFiles((prev) => [...prev, ...valid])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...form,
        price:    Number(form.price),
        mileage:  Number(form.mileage),
        year:     Number(form.year),
        brand_id: form.brand_id || null,
        body_type: form.body_type || null,
        color:    form.color || null,
      }

      const url    = mode === "create" ? "/api/vehiculos" : `/api/vehiculos/${vehicle!.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Error al guardar")
      }

      const data = await res.json()
      const vehicleId = data.id ?? vehicle!.id

      // Upload new images
      if (previewFiles.length > 0) {
        for (const file of previewFiles) {
          const fd = new FormData()
          fd.append("file", file)
          fd.append("vehicleId", vehicleId)
          await fetch("/api/upload", { method: "POST", body: fd })
        }
      }

      router.push("/admin/vehiculos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-2">
          <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-6">

          {/* Info básica */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Información básica
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-form">Título del anuncio *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Toyota Corolla XEI 2023"
                  className="input mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-form">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  className="input mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <label className="label-form">Marca</label>
                <select
                  value={form.brand_id}
                  onChange={(e) => set("brand_id", e.target.value)}
                  className="select mt-1"
                >
                  <option value="">Sin marca</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-form">Modelo *</label>
                <input
                  required
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Corolla"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="label-form">Año *</label>
                <input
                  required
                  type="number"
                  min={1980}
                  max={currentYear + 1}
                  value={form.year}
                  onChange={(e) => set("year", Number(e.target.value))}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="label-form">Color</label>
                <input
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="Blanco"
                  className="input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Precio y km */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Precio y kilometraje
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-form">Precio (ARS) *</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="label-form">Kilometraje</label>
                <input
                  type="number"
                  min={0}
                  value={form.mileage}
                  onChange={(e) => set("mileage", Number(e.target.value))}
                  className="input mt-1"
                />
                <p className="text-xs text-ink/40 mt-1">0 para vehículos 0 km</p>
              </div>
            </div>
          </div>

          {/* Técnico */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Detalles técnicos
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label-form">Combustible</label>
                <select
                  value={form.fuel_type}
                  onChange={(e) => set("fuel_type", e.target.value)}
                  className="select mt-1"
                >
                  {FUEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-form">Transmisión</label>
                <select
                  value={form.transmission}
                  onChange={(e) => set("transmission", e.target.value)}
                  className="select mt-1"
                >
                  {TRANSMISSION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-form">Carrocería</label>
                <select
                  value={form.body_type}
                  onChange={(e) => set("body_type", e.target.value)}
                  className="select mt-1"
                >
                  <option value="">Seleccionar</option>
                  {BODY_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label-form">Condición</label>
              <div className="mt-2 flex gap-3">
                {CONDITION_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={o.value}
                      checked={form.condition === o.value}
                      onChange={() => set("condition", o.value)}
                      className="accent-brand"
                    />
                    <span className="text-sm text-ink/70">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Descripción
            </h2>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describí el vehículo: estado, historial, extras..."
              rows={5}
              className="textarea w-full"
            />
          </div>

          {/* Equipamiento */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Equipamiento / características
            </h2>
            <div className="flex gap-2">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Ej: Aire acondicionado, Cámara de retroceso..."
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addFeature}
                className="btn-secondary px-3"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.features.map((f) => (
                  <span key={f} className="badge badge-green gap-1.5 pr-1">
                    {f}
                    <button
                      type="button"
                      onClick={() => removeFeature(f)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
              Imágenes
            </h2>

            {/* Existing images */}
            {uploadedUrls.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {uploadedUrls.map((url, i) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Imagen ${i + 1}`}
                      className="h-20 w-28 rounded-xl object-cover border border-surface-dark"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedUrls((prev) => prev.filter((u) => u !== url))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New previews */}
            {previewFiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {previewFiles.map((f, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-20 w-28 rounded-xl object-cover border-2 border-brand/40"
                    />
                    <div className="absolute bottom-1 left-1 rounded bg-brand/80 px-1 py-0.5 text-[9px] text-white">
                      nueva
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-dark py-8 text-ink/40 hover:border-brand/50 hover:text-brand transition-colors"
            >
              <ImagePlus className="h-8 w-8" />
              <p className="text-sm">Hacer click para subir imágenes</p>
              <p className="text-xs">JPG, PNG, WebP · Máx 10 MB c/u</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Estado */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-ink text-sm">Publicación</h2>

            <div>
              <label className="label-form">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="select mt-1"
              >
                {VEHICLE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("featured", !form.featured)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  form.featured ? "bg-brand" : "bg-surface-dark"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    form.featured ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-ink/70">Vehículo destacado</span>
            </label>
          </div>

          {/* Guardar */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 gap-2"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-4 w-4" /> {mode === "create" ? "Publicar vehículo" : "Guardar cambios"}</>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary w-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
