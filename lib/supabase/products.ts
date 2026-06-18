import { createServerSupabaseClient } from "./server"
import type { Product, ProductImage, TablesInsert, TablesUpdate } from "./types"

export type ProductWithImages = Product & { product_images: ProductImage[] }

// ── Listar productos activos (catálogo público) ───────────────
export async function listActiveProducts(opts?: {
  categoryId?: string
  storeId?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 20)
    .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 20) - 1)

  if (opts?.categoryId) query = query.eq("category_id", opts.categoryId)
  if (opts?.storeId)    query = query.eq("store_id", opts.storeId)
  if (opts?.search)     query = query.ilike("name", `%${opts.search}%`)

  const { data } = await query
  return data ?? []
}

// ── Producto individual con imágenes ─────────────────────────
export async function getProductBySlug(
  slug: string
): Promise<ProductWithImages | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single()
  return data as ProductWithImages | null
}

// ── Seller: mis productos ────────────────────────────────────
export async function getMyProducts(storeId: string): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
  return data ?? []
}

// ── Seller: crear producto ────────────────────────────────────
export async function createProduct(
  product: TablesInsert<"products">
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()
  return { data, error: error?.message ?? null }
}

// ── Seller: actualizar producto ──────────────────────────────
export async function updateProduct(
  productId: string,
  updates: TablesUpdate<"products">
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
  return { error: error?.message ?? null }
}

// ── Seller: soft-delete (status = 'deleted') ─────────────────
export async function deleteProduct(
  productId: string
): Promise<{ error: string | null }> {
  return updateProduct(productId, { status: "deleted" })
}

// ── Seller: subir imagen de producto ─────────────────────────
export async function uploadProductImage(
  storeId: string,
  productId: string,
  file: File,
  opts?: { isCover?: boolean; altText?: string; sortOrder?: number }
): Promise<{ url: string | null; error: string | null }> {
  const ALLOWED: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/gif":  "gif",
  }
  const ext = ALLOWED[file.type]
  if (!ext) return { url: null, error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP o GIF." }

  const supabase = await createServerSupabaseClient()
  const path = `${storeId}/${productId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file)

  if (uploadError) return { url: null, error: uploadError.message }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path)

  await supabase.from("product_images").insert({
    product_id: productId,
    url: urlData.publicUrl,
    alt_text: opts?.altText,
    is_cover: opts?.isCover ?? false,
    sort_order: opts?.sortOrder ?? 0,
  })

  return { url: urlData.publicUrl, error: null }
}
