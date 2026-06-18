"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useMyStore } from "@/hooks/use-my-store"
import { updateMyStore, uploadStoreAsset } from "@/lib/supabase/stores"

export default function StoreSettingsPage() {
  const { store, loading, refetch } = useMyStore()
  const [form, setForm] = useState({ name: "", description: "", slug: "" })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (store) setForm({ name: store.name, description: store.description ?? "", slug: store.slug })
  }, [store])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await updateMyStore(store.id, {
      name: form.name,
      description: form.description || null,
    })

    if (error) { setError(error) } else { setSuccess(true); await refetch() }
    setSaving(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!store || !e.target.files?.[0]) return
    const { url, error } = await uploadStoreAsset(store.id, e.target.files[0], "logo")
    if (url) await updateMyStore(store.id, { logo_url: url })
    if (error) setError(error)
    await refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-void px-6 py-4">
        <Link href="/dashboard/seller"
          className="text-xs text-surface/50 hover:text-surface transition-colors">
          ← Dashboard
        </Link>
        <h1 className="font-bold text-white text-lg mt-0.5">Configuración de tienda</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Logo */}
        <section className="card p-6">
          <h2 className="font-semibold text-void mb-4">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-surface shrink-0 overflow-hidden border border-surface-dark">
              {store?.logo_url
                ? <Image src={store.logo_url} alt="Logo de la tienda" fill sizes="64px" className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl text-ink/20">🏪</div>
              }
            </div>
            <label className="btn-outline cursor-pointer">
              Cambiar logo
              <input type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-xs text-ink/40">JPG, PNG o WebP · máx 3 MB</p>
          </div>
        </section>

        {/* Datos */}
        <section className="card p-6">
          <h2 className="font-semibold text-void mb-4">Información</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Nombre de la tienda
              </label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">URL</label>
              <input type="text" disabled value={`/tienda/${form.slug}`}
                className="input bg-surface cursor-not-allowed font-mono text-ink/40" />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Descripción</label>
              <textarea rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input resize-none" />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-brand bg-brand/10 rounded-lg px-3 py-2 font-medium">
                ✓ Cambios guardados
              </p>
            )}

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
