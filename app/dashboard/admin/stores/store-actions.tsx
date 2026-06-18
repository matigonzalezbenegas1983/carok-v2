"use client"

import { useRouter } from "next/navigation"
import type { StoreStatus } from "@/lib/supabase/types"

export function AdminStoreActions({
  storeId,
  currentStatus,
}: {
  storeId: string
  currentStatus: StoreStatus
}) {
  const router = useRouter()

  async function changeStatus(status: StoreStatus) {
    const response = await fetch(`/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.error || "No se pudo actualizar el estado")
    }

    router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      {currentStatus !== "active" && (
        <button onClick={() => changeStatus("active")}
          className="text-xs rounded-lg bg-brand/10 text-brand px-3 py-1.5 hover:bg-brand/20 font-medium transition-colors">
          Activar
        </button>
      )}
      {currentStatus !== "suspended" && (
        <button onClick={() => changeStatus("suspended")}
          className="text-xs rounded-lg bg-red-50 text-red-600 px-3 py-1.5 hover:bg-red-100 font-medium transition-colors">
          Suspender
        </button>
      )}
      {currentStatus === "suspended" && (
        <button onClick={() => changeStatus("pending")}
          className="text-xs rounded-lg bg-surface text-ink/60 px-3 py-1.5 hover:bg-surface-dark font-medium transition-colors">
          Revisar
        </button>
      )}
    </div>
  )
}
