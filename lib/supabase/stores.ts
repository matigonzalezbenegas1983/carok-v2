import { createClient } from "./client"
import type { Store, TablesUpdate } from "./types"

// ── Ver tienda por slug (pública) ────────────────────────────
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single()
  return data
}

// ── Tienda del seller autenticado ────────────────────────────
export async function getMyStore(): Promise<Store | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", session.user.id)
    .single()
  return data
}

// ── Seller: registrarse como vendedor y crear tienda ─────────
export async function becomeSeller(
  storeName: string,
  storeSlug: string,
  description?: string
): Promise<{ storeId: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("become_seller", {
    p_store_name: storeName,
    p_store_slug: storeSlug,
    p_description: description,
  })
  return { storeId: data ?? null, error: error?.message ?? null }
}

// ── Seller: actualizar su tienda ─────────────────────────────
export async function updateMyStore(
  storeId: string,
  updates: TablesUpdate<"stores">
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
  return { error: error?.message ?? null }
}

// ── Seller: subir logo/banner ────────────────────────────────
export async function uploadStoreAsset(
  storeId: string,
  file: File,
  type: "logo" | "banner"
): Promise<{ url: string | null; error: string | null }> {
  const ALLOWED: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
  }
  const ext = ALLOWED[file.type]
  if (!ext) return { url: null, error: "Tipo de archivo no permitido. Usá JPG, PNG o WebP." }

  const supabase = createClient()
  const path = `${storeId}/${type}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(path, file, { upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from("store-assets").getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
