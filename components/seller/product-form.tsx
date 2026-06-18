"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/supabase/types"

type Props = { storeId: string; product?: Product }

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ProductForm({ storeId, product }: Props) {
  const router = useRouter()
  const isEditing = !!product

  const [form, setForm] = useState({
    name:          product?.name ?? "",
    slug:          product?.slug ?? "",
    description:   product?.description ?? "",
    price:         product?.price?.toString() ?? "",
    compare_price: product?.compare_price?.toString() ?? "",
    stock:         product?.stock?.toString() ?? "0",
    sku:           product?.sku ?? "",
    status:        product?.status ?? "draft",
  })
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugManual ? f.slug : slugify(name) }))
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const price = parseFloat(form.price)
    const comparePrice = form.compare_price ? parseFloat(form.compare_price) : null

    if (!isFinite(price) || price < 0) {
      setError("Precio inválido")
      setLoading(false)
      return
    }
    if (comparePrice !== null && (!isFinite(comparePrice) || comparePrice < 0)) {
      setError("Precio tachado inválido")
      setLoading(false)
      return
    }

    const payload = {
      name:          form.name,
      slug:          form.slug,
      description:   form.description || null,
      price,
      compare_price: comparePrice,
      stock:         parseInt(form.stock),
      sku:           form.sku || null,
      status:        form.status as Product["status"],
      store_id:      storeId,
    }

    const endpoint = isEditing ? `/api/products/${product.id}` : "/api/products"
    const method = isEditing ? "PATCH" : "POST"
    const requestBody = isEditing
      ? payload
      : { ...payload, storeId }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(result.error || "No se pudo guardar el producto")
      setLoading(false)
      return
    }

    router.push("/dashboard/seller/products")
    router.refresh()
  }

  const fieldClass = "input"
  const labelClass = "block text-sm font-medium text-ink mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre *</label>
          <input type="text" required value={form.name} onChange={handleNameChange}
            className={fieldClass} placeholder="Ej: Casco Integral Negro" />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>
            URL slug *
            <span className="ml-2 text-xs font-normal text-ink/40">auto-generado</span>
          </label>
          <div className="flex rounded-lg border border-surface-dark focus-within:ring-2 focus-within:ring-brand overflow-hidden">
            <span className="px-3 py-2 text-sm text-ink/40 bg-surface shrink-0 border-r border-surface-dark">
              /p/
            </span>
            <input type="text" required value={form.slug}
              onChange={(e) => { setSlugManual(true); set("slug", slugify(e.target.value)) }}
              className="flex-1 px-3 py-2 text-sm outline-none font-mono bg-white" />
          </div>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea rows={4} value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="input resize-none" placeholder="Describí el producto..." />
        </div>

        <div>
          <label className={labelClass}>Precio *</label>
          <input type="number" required min="0" step="0.01" value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={fieldClass} placeholder="0.00" />
        </div>

        <div>
          <label className={labelClass}>Precio tachado</label>
          <input type="number" min="0" step="0.01" value={form.compare_price}
            onChange={(e) => set("compare_price", e.target.value)}
            className={fieldClass} placeholder="0.00" />
        </div>

        <div>
          <label className={labelClass}>Stock</label>
          <input type="number" min="0" value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>SKU</label>
          <input type="text" value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            className={`${fieldClass} font-mono`} placeholder="SKU-001" />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Estado</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={`${fieldClass} bg-white`}>
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Cancelar
        </button>
      </div>
    </form>
  )
}
