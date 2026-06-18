"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteVehicleButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/vehiculos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert("Error al eliminar el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
      title="Eliminar"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  )
}
