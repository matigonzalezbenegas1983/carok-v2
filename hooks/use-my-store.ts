"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyStore } from "@/lib/supabase/stores"
import type { Store } from "@/lib/supabase/types"

type StoreState = {
  store: Store | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMyStore(): StoreState {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyStore()
      setStore(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar la tienda")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { store, loading, error, refetch: fetch }
}
