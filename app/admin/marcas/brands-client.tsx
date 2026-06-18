"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { Brand } from "@/lib/supabase/types"
import { slugify } from "@/lib/utils"

export function BrandsClient({ initialBrands }: { initialBrands: Brand[] }) {
  const router  = useRouter()
  const [name, setName]   = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "Error al guardar")
      }
      setName("")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, brandName: string) {
    if (!confirm(`¿Eliminar la marca "${brandName}"?`)) return
    const res = await fetch(`/api/admin/marcas/${id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
    else alert("Error al eliminar")
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="card p-5 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la marca"
          className="input flex-1"
          required
        />
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Agregar
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* List */}
      <div className="card overflow-hidden divide-y divide-surface-dark/30">
        {initialBrands.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">{b.name}</p>
              <p className="text-xs text-ink/40 font-mono">{b.slug}</p>
            </div>
            <button
              onClick={() => handleDelete(b.id, b.name)}
              className="p-1.5 rounded-lg text-ink/30 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
