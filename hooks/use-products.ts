"use client"

import { useEffect, useState, useCallback } from "react"
import { listActiveProducts } from "@/lib/supabase/products"
import type { Product } from "@/lib/supabase/types"

type Options = {
  categoryId?: string
  storeId?: string
  search?: string
  limit?: number
}

type ProductsState = {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProducts(opts?: Options): ProductsState {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listActiveProducts(opts)
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }, [opts?.categoryId, opts?.storeId, opts?.search, opts?.limit])

  useEffect(() => { fetch() }, [fetch])

  return { products, loading, error, refetch: fetch }
}
